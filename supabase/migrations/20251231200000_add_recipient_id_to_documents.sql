
-- Add recipient_id column to documents
alter table public.documents
add column if not exists recipient_id uuid references public.profiles(id);

-- RLS Policies for Recipient
-- 1. View
drop policy if exists "Recipients can view their documents" on public.documents;
create policy "Recipients can view their documents"
  on public.documents for select
  using (auth.uid() = recipient_id);

-- 2. Update (for signing status/values)
drop policy if exists "Recipients can update their documents" on public.documents;
create policy "Recipients can update their documents"
  on public.documents for update
  using (auth.uid() = recipient_id);

-- Backfill for testing (Fixing the current user's issue)
-- Match 'chossbiz' name to their profile ID
DO $$
DECLARE
  v_homeowner_id uuid;
BEGIN
  SELECT id INTO v_homeowner_id FROM public.profiles WHERE full_name = 'chossbiz' OR full_name = 'Chossbiz' LIMIT 1;
  
  IF v_homeowner_id IS NOT NULL THEN
    UPDATE public.documents 
    SET recipient_id = v_homeowner_id 
    WHERE recipient_name ILIKE '%chossbiz%' AND recipient_id IS NULL;
    
    RAISE NOTICE 'Backfilled recipient_id for chossbiz documents.';
  END IF;
END $$;
