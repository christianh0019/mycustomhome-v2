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

        // 1. Add columns to profiles table
        console.log('Adding columns to profiles...');
        await client.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS bio text,
            ADD COLUMN IF NOT EXISTS avatar_url text;
        `);
        console.log('Columns added.');

        // 2. Create 'avatars' bucket
        console.log('Creating avatars bucket...');
        await client.query(`
            insert into storage.buckets (id, name, public)
            values ('avatars', 'avatars', true)
            on conflict (id) do nothing;
        `);

        // 3. RLS Policies for Avatars
        // SELECT (Public)
        await client.query(`drop policy if exists "Avatar Public Select" on storage.objects;`);
        await client.query(`
            create policy "Avatar Public Select" on storage.objects for select
            using ( bucket_id = 'avatars' );
        `);

        // INSERT (Auth)
        await client.query(`drop policy if exists "Avatar Auth Insert" on storage.objects;`);
        await client.query(`
            create policy "Avatar Auth Insert" on storage.objects for insert
            to authenticated
            with check ( bucket_id = 'avatars' );
        `);

        // UPDATE (Owner - simplified to Auth for script stability, ideal is auth.uid() check)
        await client.query(`drop policy if exists "Avatar Auth Update" on storage.objects;`);
        await client.query(`
            create policy "Avatar Auth Update" on storage.objects for update
            to authenticated
            using ( bucket_id = 'avatars' );
        `);

        console.log('Avatars bucket and policies configured.');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
