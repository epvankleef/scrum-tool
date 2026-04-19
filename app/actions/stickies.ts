'use server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Sticky, StickyColumn, StickyColor, StickyKind } from '@/lib/types';

async function projectIdForToken(shareToken: string): Promise<string> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('project')
    .select('id')
    .eq('share_token', shareToken)
    .single();
  if (error || !data) throw new Error('project not found for share token');
  return data.id as string;
}

function randomRotation(range = 1.5): number {
  return Math.round((Math.random() * range * 2 - range) * 10) / 10;
}

function validateColumnForKind(kind: StickyKind, column: StickyColumn): void {
  const storyCols: StickyColumn[] = ['product_backlog', 'sprint_backlog', 'done'];
  const taskCols: StickyColumn[] = ['todo', 'busy', 'done'];
  const allowed = kind === 'story' ? storyCols : taskCols;
  if (!allowed.includes(column)) {
    throw new Error(`${kind} kan niet in kolom ${column}`);
  }
}

export async function createSticky(
  shareToken: string,
  input: {
    kind: StickyKind;
    board_column: StickyColumn;
    sprint_id?: string | null;
    color?: StickyColor;
    text?: string;
    parent_sticky_id?: string | null;
    assignee_initials?: string | null;
    estimate?: number | null;
  }
): Promise<Sticky> {
  validateColumnForKind(input.kind, input.board_column);
  if (input.kind === 'task' && !input.parent_sticky_id) {
    throw new Error('task heeft een user story (parent) nodig');
  }

  const db = supabaseAdmin();
  const project_id = await projectIdForToken(shareToken);

  if (input.kind === 'task' && input.parent_sticky_id) {
    const { data: parent } = await db
      .from('sticky')
      .select('kind, board_column, project_id')
      .eq('id', input.parent_sticky_id)
      .maybeSingle();
    if (!parent || parent.project_id !== project_id || parent.kind !== 'story') {
      throw new Error('parent must be a story in this project');
    }
    if (parent.board_column !== 'sprint_backlog') {
      throw new Error('TASK_PARENT_NOT_IN_SPRINT_BACKLOG');
    }
  }

  const { data: last } = await db
    .from('sticky')
    .select('position')
    .eq('project_id', project_id)
    .eq('board_column', input.board_column)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (last?.position ?? 0) + 1;

  const { data, error } = await db
    .from('sticky')
    .insert({
      project_id,
      sprint_id: input.sprint_id ?? null,
      kind: input.kind,
      board_column: input.board_column,
      position: nextPosition,
      parent_sticky_id: input.parent_sticky_id ?? null,
      text: input.text ?? '',
      color: input.color ?? 'yellow',
      assignee_initials: input.assignee_initials ?? null,
      estimate: input.estimate ?? null,
      rotation: input.kind === 'story' ? randomRotation(0.8) : randomRotation(),
    })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'failed to create sticky');
  return data as Sticky;
}

export async function updateSticky(
  shareToken: string,
  stickyId: string,
  fields: Partial<Pick<Sticky, 'text' | 'color' | 'assignee_initials' | 'estimate' | 'board_column' | 'position' | 'sprint_id' | 'parent_sticky_id'>>
): Promise<Sticky[]> {
  const db = supabaseAdmin();
  const project_id = await projectIdForToken(shareToken);

  // If column is changing, validate against kind.
  // Extra: a story can only move to Done if all its tasks are already Done.
  if (fields.board_column) {
    const { data: current } = await db
      .from('sticky')
      .select('kind')
      .eq('id', stickyId)
      .eq('project_id', project_id)
      .single();
    if (current?.kind) {
      validateColumnForKind(current.kind as StickyKind, fields.board_column);
      if (current.kind === 'story' && fields.board_column === 'done') {
        const { data: tasks } = await db
          .from('sticky')
          .select('board_column')
          .eq('parent_sticky_id', stickyId)
          .eq('project_id', project_id);
        const list = tasks ?? [];
        const hasUnfinished = list.some((t) => t.board_column !== 'done');
        if (hasUnfinished) {
          throw new Error('STORY_NOT_ALL_TASKS_DONE');
        }
      }
    }
  }

  const { data: updated, error } = await db
    .from('sticky')
    .update(fields)
    .eq('id', stickyId)
    .eq('project_id', project_id)
    .select('*')
    .single();
  if (error || !updated) throw new Error(error?.message ?? 'failed to update sticky');

  const touched: Sticky[] = [updated as Sticky];

  // Auto-move parent story to Done when all its tasks are in Done,
  // back to Sprint Backlog when any task leaves Done.
  if (fields.board_column && (updated as Sticky).kind === 'task' && (updated as Sticky).parent_sticky_id) {
    const parentId = (updated as Sticky).parent_sticky_id!;
    const autoMoved = await recomputeStoryAutoDone(project_id, parentId);
    if (autoMoved) touched.push(autoMoved);
  }
  return touched;
}

async function recomputeStoryAutoDone(projectId: string, storyId: string): Promise<Sticky | null> {
  const db = supabaseAdmin();
  const { data: story } = await db
    .from('sticky')
    .select('*')
    .eq('id', storyId)
    .eq('project_id', projectId)
    .maybeSingle();
  if (!story || story.kind !== 'story') return null;

  const { data: tasks } = await db
    .from('sticky')
    .select('id, board_column')
    .eq('parent_sticky_id', storyId)
    .eq('project_id', projectId);
  const list = tasks ?? [];
  if (list.length === 0) return null;

  const allDone = list.every((t) => t.board_column === 'done');
  const desired: StickyColumn = allDone ? 'done' : 'sprint_backlog';

  if (story.board_column === desired) return null;

  const { data: updatedStory, error } = await db
    .from('sticky')
    .update({ board_column: desired })
    .eq('id', storyId)
    .select('*')
    .single();
  if (error || !updatedStory) return null;
  return updatedStory as Sticky;
}

export async function deleteSticky(shareToken: string, stickyId: string): Promise<void> {
  const db = supabaseAdmin();
  const project_id = await projectIdForToken(shareToken);
  const { error } = await db
    .from('sticky')
    .delete()
    .eq('id', stickyId)
    .eq('project_id', project_id);
  if (error) throw new Error(error.message);
}
