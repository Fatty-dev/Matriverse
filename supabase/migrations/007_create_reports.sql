-- Create reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Report metadata
  report_type text not null check (report_type in ('full_summary', 'symptoms_report', 'progress_report', 'scans_report', 'ar_training_report')),
  title text not null,
  description text,

  -- Date range for the report
  date_from timestamptz,
  date_to timestamptz,

  -- File storage
  file_url text,
  file_size integer,

  -- Report data (stored as JSONB for flexibility)
  report_data jsonb default '{}'::jsonb,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.reports enable row level security;

-- RLS Policies
create policy "Users can view their own reports"
  on public.reports
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own reports"
  on public.reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.reports
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);

-- Add updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reports_updated_at
  before update on public.reports
  for each row
  execute function public.handle_updated_at();
