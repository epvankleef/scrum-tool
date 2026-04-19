'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Sticky } from '@/lib/types';
import { stickyColorHex } from '../board-config';

interface Props {
  sticky: Sticky;
  onOpen: (id: string) => void;
  isDragging?: boolean;
  storyNumber?: number;       // voor stories: eigen nummer, voor tasks: parent-nummer
  parentStoryNumber?: number; // alleen voor tasks
}

export default function StickyCard({ sticky, onOpen, isDragging: externalDragging, storyNumber, parentStoryNumber }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sticky.id,
    data: { type: 'sticky', sticky },
  });

  const dragging = isDragging || externalDragging;
  const baseRotate = sticky.kind === 'story' ? 0 : sticky.rotation ?? 0;
  const isStory = sticky.kind === 'story';

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 120ms ease',
    background: stickyColorHex(sticky.color),
    ['--sticky-rotate' as string]: `${baseRotate}deg`,
  };

  if (isStory) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          if (dragging) return;
          e.stopPropagation();
          onOpen(sticky.id);
        }}
        className="story-card"
        style={style}
      >
        <div className="story-badge">Story #{storyNumber ?? '?'}</div>
        <div className="story-text">
          {sticky.text || <span className="opacity-40">Nieuwe user story &mdash; klik om te bewerken</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (dragging) return;
        e.stopPropagation();
        onOpen(sticky.id);
      }}
      className="sticky-card"
      style={style}
    >
      <div className="sticky-tape" aria-hidden />
      {parentStoryNumber != null && (
        <div className="sticky-parent-badge" title="Bij user story">#{parentStoryNumber}</div>
      )}
      <div className="sticky-text">
        {sticky.text || <span className="opacity-40">Lege taak &mdash; klik om te bewerken</span>}
      </div>
      {(sticky.assignee_initials || sticky.estimate != null) && (
        <div className="sticky-meta">
          {sticky.assignee_initials && <span>({sticky.assignee_initials})</span>}
          {sticky.estimate != null && <span className="ml-1">{sticky.estimate}</span>}
        </div>
      )}
    </div>
  );
}
