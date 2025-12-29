
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsubhodrsiyxbbjrfmhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWJob2Ryc2l5eGJianJmbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzU0MzUsImV4cCI6MjA4MjI1MTQzNX0.KN_mmHkenee9Gj6IR8w9gtbcMFTZMYFGBa5n2virc5k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
    console.log('Listing Storage Buckets...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error fetching buckets:', error.message);
    } else {
        console.log('Buckets found:', data.map(b => b.name));
    }
}

listBuckets();
