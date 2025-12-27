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

        console.log('Adding roadmap columns to profiles...');

        // Add current_stage (int) and stage_progress (jsonb)
        await client.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS current_stage integer DEFAULT 0,
            ADD COLUMN IF NOT EXISTS stage_progress jsonb DEFAULT '{}'::jsonb;
        `);

        console.log('Roadmap columns added successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
