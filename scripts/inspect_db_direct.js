import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspect() {
    await client.connect();

    try {
        console.log('--- CHECKING MATCHES DUPLICATES ---');
        const matchesRes = await client.query(`
      SELECT homeowner_id, vendor_id, COUNT(*), array_agg(id) as ids
      FROM matches 
      GROUP BY homeowner_id, vendor_id 
      HAVING COUNT(*) > 1
    `);

        if (matchesRes.rows.length === 0) {
            console.log('No duplicate matches found.');
        } else {
            console.log('Duplicate matches found:', matchesRes.rows);
        }

        console.log('\n--- CHECKING ALL MATCHES (Sample) ---');
        const allMatches = await client.query(`
        SELECT m.id, m.created_at, h.full_name as homeowner, v.full_name as vendor
        FROM matches m
        LEFT JOIN profiles h ON m.homeowner_id = h.id
        LEFT JOIN profiles v ON m.vendor_id = v.id
        ORDER BY m.created_at DESC
        LIMIT 10
    `);
        allMatches.rows.forEach(r => console.log(`${r.id} | ${r.homeowner} <-> ${r.vendor} | ${r.created_at}`));

        console.log('\n--- CHECKING PROFILES SCHEMA ---');
        // Check if role column exists
        const schemaRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `);
        const columns = schemaRes.rows.map(r => r.column_name);
        console.log('Profiles columns:', columns.join(', '));

        console.log('\n--- CLEANING UP DUPLICATES ---');
        // Strategy: Delete matches created today that are "reverse" of existing older matches or just duplicates.
        // Specifically, we saw christian<->chossbiz duplicates. 
        // We want to keep the OLDER one (presumed correct).
        // The newer one was likely created by the braodcast seed.

        // Find duplicates (ignoring direction for now, or just handling the specific case)
        // Actually, distinct (A,B) and (B,A) are technically different matches.
        // But for the UI they appear as duplicates.
        // We should delete the one that was created "recently" (e.g. today).

        const cleanupQuery = `
        DELETE FROM matches
        WHERE created_at > NOW() - INTERVAL '24 hours'
        AND id IN (
            SELECT id FROM matches m2
            WHERE EXISTS (
                SELECT 1 FROM matches mOld
                WHERE mOld.id != m2.id
                AND (
                    (mOld.homeowner_id = m2.homeowner_id AND mOld.vendor_id = m2.vendor_id)
                    OR
                    (mOld.homeowner_id = m2.vendor_id AND mOld.vendor_id = m2.homeowner_id)
                )
                AND mOld.created_at < m2.created_at
            )
        )
        RETURNING id, homeowner_id, vendor_id;
    `;

        const deleteRes = await client.query(cleanupQuery);
        console.log(`Deleted ${deleteRes.rowCount} duplicate matches.`);
        deleteRes.rows.forEach(r => console.log(`Deleted: ${r.id}`));

        console.log('\n--- SEEDING WELCOME MESSAGE ---');
        // Since messages are empty, seed one to ensure the tab works
        const seedMsg = await client.query(`
        INSERT INTO messages (thread_id, sender_id, text)
        SELECT id, vendor_id, 'System: Welcome back. Message history was reset.'
        FROM matches
        LIMIT 1
        RETURNING id;
    `);
        console.log(`Seeded ${seedMsg.rowCount} welcome message.`);

        console.log('\n--- CHECKING MESSAGES ---');
        const msgRes = await client.query(`SELECT COUNT(*) FROM messages`);
        console.log('Total messages:', msgRes.rows[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

inspect();
