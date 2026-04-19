'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Sticky } from '@/lib/types';
import type { ColumnConfig } from '../board-config';
import StickyCard from './StickyCard';

interface Props {
  config: ColumnConfig;
  stickies: Sticky[];
  onAdd: (column: ColumnConfig['key']) => void;
  onOpen: (id: string) => void;
  draggingStickyId: string | null;
  storyNumberMap: Map<string, number>;
}

export default function BoardColumn({ config, stickies, onAdd, onOpen, draggingStickyId, storyNumberMap }: Props) {
  const showAddButton = config.key !== 'done';
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${config.key}`,
    data: { type: 'column', columnKey: config.key },
  });

  return (
    <section className="flex flex-col min-h-0 h-full rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
      <header
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: config.headerBg, color: config.headerFg }}
      >
        <span className="text-sm font-medium tracking-tight truncate">{config.label}</span>
        {showAddButton && (
          <button
            type="button"
            onClick={() => onAdd(config.key)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 transition leading-none text-sm"
            aria-label={`Nieuwe sticky in ${config.label}`}
            title="Nieuwe sticky"
          >
            +
          </button>
        )}
      </header>

      <div
        ref={setNodeRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 bg-[#faf8f3]"
        style={{
          outline: isOver ? `2px dashed ${config.accent}` : 'none',
          outlineOffset: isOver ? '-6px' : 0,
        }}
      >
        <SortableContext
          items={stickies.map((s) => s.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap content-start gap-3">
            {stickies.map((s) => (
              <StickyCard
                key={s.id}
                sticky={s}
                onOpen={onOpen}
                isDragging={draggingStickyId === s.id}
                storyNumber={s.kind === 'story' ? storyNumberMap.get(s.id) : undefined}
                parentStoryNumber={
                  s.kind === 'task' && s.parent_sticky_id
                    ? storyNumberMap.get(s.parent_sticky_id)
                    : undefined
                }
              />
            ))}
            {stickies.length === 0 && (
              <p className="w-full text-xs text-neutral-400 italic py-6 text-center pointer-events-none">
                Leeg &mdash; klik + om toe te voegen
              </p>
            )}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
