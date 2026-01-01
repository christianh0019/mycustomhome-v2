import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspectMatches() {
    console.log('Fetching all matches...');

    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
            id,
            created_at,
            homeowner_id,
            vendor_id,
            homeowner:homeowner_id (full_name),
            vendor:vendor_id (full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching matches:', error);
        return;
    }

    console.log(`Found ${matches.length} matches.`);

    const pairs = {};
    const duplicates = [];

    matches.forEach(m => {
        const key = `${m.homeowner_id}-${m.vendor_id}`;
        if (pairs[key]) {
            duplicates.push({
                original: pairs[key],
                duplicate: m
            });
        } else {
            pairs[key] = m;
        }

        console.log(`Match ${m.id}: ${m.homeowner?.full_name} <-> ${m.vendor?.full_name} (${m.created_at})`);
    });

    if (duplicates.length > 0) {
        console.log('\n--- DUPLICATES FOUND ---');
        duplicates.forEach(d => {
            console.log(`Pair: ${d.original.homeowner?.full_name} <-> ${d.original.vendor?.full_name}`);
            console.log(`  Original: ${d.original.id} (${d.original.created_at})`);
            console.log(`  Dup:      ${d.duplicate.id} (${d.duplicate.created_at})`);
        });
    } else {
        console.log('\nNo exact duplicates found based on homeowner_id + vendor_id.');
    }
}

inspectMatches();
