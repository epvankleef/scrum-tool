'use client';
import { useEffect, useState } from 'react';
import type { Sticky, StickyColor, StickyColumn } from '@/lib/types';
import { STICKY_COLORS } from '../board-config';

interface Props {
  sprintBacklogStories: { id: string; number: number; text: string; color: StickyColor }[];
  targetColumn: StickyColumn;
  onCreate: (input: {
    parent_sticky_id: string;
    text: string;
    color: StickyColor;
    assignee_initials: string | null;
    estimate: number | null;
  }) => Promise<Sticky | void>;
  onClose: () => void;
}

export default function TaskCreator({ sprintBacklogStories, targetColumn, onCreate, onClose }: Props) {
  const [parent, setParent] = useState(sprintBacklogStories[0]?.id ?? '');
  const [text, setText] = useState('');
  const [color, setColor] = useState<StickyColor>(sprintBacklogStories[0]?.color ?? 'yellow');
  const [assignee, setAssignee] = useState('');
  const [estimate, setEstimate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    if (!parent || submitting) return;
    setSubmitting(true);
    try {
      const estimateNum = estimate.trim() === '' ? null : Number(estimate);
      await onCreate({
        parent_sticky_id: parent,
        text,
        color,
        assignee_initials: assignee.trim() === '' ? null : assignee.trim().slice(0, 3).toUpperCase(),
        estimate: estimateNum != null && !Number.isNaN(estimateNum) ? estimateNum : null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const columnLabel = targetColumn === 'busy' ? 'Busy' : 'To Do';

  if (sprintBacklogStories.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full max-w-md bg-white rounded-lg shadow-2xl p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-2">Nog geen user story in Sprint Backlog</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Een taak hoort altijd bij een user story. Voeg eerst een story toe in
            de <b>Sprint Backlog</b> &mdash; of sleep er een vanuit de Product Backlog.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
            >
              Oké
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">Nieuwe taak in {columnLabel}</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Kies bij welke user story deze taak hoort.
        </p>

        <label className="block text-sm font-medium mb-1">User story</label>
        <select
          className="w-full border rounded p-2 mb-4 text-sm"
          value={parent}
          onChange={(e) => setParent(e.target.value)}
        >
          {sprintBacklogStories.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.number} &middot; {s.text.slice(0, 60) || '(lege story)'}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Tekst</label>
        <textarea
          autoFocus
          className="w-full border rounded p-2 mb-4 text-base resize-none"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="bv. Mockup tekenen, API endpoint bouwen..."
        />

        <label className="block text-sm font-medium mb-1">Kleur</label>
        <div className="flex gap-2 mb-4">
          {STICKY_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColor(c.key)}
              aria-label={c.label}
              className="w-8 h-8 rounded border-2"
              style={{ background: c.hex, borderColor: color === c.key ? '#2b2618' : 'transparent' }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1">Initialen</label>
            <input
              className="w-full border rounded p-2 text-base"
              maxLength={3}
              placeholder="bv. EV"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Schatting</label>
            <input
              type="number"
              step="0.5"
              className="w-full border rounded p-2 text-base"
              placeholder="uren/punten"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm rounded hover:bg-neutral-100"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-full bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
