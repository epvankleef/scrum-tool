export type StickyColumn =
  | 'product_backlog'
  | 'sprint_backlog'
  | 'todo'
  | 'busy'
  | 'done';

export type StickyKind = 'story' | 'task';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green';

export type SprintStatus = 'draft' | 'active' | 'closed';

export type DefinitionType = 'fun' | 'done';

export type RetroCategory = 'went_well' | 'improve' | 'action';

export interface Project {
  id: string;
  name: string;
  team_name: string;
  team_members: string[];
  share_token: string;
  end_date: string | null;
  current_sprint_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  number: number;
  goal: string;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  created_at: string;
  updated_at: string;
}

export interface Sticky {
  id: string;
  project_id: string;
  sprint_id: string | null;
  kind: StickyKind;
  board_column: StickyColumn;
  position: number;
  parent_sticky_id: string | null;
  text: string;
  color: StickyColor;
  assignee_initials: string | null;
  estimate: number | null;
  rotation: number;
  created_at: string;
  updated_at: string;
}

export interface DefinitionEntry {
  id: string;
  project_id: string;
  type: DefinitionType;
  text: string;
  position: number;
  created_at: string;
}

export interface StandupLog {
  id: string;
  sprint_id: string;
  member_name: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export interface RetroEntry {
  id: string;
  sprint_id: string;
  category: RetroCategory;
  text: string;
  created_at: string;
}

export interface BurndownSnapshot {
  id: string;
  sprint_id: string;
  date: string;
  remaining_estimate: number;
  created_at: string;
}
