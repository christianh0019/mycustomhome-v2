-- 1. LEADS TABLE (The Project)
-- This stores the project details derived from the homeowner's profile, but as a distinct "deal" object.
create type lead_status as enum ('draft', 'vetting', 'active', 'matched', 'closed');

create table public.leads (
    id uuid default gen_random_uuid() primary key,
    homeowner_id uuid references public.profiles(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status lead_status default 'draft',
    project_title text, -- e.g. "Modern Farmhouse in Dallas"
    budget_range text, -- e.g. "$1.2M - $1.5M"
    location_city text,
    location_state text,
    scope_summary text, -- AI generated summary
    timeline text -- e.g. "Ready to start in 3 months"
);

-- 2. VENDOR INVITES (The Connection)
-- This tracks individual invites sent to vendors for a specific lead.
create type invite_status as enum ('sent', 'viewed', 'accepted', 'declined', 'expired');

create table public.vendor_invites (
    id uuid default gen_random_uuid() primary key,
    lead_id uuid references public.leads(id) not null,
    vendor_email text not null,
    token text unique not null, -- Secure random token for the link
    status invite_status default 'sent',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null,
    viewed_at timestamp with time zone,
    accepted_at timestamp with time zone
);

-- RLS POLICIES

-- Leads: Homeowners can see their own leads. Admins see all.
alter table public.leads enable row level security;

create policy "Homeowners can view own leads"
on public.leads for select
using (auth.uid() = homeowner_id);

-- Vendor Invites: Public access only via token (handled in Edge Function or secure query),
-- but authenticated vendors can view invites matching their email if we had auth.
-- For now, we rely on the secure token in the URL for the landing page.
alter table public.vendor_invites enable row level security;

-- Allow anonymous read if they have the token (Simulated via helper function or open read for now with filter)
create policy "Public view with token"
on public.vendor_invites for select
using (true); 
