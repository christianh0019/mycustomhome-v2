import 'dotenv/config';
import { execFileSync } from 'child_process';

const url = process.env.DATABASE_URL;

if (!url) {
    console.error('Error: DATABASE_URL is not defined in .env');
    process.exit(1);
}

console.log('Pushing changes to remote database...');

try {
    // Use execFileSync to avoid shell expansion of special characters in the URL
    // Windows requires 'npx.cmd', Unix 'npx'
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

    execFileSync(cmd, ['supabase', 'db', 'push', '--db-url', url], { stdio: 'inherit' });
} catch (error) {
    console.error('Migration failed.');
    process.exit(1);
}
