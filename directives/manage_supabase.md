# Supabase Management SOP

## Goal
Create and modify database tables and schema in Supabase using the provided connection string.

## Prerequisites
- `.env` file must contain `DATABASE_URL` with the connection string.
- `package.json` should have `"db:push": "node scripts/push_db.js"`.
- `scripts/push_db.js` must exist and use `dotenv` to load the `DATABASE_URL`.

## Workflow

1. **Create Migration File**:
    - Location: `supabase/migrations/<YYYYMMDDHHMMSS>_<description>.sql`
    - Content: Standard SQL (CREATE TABLE, ALTER TABLE, INSERT, etc.)
    - Security: Always include RLS policies for new tables.

2. **Apply Migration**:
    - Command: `npm run db:push`
    - Logic: This runs the `scripts/push_db.js` script, which uses `npx supabase db push` with the connection string from `.env`.

3. **Verify**:
    - Check if the command completes successfully.
    - If needed, verify in the Supabase Dashboard SQL Editor (if access is available) or by checking the application behavior.

## Troubleshooting
- **Connection Errors**: Verify `DATABASE_URL` in `.env`. Ensure the password is correct/escaped if it contains special characters.
- **Migration Conflicts**: If the database has changes not in your local migrations, `db push` might fail. You may need to inspect the DB state.
- **Missing Dependencies**: Ensure `supabase` is installed (`npm install supabase --save-dev` or use `npx`).
