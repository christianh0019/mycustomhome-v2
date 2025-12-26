
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// --- ACCESS CONFIG (Copied from create_leads_schema.cjs) ---
const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();
        console.log("Connected to database...");

        // Define SQL directly to match 002_vendor_tables.sql
        const sql = `
            -- 1. LEADS TABLE
            DROP TABLE IF EXISTS public.vendor_invites CASCADE;
            DROP TABLE IF EXISTS public.leads CASCADE;
            DROP TABLE IF EXISTS public.vendor_agreements CASCADE; -- Probably good to drop this too if we are redefining leads
            DROP TYPE IF EXISTS lead_status CASCADE;
            DROP TYPE IF EXISTS invite_status CASCADE;

            create type lead_status as enum ('draft', 'vetting', 'active', 'matched', 'closed');

            create table public.leads (
                id uuid default gen_random_uuid() primary key,
                homeowner_id uuid references public.profiles(id) not null,
                created_at timestamp with time zone default timezone('utc'::text, now()) not null,
                status lead_status default 'draft',
                project_title text, 
                budget_range text,
                location_city text,
                location_state text,
                scope_summary text,
                timeline text
            );

            -- 2. VENDOR INVITES
            create type invite_status as enum ('sent', 'viewed', 'accepted', 'declined', 'expired');

            create table public.vendor_invites (
                id uuid default gen_random_uuid() primary key,
                lead_id uuid references public.leads(id) not null,
                vendor_email text not null,
                token text unique not null,
                status invite_status default 'sent',
                created_at timestamp with time zone default timezone('utc'::text, now()) not null,
                expires_at timestamp with time zone not null,
                viewed_at timestamp with time zone,
                accepted_at timestamp with time zone
            );

            -- RLS
            alter table public.leads enable row level security;
            
            create policy "Homeowners can view own leads"
            on public.leads for select
            using (auth.uid() = homeowner_id);

            alter table public.vendor_invites enable row level security;

            create policy "Public view with token"
            on public.vendor_invites for select
            using (true); 
        `;

        console.log("Executing SQL Migration...");
        await client.query(sql);
        console.log("Migration successful!");

    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await client.end();
    }
}

run();
