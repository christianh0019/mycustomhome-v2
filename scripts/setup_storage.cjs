
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

        // RLS Policy: Public Select
        const policySelectSql = `
      create policy "Public Access" on storage.objects for select
      using ( bucket_id = 'chat-attachments' );
    `;
        // We try/catch policies potentially failing if they exist, or drop them first. 
        // Easier to just use "do nothing" logic isn't trivial for policies.
        // I will use a simplified approach: drop if exists then create.

        await client.query(`drop policy if exists "Public Access" on storage.objects;`);
        await client.query(policySelectSql);
        console.log('Select policy created.');

        // RLS Policy: User Upload (Authenticated)
        const policyInsertSql = `
      create policy "User Upload" on storage.objects for insert
      to authenticated
      with check ( bucket_id = 'chat-attachments' );
    `;
        await client.query(`drop policy if exists "User Upload" on storage.objects;`);
        await client.query(policyInsertSql);
        console.log('Insert policy created.');

    } catch (err) {
        console.error('Storage setup failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
