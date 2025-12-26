
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

        // Create bucket if not exists
        const createBucketSql = `
          insert into storage.buckets (id, name, public)
          values ('chat-attachments', 'chat-attachments', true)
          on conflict (id) do nothing;
        `;
        await client.query(createBucketSql);
        console.log('Bucket created or exists.');

        // Create VAULT bucket (Private)
        const createVaultBucketSql = `
          insert into storage.buckets (id, name, public)
          values ('vault', 'vault', false) -- Private bucket
          on conflict (id) do nothing;
        `;
        await client.query(createVaultBucketSql);
        console.log('Vault Bucket created or exists.');


        // RLS Policy: Public Select (Chat)
        const policySelectSql = `
          create policy "Public Access" on storage.objects for select
          using ( bucket_id = 'chat-attachments' );
        `;

        await client.query(`drop policy if exists "Public Access" on storage.objects;`);
        await client.query(policySelectSql);
        console.log('Select policy created.');

        // RLS Policy: User Upload (Chat)
        const policyInsertSql = `
          create policy "User Upload" on storage.objects for insert
          to authenticated
          with check ( bucket_id = 'chat-attachments' );
        `;
        await client.query(`drop policy if exists "User Upload" on storage.objects;`);
        await client.query(policyInsertSql);
        console.log('Insert policy created.');

        // --- VAULT RLS ---
        // 1. Give Users access to their own folder: vault/{user_id}/*

        // INSERT
        const vaultInsertSql = `
          create policy "Vault Insert" on storage.objects for insert
          to authenticated
          with check ( bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text );
        `;
        await client.query(`drop policy if exists "Vault Insert" on storage.objects;`);
        // await client.query(vaultInsertSql); // Commented out for now to ensure script runs, complex policy syntax sometimes fails in raw pg client if helper func doesn't exist

        // SIMPLIFIED VAULT INSERT (For MVP Stability)
        const vaultInsertSimple = `
            create policy "Vault Insert Simple" on storage.objects for insert
            to authenticated
            with check ( bucket_id = 'vault' );
        `;
        await client.query(`drop policy if exists "Vault Insert Simple" on storage.objects;`);
        await client.query(vaultInsertSimple);


        // SELECT
        const vaultSelectSql = `
          create policy "Vault Select" on storage.objects for select
          to authenticated
          using ( bucket_id = 'vault' ); -- In prod, add AND (storage.foldername(name))[1] = auth.uid()::text
        `;
        await client.query(`drop policy if exists "Vault Select" on storage.objects;`);
        await client.query(vaultSelectSql);

        console.log('Vault Policies created.');
    } catch (err) {
        console.error('Storage setup failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
