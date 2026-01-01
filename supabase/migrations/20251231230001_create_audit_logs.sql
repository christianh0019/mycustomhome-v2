-- Create document_audit_logs table
create table if not exists public.document_audit_logs (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- 'viewed', 'sent', 'signed', 'field_updated'
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.document_audit_logs enable row level security;

-- Policies

-- Vendors can view logs for their own documents
drop policy if exists "Vendors can view logs for their own documents" on public.document_audit_logs;
create policy "Vendors can view logs for their own documents"
  on public.document_audit_logs for select
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_audit_logs.document_id
      and documents.vendor_id = auth.uid()
    )
  );

-- Admin/System can insert logs (for now, allow authenticated users to insert logs linked to documents they have access to)
-- This might need refinement, but for now we'll allow insert if the user can view the document
drop policy if exists "Users can insert logs for accessible documents" on public.document_audit_logs;
create policy "Users can insert logs for accessible documents"
  on public.document_audit_logs for insert
  with check (
    exists (
      select 1 from public.documents
      where documents.id = document_audit_logs.document_id
      -- Logic: If they can see the doc, they can log viewing/signing it
      -- Note: Simplification for now. Ideally, we'd check if they are the recipient or vendor.
    )
  );
