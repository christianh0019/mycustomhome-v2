-- Create match_notes table for multiple notes support
create table if not exists public.match_notes (
    id uuid default gen_random_uuid() primary key,
    match_id uuid references public.matches(id) not null,
    author_id uuid references public.profiles(id) not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.match_notes enable row level security;

-- Policies
create policy "Users can view notes for their matches"
on public.match_notes for select
using (
    exists (
        select 1 from public.matches m
        where m.id = match_notes.match_id
        and (m.homeowner_id = auth.uid() or m.vendor_id = auth.uid())
    )
);

create policy "Users can insert notes for their matches"
on public.match_notes for insert
with check (
    exists (
        select 1 from public.matches m
        where m.id = match_notes.match_id
        and (m.homeowner_id = auth.uid() or m.vendor_id = auth.uid())
    )
    and auth.uid() = author_id
);

-- Optional: Delete policy (authors can delete their own notes)
create policy "Users can delete their own notes"
on public.match_notes for delete
using (
    auth.uid() = author_id
);
