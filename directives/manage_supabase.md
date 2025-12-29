# Supabase Management SOP

## Goal
Create and modify database tables and schema in Supabase.

## Workflow
1. **Create Migration File**:
    - Location: `supabase/migrations/YYYYMMDD_description.sql`
    - Content: Standard SQL (CREATE TABLE, ALTER TABLE, etc.)
    - Security: Always include RLS policies.

2. **Apply Migration**:
    - Command: `npx supabase db push`
    - Logic: This pushes local migration files to the remote linked Supabase instance.
    - Requirement: User must be authenticated via CLI (`npx supabase login`) or have `SUPABASE_ACCESS_TOKEN` in env (if running in CI, though here we rely on local auth).

3. **Verify**:
    - Check table existence via verification script or Dashboard.

## Troubleshooting
- If `db push` fails due to auth: Prompt user to run `npx supabase login`.
- If `db push` fails due to conflict: Run `npx supabase db pull` to sync first.
