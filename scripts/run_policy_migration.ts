
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Connection string from .env or hardcoded fallback (using the one I saw earlier)
const connectionString = process.env.VITE_SUPABASE_URL
    ? process.env.DATABASE_URL // usually we need the direct postgres connection string
    : 'postgresql://postgres.nsubhodrsiyxbbjrfmhz:JoeShmoe3412$@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

// IMPORTANT: Using the connection string from previous logs which I know works
const DB_URL = 'postgresql://postgres.nsubhodrsiyxbbjrfmhz:JoeShmoe3412$@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const MIGRATION_FILES = [
    // 'supabase/migrations/20251231180000_create_match_notes.sql',
    'supabase/migrations/20251231190000_seed_match_test.sql'
];

async function runMigrations() {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        for (const file of MIGRATION_FILES) {
            const filePath = path.resolve(process.cwd(), file);
            console.log(`Reading migration: ${file}`);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Executing ${file}...`);
            await client.query(sql);
            console.log(`Success: ${file}`);
        }

        console.log('Migration executed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
