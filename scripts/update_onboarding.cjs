
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

        const sql = `
      alter table public.profiles 
      add column if not exists has_onboarded boolean default false;
    `;

        await client.query(sql);
        console.log('Schema updated successfully: add column has_onboarded');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
