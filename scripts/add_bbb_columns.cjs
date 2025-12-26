
const { Client } = require('pg');
const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();
        await client.query(`
            ALTER TABLE public.recommendations 
            ADD COLUMN IF NOT EXISTS bbb_rating text,
            ADD COLUMN IF NOT EXISTS years_in_business text
        `);
        console.log("Schema Updated: Added bbb_rating, years_in_business");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
