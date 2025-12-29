-- Create documents table with proper RLS and references through a migration

create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  status text not null default 'draft', -- draft, sent, completed
  recipient_email text,
  recipient_name text,
  metadata jsonb, -- stores x/y coordinates of fields
  file_url text, -- link to storage
  vendor_id uuid references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.documents enable row level security;

-- Policies
create policy "Vendors can view their own documents"
  on public.documents for select
  using (auth.uid() = vendor_id);

create policy "Vendors can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = vendor_id);

create policy "Vendors can update their own documents"
  on public.documents for update
  using (auth.uid() = vendor_id);

create policy "Vendors can delete their own documents"
  on public.documents for delete
  using (auth.uid() = vendor_id);
