
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsubhodrsiyxbbjrfmhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWJob2Ryc2l5eGJianJmbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzU0MzUsImV4cCI6MjA4MjI1MTQzNX0.KN_mmHkenee9Gj6IR8w9gtbcMFTZMYFGBa5n2virc5k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBackend() {
    console.log('Verifying connection to:', supabaseUrl);

    // List of expected tables to check
    // Adding 'documents' specifically as user requested integration verification
    const tablesToCheck = ['documents', 'profiles', 'projects', 'vault_items', 'threads', 'messages'];

    for (const table of tablesToCheck) {
        process.stdout.write(`Checking table '${table}'... `);
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log('❌ Error/Not Found');
            console.error(`  -> ${error.message} (${error.code})`);
        } else {
            console.log('✅ Connected');
            // Log structure of first item to understand schema
            if (data && data.length > 0) {
                console.log('  Schema Sample:', Object.keys(data[0]).join(', '));
            } else {
                console.log('  (Table empty, but exists)');
            }
        }
    }
}

verifyBackend();
