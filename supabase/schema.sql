-- Raw activity logs (granular tracking)
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  source text not null,        -- e.g. "gmail", "browser", "discord"
  content text not null,       -- raw text/content snippet
  timestamp timestamptz not null default now(),
  metadata jsonb               -- optional extra (url, sender, etc.)
);

-- AI-generated daily summaries
create table daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  day date not null,
  summary text not null,       -- AI-generated daily digest
  created_at timestamp default now()
);
alter table daily_summaries
add column raw_log jsonb;

alter table activity_logs
add column created_at timestamp default now();
