import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Project, Sticky } from '@/lib/types';
import BoardClient from './BoardClient';

interface PageProps {
  params: Promise<{ share_token: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { share_token } = await params;
  const db = supabaseAdmin();

  const { data: project } = await db
    .from('project')
    .select('*')
    .eq('share_token', share_token)
    .maybeSingle();

  if (!project) notFound();

  const { data: stickies } = await db
    .from('sticky')
    .select('*')
    .eq('project_id', project.id)
    .order('position', { ascending: true });

  return (
    <BoardClient
      project={project as Project}
      initialStickies={(stickies ?? []) as Sticky[]}
    />
  );
}
