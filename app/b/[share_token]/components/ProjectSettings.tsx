'use client';
import { useState } from 'react';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  onSave: (patch: Partial<Project>) => void;
  onClose: () => void;
}

export default function ProjectSettings({ project, onSave, onClose }: Props) {
  const [name, setName] = useState(project.name);
  const [teamName, setTeamName] = useState(project.team_name);
  const [members, setMembers] = useState((project.team_members ?? []).join(', '));
  const [endDate, setEndDate] = useState(project.end_date ?? '');

  function save() {
    onSave({
      name: name.trim(),
      team_name: teamName.trim(),
      team_members: members
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      end_date: endDate || null,
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
        className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Project instellingen</h2>

        <label className="block text-sm font-medium mb-1">Projectnaam</label>
        <input
          className="w-full border rounded p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="bv. Scrum-opdracht blok 3"
        />

        <label className="block text-sm font-medium mb-1">Teamnaam</label>
        <input
          className="w-full border rounded p-2 mb-3"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="bv. De Code Cowboys"
        />

        <label className="block text-sm font-medium mb-1">
          Teamleden <span className="opacity-60 font-normal">(komma-gescheiden)</span>
        </label>
        <input
          className="w-full border rounded p-2 mb-3"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="Edwin, Linda, Thomas"
        />

        <label className="block text-sm font-medium mb-1">Einddatum project</label>
        <input
          type="date"
          className="w-full border rounded p-2 mb-5"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
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
  );
}
