
const { Client } = require('pg');

const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const sql = `
            ALTER TABLE public.recommendations 
            ADD COLUMN IF NOT EXISTS rating numeric,
            ADD COLUMN IF NOT EXISTS review_count integer,
            ADD COLUMN IF NOT EXISTS overall_score integer;
        `;
        await client.query(sql);

        console.log('Schema updated: Added rating columns.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
