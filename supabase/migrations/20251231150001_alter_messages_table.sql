-- Alter messages table to link to matches instead of leads

-- 1. Drop old constraint if exists (we'll check purely via SQL to be safe or just assume standard naming)
-- Note: Supabase/Postgres auto-names constraints like 'messages_thread_id_fkey' typically.

DO $$ BEGIN
    ALTER TABLE public.messages
    DROP CONSTRAINT IF EXISTS messages_thread_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Add new constraint to matches
ALTER TABLE public.messages
ADD CONSTRAINT messages_thread_id_fkey
FOREIGN KEY (thread_id)
REFERENCES public.matches(id)
ON DELETE CASCADE;

-- 3. Update RLS Policies for Messages (to use matches)

DROP POLICY IF EXISTS "Users can view messages for their leads" ON public.messages;
CREATE POLICY "Users can view messages for their matches"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.matches
        WHERE matches.id = messages.thread_id
        AND (matches.homeowner_id = auth.uid() OR matches.vendor_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can insert messages for their leads" ON public.messages;
CREATE POLICY "Users can insert messages for their matches"
ON public.messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.matches
        WHERE matches.id = messages.thread_id
        AND (matches.homeowner_id = auth.uid() OR matches.vendor_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can update messages for their leads" ON public.messages;
CREATE POLICY "Users can update messages for their matches"
ON public.messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.matches
        WHERE matches.id = messages.thread_id
        AND (matches.homeowner_id = auth.uid() OR matches.vendor_id = auth.uid())
    )
);
