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

        // 1. Create vault_items table
        console.log('Creating vault_items table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS vault_items (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id uuid REFERENCES auth.users NOT NULL,
                file_path text NOT NULL,
                original_name text NOT NULL,
                smart_name text,
                summary text,
                category text DEFAULT 'Unsorted',
                tags text[],
                status text DEFAULT 'analyzing', -- 'analyzing', 'ready', 'error'
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);

        // 2. RLS Policies
        console.log('Setting up RLS...');
        await client.query(`ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;`);

        // SELECT
        await client.query(`drop policy if exists "Vault Items Select Owner" on vault_items;`);
        await client.query(`
            create policy "Vault Items Select Owner" on vault_items for select
            using ( auth.uid() = user_id );
        `);

        // INSERT
        await client.query(`drop policy if exists "Vault Items Insert Owner" on vault_items;`);
        await client.query(`
            create policy "Vault Items Insert Owner" on vault_items for insert
            with check ( auth.uid() = user_id );
        `);

        // UPDATE
        await client.query(`drop policy if exists "Vault Items Update Owner" on vault_items;`);
        await client.query(`
            create policy "Vault Items Update Owner" on vault_items for update
            using ( auth.uid() = user_id );
        `);

        // DELETE
        await client.query(`drop policy if exists "Vault Items Delete Owner" on vault_items;`);
        await client.query(`
            create policy "Vault Items Delete Owner" on vault_items for delete
            using ( auth.uid() = user_id );
        `);

        console.log('Vault Items table and policies configured.');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
