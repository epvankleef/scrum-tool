'use client';
import { useMemo, useState, useTransition } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Project, Sticky, StickyColor, StickyColumn } from '@/lib/types';
import { COLUMNS, columnAccepts, stickyColorHex } from './board-config';
import BoardColumn from './components/BoardColumn';
import StickyCard from './components/StickyCard';
import StickyEditor from './components/StickyEditor';
import ProjectHeader from './components/ProjectHeader';
import ProjectSettings from './components/ProjectSettings';
import TaskCreator from './components/TaskCreator';
import { createSticky, updateSticky, deleteSticky } from '@/app/actions/stickies';
import { updateProjectSettings } from '@/app/actions/projects';
import { positionBetween } from '@/lib/fractional-index';

interface Props {
  project: Project;
  initialStickies: Sticky[];
}

export default function BoardClient({ project, initialStickies }: Props) {
  const [projectState, setProjectState] = useState<Project>(project);
  const [stickies, setStickies] = useState<Sticky[]>(initialStickies);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskCreatorFor, setTaskCreatorFor] = useState<StickyColumn | null>(null);
  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null);
  const [, startTransition] = useTransition();

  const stickyById = useMemo(() => {
    const map = new Map<string, Sticky>();
    stickies.forEach((s) => map.set(s.id, s));
    return map;
  }, [stickies]);

  // Story numbering: per project, stories only, sorted by created_at ascending
  const storyNumberMap = useMemo(() => {
    const stories = stickies
      .filter((s) => s.kind === 'story')
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const map = new Map<string, number>();
    stories.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [stickies]);

  const byColumn = useMemo(() => {
    const map: Record<StickyColumn, Sticky[]> = {
      product_backlog: [],
      sprint_backlog: [],
      todo: [],
      busy: [],
      done: [],
    };
    for (const s of [...stickies].sort((a, b) => a.position - b.position)) {
      map[s.board_column].push(s);
    }
    return map;
  }, [stickies]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function mergeStickies(updated: Sticky[]) {
    setStickies((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      updated.forEach((u) => map.set(u.id, u));
      return Array.from(map.values());
    });
  }

  function handleAddSticky(column: StickyColumn) {
    if (column === 'done') return; // geen directe "+" in Done
    if (!columnAccepts(column, 'story') && columnAccepts(column, 'task')) {
      // Todo/Busy → task flow met picker
      setTaskCreatorFor(column);
      return;
    }
    // PB/SB → direct een lege story
    startTransition(async () => {
      try {
        const sticky = await createSticky(projectState.share_token, {
          kind: 'story',
          board_column: column,
          sprint_id: column === 'sprint_backlog' ? projectState.current_sprint_id : null,
        });
        setStickies((prev) => [...prev, sticky]);
        setEditingId(sticky.id);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function handleCreateTask(
    column: StickyColumn,
    input: {
      parent_sticky_id: string;
      text: string;
      color: StickyColor;
      assignee_initials: string | null;
      estimate: number | null;
    }
  ) {
    return new Promise<Sticky | void>((resolve) => {
      startTransition(async () => {
        try {
          const sticky = await createSticky(projectState.share_token, {
            kind: 'task',
            board_column: column,
            sprint_id: projectState.current_sprint_id,
            ...input,
          });
          setStickies((prev) => [...prev, sticky]);
          resolve(sticky);
        } catch (err) {
          console.error(err);
          resolve();
        }
      });
    });
  }

  function handleSaveSticky(id: string, patch: Partial<Sticky>) {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    startTransition(async () => {
      try {
        const updated = await updateSticky(projectState.share_token, id, patch);
        mergeStickies(updated);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function handleDeleteSticky(id: string) {
    const removed = stickyById.get(id);
    if (!removed) return;
    setStickies((prev) => prev.filter((s) => s.id !== id));
    startTransition(async () => {
      try {
        await deleteSticky(projectState.share_token, id);
      } catch (err) {
        console.error(err);
        setStickies((prev) => [...prev, removed].sort((a, b) => a.position - b.position));
      }
    });
  }

  function handleSaveSettings(patch: Partial<Project>) {
    setProjectState((prev) => ({ ...prev, ...patch }));
    startTransition(async () => {
      try {
        await updateProjectSettings(projectState.share_token, patch);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function onDragStart(ev: DragStartEvent) {
    setActiveDragId(ev.active.id);
  }

  function onDragEnd(ev: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = ev;
    if (!over) return;

    const dragged = stickyById.get(String(active.id));
    if (!dragged) return;

    const overIdStr = String(over.id);
    let targetColumn: StickyColumn;
    let targetIndex: number;

    if (overIdStr.startsWith('column:')) {
      targetColumn = overIdStr.slice('column:'.length) as StickyColumn;
      targetIndex = byColumn[targetColumn].length;
    } else {
      const overSticky = stickyById.get(overIdStr);
      if (!overSticky) return;
      targetColumn = overSticky.board_column;
      targetIndex = byColumn[targetColumn].findIndex((s) => s.id === overSticky.id);
      if (targetIndex < 0) targetIndex = byColumn[targetColumn].length;
    }

    // Blokkeer verkeerde kind-naar-kolom moves stilletjes
    if (!columnAccepts(targetColumn, dragged.kind)) return;

    const sameColumn = dragged.board_column === targetColumn;
    const targetList = byColumn[targetColumn].filter((s) => s.id !== dragged.id);
    const clampedIndex = Math.max(0, Math.min(targetIndex, targetList.length));
    const prev = targetList[clampedIndex - 1]?.position ?? null;
    const next = targetList[clampedIndex]?.position ?? null;

    if (sameColumn && prev === dragged.position && next === dragged.position) return;

    const newPosition = positionBetween(prev, next);
    const patch: Partial<Sticky> = { board_column: targetColumn, position: newPosition };
    setStickies((current) => current.map((s) => (s.id === dragged.id ? { ...s, ...patch } : s)));
    startTransition(async () => {
      try {
        const updated = await updateSticky(projectState.share_token, dragged.id, patch);
        mergeStickies(updated);
      } catch (err) {
        console.error(err);
      }
    });
  }

  const sprintBacklogStories = useMemo(
    () =>
      byColumn.sprint_backlog
        .filter((s) => s.kind === 'story')
        .map((s) => ({
          id: s.id,
          number: storyNumberMap.get(s.id) ?? 0,
          text: s.text,
          color: s.color,
        })),
    [byColumn, storyNumberMap]
  );

  const editing = editingId ? stickyById.get(editingId) ?? null : null;
  const activeDragSticky = activeDragId ? stickyById.get(String(activeDragId)) ?? null : null;

  return (
    <>
      <ProjectHeader project={projectState} onOpenSettings={() => setSettingsOpen(true)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className="flex-1 min-h-0 grid gap-3"
          style={{ gridTemplateColumns: COLUMNS.map((c) => `${c.gridSpan}fr`).join(' ') }}
        >
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.key}
              config={col}
              stickies={byColumn[col.key]}
              onAdd={handleAddSticky}
              onOpen={setEditingId}
              draggingStickyId={activeDragId ? String(activeDragId) : null}
              storyNumberMap={storyNumberMap}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDragSticky ? (
            activeDragSticky.kind === 'story' ? (
              <div
                className="story-card story-overlay"
                style={{ background: stickyColorHex(activeDragSticky.color) }}
              >
                <div className="story-badge">
                  Story #{storyNumberMap.get(activeDragSticky.id) ?? '?'}
                </div>
                <div className="story-text">{activeDragSticky.text}</div>
              </div>
            ) : (
              <div
                className="sticky-card sticky-overlay"
                style={{
                  background: stickyColorHex(activeDragSticky.color),
                  ['--sticky-rotate' as string]: `${activeDragSticky.rotation}deg`,
                }}
              >
                <div className="sticky-tape" aria-hidden />
                <div className="sticky-text">{activeDragSticky.text}</div>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>

      {editing && (
        <StickyEditor
          sticky={editing}
          onSave={(patch) => handleSaveSticky(editing.id, patch)}
          onDelete={() => handleDeleteSticky(editing.id)}
          onClose={() => setEditingId(null)}
        />
      )}

      {settingsOpen && (
        <ProjectSettings
          project={projectState}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {taskCreatorFor && (
        <TaskCreator
          targetColumn={taskCreatorFor}
          sprintBacklogStories={sprintBacklogStories}
          onCreate={(input) => handleCreateTask(taskCreatorFor, input)}
          onClose={() => setTaskCreatorFor(null)}
        />
      )}
    </>
  );
}
