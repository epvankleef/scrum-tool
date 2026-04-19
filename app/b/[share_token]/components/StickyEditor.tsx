'use client';
import { useEffect, useState } from 'react';
import type { Sticky, StickyColor } from '@/lib/types';
import { STICKY_COLORS } from '../board-config';

interface Props {
  sticky: Sticky;
  onSave: (patch: Partial<Sticky>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function StickyEditor({ sticky, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState(sticky.text);
  const [color, setColor] = useState<StickyColor>(sticky.color);
  const [assignee, setAssignee] = useState(sticky.assignee_initials ?? '');
  const [estimate, setEstimate] = useState<string>(
    sticky.estimate == null ? '' : String(sticky.estimate)
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function save() {
    const estimateNum = estimate.trim() === '' ? null : Number(estimate);
    onSave({
      text,
      color,
      assignee_initials: assignee.trim() === '' ? null : assignee.trim().slice(0, 3).toUpperCase(),
      estimate: estimateNum != null && !Number.isNaN(estimateNum) ? estimateNum : null,
    });
    onClose();
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
        <h2 className="text-lg font-semibold mb-3">Sticky bewerken</h2>

        <label className="block text-sm font-medium mb-1">Tekst</label>
        <textarea
          autoFocus
          className="w-full border rounded p-2 mb-4 text-base resize-none"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
              style={{
                background: c.hex,
                borderColor: color === c.key ? '#2b2618' : 'transparent',
              }}
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

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="px-3 py-2 text-sm rounded text-red-700 hover:bg-red-50"
          >
            Verwijder
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded hover:bg-gray-100"
            >
              Annuleer
            </button>
            <button
              type="button"
              onClick={save}
              className="px-4 py-2 text-sm rounded bg-[#5b2e8c] text-white hover:brightness-110"
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
