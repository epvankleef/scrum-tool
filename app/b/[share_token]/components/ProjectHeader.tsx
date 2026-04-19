'use client';
import { useState } from 'react';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  onOpenSettings: () => void;
}

export default function ProjectHeader({ project, onOpenSettings }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <header className="layer flex items-center gap-6 px-5 py-3 rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <Field label="Project" value={project.name || 'Naamloos project'} muted={!project.name} />
      <Divider />
      <Field label="Team" value={project.team_name || 'Geen team'} muted={!project.team_name} />
      <Divider />
      <Field
        label="Teamleden"
        value={
          project.team_members?.length
            ? project.team_members.join(' · ')
            : 'Nog niemand'
        }
        muted={!project.team_members?.length}
        wide
      />
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          onClick={copyLink}
          className="px-3.5 py-1.5 text-sm rounded-full bg-neutral-900 text-white hover:bg-neutral-700 transition"
          title="Kopieer share-link"
        >
          {copied ? 'Gekopieerd' : 'Deel link'}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3.5 py-1.5 text-sm rounded-full text-neutral-700 hover:bg-neutral-100 transition"
          title="Project instellingen"
        >
          Instellingen
        </button>
      </div>
    </header>
  );
}

function Field({
  label,
  value,
  muted,
  wide,
}: {
  label: string;
  value: string;
  muted?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`min-w-0 ${wide ? 'flex-1' : 'shrink-0 max-w-[220px]'}`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-medium">
        {label}
      </div>
      <div className={`text-sm truncate ${muted ? 'text-neutral-400 italic' : 'text-neutral-800'}`}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-neutral-200 shrink-0" aria-hidden />;
}
