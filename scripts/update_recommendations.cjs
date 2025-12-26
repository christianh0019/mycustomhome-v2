
const { Client } = require('pg');

const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        // 1. Add columns to profiles
        const updateProfilesSql = `
      alter table public.profiles 
      add column if not exists city text,
      add column if not exists budget_range text;
    `;
        await client.query(updateProfilesSql);
        console.log('Updated profiles table.');

        // 2. Create recommendations table
        const createRecommendationsSql = `
      create table if not exists public.recommendations (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references public.profiles(id) on delete cascade not null,
        category text not null,
        name text not null,
        description text,
        scores jsonb default '{}'::jsonb, 
        status text default 'new',
        logo_url text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `;
        await client.query(createRecommendationsSql);
        console.log('Created recommendations table.');

        // 3. Enable RLS
        await client.query(`alter table public.recommendations enable row level security;`);

        // 4. Create Policy
        const policySql = `
            create policy "Users can view own recommendations"
            on public.recommendations for select
            using (auth.uid() = user_id);

            create policy "Users can insert own recommendations" 
            on public.recommendations for insert
            with check (auth.uid() = user_id);

            create policy "Users can update own recommendations"
            on public.recommendations for update
            using (auth.uid() = user_id);
        `;

        // Wrap policy creation in try/catch as they error if exist
        try {
            await client.query(policySql);
            console.log('RLS policies created.');
        } catch (e) {
            console.warn('Policies might already exist, skipping.', e.message);
        }

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
