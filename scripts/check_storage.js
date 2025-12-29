
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsubhodrsiyxbbjrfmhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWJob2Ryc2l5eGJianJmbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzU0MzUsImV4cCI6MjA4MjI1MTQzNX0.KN_mmHkenee9Gj6IR8w9gtbcMFTZMYFGBa5n2virc5k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    console.log('Attempting upload to document-files...');

    // Create dummy file
    const file = new Blob(['hello world'], { type: 'text/plain' });

    const { data, error } = await supabase.storage
        .from('document-files')
        .upload('test_check.txt', file, { upsert: true });

    if (error) {
        console.error('Upload failed:', error.message);
        console.error('Error Details:', error);
    } else {
        console.log('✅ Upload successful. Bucket exists!');
    }
}

checkBucket();
