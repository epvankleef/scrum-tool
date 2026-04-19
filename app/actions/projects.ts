'use server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateShareToken } from '@/lib/share-token';

export async function createProject(_formData?: FormData) {
  const db = supabaseAdmin();
  const shareToken = generateShareToken();

  const { data: project, error: projectErr } = await db
    .from('project')
    .insert({ share_token: shareToken })
    .select('id')
    .single();
  if (projectErr || !project) throw new Error(projectErr?.message ?? 'failed to create project');

  const { data: sprint, error: sprintErr } = await db
    .from('sprint')
    .insert({ project_id: project.id, number: 1, status: 'active' })
    .select('id')
    .single();
  if (sprintErr || !sprint) throw new Error(sprintErr?.message ?? 'failed to create sprint');

  const { error: linkErr } = await db
    .from('project')
    .update({ current_sprint_id: sprint.id })
    .eq('id', project.id);
  if (linkErr) throw new Error(linkErr.message);

  redirect(`/b/${shareToken}`);
}

export async function updateProjectSettings(
  shareToken: string,
  fields: { name?: string; team_name?: string; team_members?: string[]; end_date?: string | null }
) {
  const db = supabaseAdmin();
  const { error } = await db
    .from('project')
    .update(fields)
    .eq('share_token', shareToken);
  if (error) throw new Error(error.message);
}
