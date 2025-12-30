-- Create messages table for chat history
-- Linked to Leads (acting as threads)

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'signature_request');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    thread_id uuid references public.leads(id) on delete cascade not null,
    sender_id text not null, -- Stores either User UUID or Lead UUID to distinguish sender
    text text,
    type message_type default 'text',
    metadata jsonb default '{}'::jsonb, -- Stores documentId, status, etc.
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_read boolean default false
);

-- RLS
alter table public.messages enable row level security;

-- Policy: Users can see messages if they own the lead (thread)
create policy "Users can view messages for their leads"
on public.messages for select
using (
    exists (
        select 1 from public.leads
        where leads.id = messages.thread_id
        and leads.homeowner_id = auth.uid()
    )
);

-- Policy: Users can insert messages if they own the lead
create policy "Users can insert messages for their leads"
on public.messages for insert
with check (
    exists (
        select 1 from public.leads
        where leads.id = messages.thread_id
        and leads.homeowner_id = auth.uid()
    )
);

-- Policy: Users can update messages (e.g. mark read, update metadata status)
create policy "Users can update messages for their leads"
on public.messages for update
using (
    exists (
        select 1 from public.leads
        where leads.id = messages.thread_id
        and leads.homeowner_id = auth.uid()
    )
);
