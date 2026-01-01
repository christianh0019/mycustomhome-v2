-- Broadcast a match to ALL profiles to ensure the logged-in user sees it
-- Instead of creating a new user (which requires auth.users insert), we reuse existing profiles.

DO $$
DECLARE
    vendor_rec RECORD;
    v_homeowner_id uuid;
BEGIN
    -- Loop through all profiles treating them as potential vendors
    FOR vendor_rec IN SELECT id FROM public.profiles LOOP
        
        -- Try to find a DIFFERENT profile to be the homeowner
        SELECT id INTO v_homeowner_id FROM public.profiles WHERE id != vendor_rec.id LIMIT 1;
        
        -- If no other user exists, match with SELF (Loopback for testing single-user dev envs)
        IF v_homeowner_id IS NULL THEN
            v_homeowner_id := vendor_rec.id;
        END IF;

        IF v_homeowner_id IS NOT NULL THEN
            -- Check if a reverse match already exists to avoid duplicates in the UI
            IF NOT EXISTS (
                SELECT 1 FROM public.matches 
                WHERE homeowner_id = vendor_rec.id AND vendor_id = v_homeowner_id
            ) THEN
                INSERT INTO public.matches (vendor_id, homeowner_id, status, pipeline_stage)
                VALUES (vendor_rec.id, v_homeowner_id, 'active', 'new request')
                ON CONFLICT (vendor_id, homeowner_id) 
                DO UPDATE SET 
                    pipeline_stage = 'new request',
                    status = 'active',
                    lost_reason = NULL;
            END IF;
        END IF;

    END LOOP;
END $$;
