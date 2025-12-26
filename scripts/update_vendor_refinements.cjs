
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

        // 1. Clean up potential duplicates first (keep newest)
        // This is complex, so we'll just try to add constraint and if it fails, we log it.
        // Actually, to be safe, let's delete duplicates.
        // A simple way is to delete all and restart, but that's destructive. 
        // Better: Delete where id not in (select max(id) from recommendations group by user_id, name)

        console.log('Removing potential duplicates...');
        await client.query(`
            DELETE FROM public.recommendations a USING public.recommendations b
            WHERE a.id < b.id AND a.user_id = b.user_id AND a.name = b.name;
        `);

        // 2. Add Unique Constraint
        console.log('Adding unique constraint...');
        await client.query(`
            ALTER TABLE public.recommendations 
            ADD CONSTRAINT unique_user_vendor_name UNIQUE (user_id, name);
        `);

        // 3. Add new columns
        console.log('Adding new columns...');
        const sql = `
            ALTER TABLE public.recommendations 
            ADD COLUMN IF NOT EXISTS website text,
            ADD COLUMN IF NOT EXISTS phone text,
            ADD COLUMN IF NOT EXISTS reviews_summary text,
            ADD COLUMN IF NOT EXISTS verified_badge boolean DEFAULT false;
        `;
        await client.query(sql);

        console.log('Schema updated successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
