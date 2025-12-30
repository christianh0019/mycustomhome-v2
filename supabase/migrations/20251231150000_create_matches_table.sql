-- Create matches table to link Vendors and Homeowners
-- This replaces 'leads' as the conversation container

create table if not exists public.matches (
    id uuid default gen_random_uuid() primary key,
    homeowner_id uuid references public.profiles(id) not null,
    vendor_id uuid references public.profiles(id) not null,
    status text default 'active', -- active, archived, blocked
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(homeowner_id, vendor_id)
);

-- RLS for Matches
alter table public.matches enable row level security;

create policy "Users can view their own matches"
on public.matches for select
using (
    auth.uid() = homeowner_id OR auth.uid() = vendor_id
);

-- Note: We might need an insert policy if the frontend creates matches, 
-- but usually this happens on the backend or via a specific "Connect" action. 
-- For now, we'll allow authenticated users to create matches (e.g. Homeowner clicks "Contact Vendor")
create policy "Users can create matches"
on public.matches for insert
with check (
    auth.uid() = homeowner_id -- Only homeowner initiates? Or maybe vendor? Let's allow either for now.
    OR auth.uid() = vendor_id
);
