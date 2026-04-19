import type { StickyColumn, StickyColor, StickyKind } from '@/lib/types';

export interface ColumnConfig {
  key: StickyColumn;
  label: string;
  gridSpan: number;
  headerBg: string;
  headerFg: string;
  accent: string;
  accepts: StickyKind[];
}

export const COLUMNS: ColumnConfig[] = [
  { key: 'product_backlog', label: 'Product Backlog',  gridSpan: 2, headerBg: '#6b4a8f', headerFg: '#fff', accent: '#6b4a8f', accepts: ['story'] },
  { key: 'sprint_backlog',  label: 'Sprint Backlog',   gridSpan: 2, headerBg: '#8a6cb0', headerFg: '#fff', accent: '#8a6cb0', accepts: ['story'] },
  { key: 'todo',            label: 'To Do',            gridSpan: 3, headerBg: '#d05c8a', headerFg: '#fff', accent: '#d05c8a', accepts: ['task']  },
  { key: 'busy',            label: 'Busy',             gridSpan: 3, headerBg: '#db7a3c', headerFg: '#fff', accent: '#db7a3c', accepts: ['task']  },
  { key: 'done',            label: 'Done',             gridSpan: 3, headerBg: '#6ab16a', headerFg: '#fff', accent: '#6ab16a', accepts: ['story', 'task'] },
];

export function columnAccepts(column: StickyColumn, kind: StickyKind): boolean {
  return COLUMNS.find((c) => c.key === column)?.accepts.includes(kind) ?? false;
}

export const STICKY_COLORS: { key: StickyColor; hex: string; label: string }[] = [
  { key: 'yellow', hex: '#fff176', label: 'geel' },
  { key: 'pink',   hex: '#f8bbd0', label: 'roze' },
  { key: 'blue',   hex: '#b3e5fc', label: 'blauw' },
  { key: 'green',  hex: '#c5e1a5', label: 'groen' },
];

export function stickyColorHex(color: StickyColor): string {
  return STICKY_COLORS.find((c) => c.key === color)?.hex ?? '#fff176';
}
