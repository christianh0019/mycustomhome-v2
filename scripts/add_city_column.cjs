
const { Client } = require('pg');
const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();

        // 1. Add Column
        console.log("Adding 'city' column...");
        await client.query("ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS city text");

        // 2. Backfill from Profiles
        console.log("Backfilling city from profiles...");
        const updateSql = `
            UPDATE public.recommendations r
            SET city = p.city
            FROM public.profiles p
            WHERE r.user_id = p.id AND (r.city IS NULL OR r.city = '')
        `;
        const res = await client.query(updateSql);
        console.log(`Backfilled ${res.rowCount} rows.`);

    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await client.end();
    }
}

run();
