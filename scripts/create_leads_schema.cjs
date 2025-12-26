
const { Client } = require('pg');

// --- ACCESS CONFIG ---
const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();
        console.log("Connected to database...");

        // 1. Leads Table
        console.log("Creating 'leads' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.leads (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                homeowner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
                vendor_id uuid REFERENCES public.recommendations(id) ON DELETE SET NULL,
                status text DEFAULT 'pending' CHECK (status IN ('pending', 'invite_sent', 'accepted', 'declined', 'invoiced')),
                commission_rate numeric DEFAULT 0.0,
                project_scope_snapshot jsonb DEFAULT '{}'::jsonb,
                created_at timestamptz DEFAULT now()
            );
        `);

        // 2. Vendor Invites Table
        console.log("Creating 'vendor_invites' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.vendor_invites (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
                token text UNIQUE NOT NULL,
                email_sent_to text,
                expires_at timestamptz,
                created_at timestamptz DEFAULT now()
            );
        `);

        // 3. Vendor Agreements Table
        console.log("Creating 'vendor_agreements' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.vendor_agreements (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                vendor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
                lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
                agreement_version text NOT NULL,
                agreed_at timestamptz DEFAULT now(),
                ip_address text
            );
        `);

        // 4. RLS Policies (Basic Open for MVP, tighten later)
        console.log("Enabling RLS...");
        await client.query(`ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;`);
        await client.query(`ALTER TABLE public.vendor_invites ENABLE ROW LEVEL SECURITY;`);
        await client.query(`ALTER TABLE public.vendor_agreements ENABLE ROW LEVEL SECURITY;`);

        console.log("Schema creation complete.");

    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await client.end();
    }
}

run();
