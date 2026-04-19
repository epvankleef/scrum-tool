-- Scrum-tool schema (M0)
-- Geen RLS public-select: alle DB access loopt via Next.js server actions met service_role.
-- Browser gebruikt alleen Realtime broadcast-kanalen (geen directe DB query).

-- Enums ----------------------------------------------------------------
create type sticky_column as enum
  ('product_backlog', 'sprint_backlog', 'todo', 'busy', 'testen', 'done');
create type sticky_color as enum
  ('yellow', 'pink', 'blue', 'green');
create type sprint_status as enum
  ('draft', 'active', 'closed');
create type definition_type as enum
  ('fun', 'done');
create type retro_category as enum
  ('went_well', 'improve', 'action');

-- updated_at trigger helper --------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- project --------------------------------------------------------------
create table project (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null default 'Nieuw project',
  team_name          text not null default '',
  team_members       jsonb not null default '[]'::jsonb,
  share_token        text not null unique,
  end_date           date,
  current_sprint_id  uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index project_share_token_idx on project (share_token);
create trigger set_project_updated_at before update on project
  for each row execute function set_updated_at();

-- sprint ---------------------------------------------------------------
create table sprint (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references project (id) on delete cascade,
  number      int not null,
  goal        text not null default '',
  start_date  date,
  end_date    date,
  status      sprint_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (project_id, number)
);
create index sprint_project_id_idx on sprint (project_id);
create trigger set_sprint_updated_at before update on sprint
  for each row execute function set_updated_at();

-- link project.current_sprint_id -> sprint.id (after sprint exists)
alter table project
  add constraint project_current_sprint_fk
  foreign key (current_sprint_id) references sprint (id) on delete set null;

-- sticky ---------------------------------------------------------------
create table sticky (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references project (id) on delete cascade,
  sprint_id         uuid references sprint (id) on delete set null,
  board_column      sticky_column not null,
  position          double precision not null default 0,
  parent_sticky_id  uuid references sticky (id) on delete set null,
  text              text not null default '',
  color             sticky_color not null default 'yellow',
  assignee_initials text,
  estimate          numeric,
  rotation          numeric not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index sticky_project_id_idx on sticky (project_id);
create index sticky_lookup_idx on sticky (project_id, sprint_id, board_column, position);
create trigger set_sticky_updated_at before update on sticky
  for each row execute function set_updated_at();

-- definition_entry -----------------------------------------------------
create table definition_entry (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references project (id) on delete cascade,
  type        definition_type not null,
  text        text not null,
  position    double precision not null default 0,
  created_at  timestamptz not null default now()
);
create index definition_entry_project_id_idx on definition_entry (project_id);

-- standup_log ----------------------------------------------------------
create table standup_log (
  id           uuid primary key default gen_random_uuid(),
  sprint_id    uuid not null references sprint (id) on delete cascade,
  member_name  text not null,
  date         date not null default current_date,
  yesterday    text not null default '',
  today        text not null default '',
  blockers     text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (sprint_id, member_name, date)
);
create index standup_log_sprint_id_idx on standup_log (sprint_id);
create trigger set_standup_log_updated_at before update on standup_log
  for each row execute function set_updated_at();

-- retro_entry ----------------------------------------------------------
create table retro_entry (
  id          uuid primary key default gen_random_uuid(),
  sprint_id   uuid not null references sprint (id) on delete cascade,
  category    retro_category not null,
  text        text not null,
  created_at  timestamptz not null default now()
);
create index retro_entry_sprint_id_idx on retro_entry (sprint_id);

-- burndown_snapshot ----------------------------------------------------
create table burndown_snapshot (
  id                 uuid primary key default gen_random_uuid(),
  sprint_id          uuid not null references sprint (id) on delete cascade,
  date               date not null,
  remaining_estimate numeric not null,
  created_at         timestamptz not null default now(),
  unique (sprint_id, date)
);
create index burndown_snapshot_sprint_id_idx on burndown_snapshot (sprint_id);

-- RLS ------------------------------------------------------------------
-- Default-deny: anon mag niets direct lezen/schrijven. Alle access
-- gaat via server actions met service_role (die RLS bypasst).
-- Browser gebruikt alleen Realtime broadcast (geen DB reads).
alter table project           enable row level security;
alter table sprint            enable row level security;
alter table sticky            enable row level security;
alter table definition_entry  enable row level security;
alter table standup_log       enable row level security;
alter table retro_entry       enable row level security;
alter table burndown_snapshot enable row level security;
