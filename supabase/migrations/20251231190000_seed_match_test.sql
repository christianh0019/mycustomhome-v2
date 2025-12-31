
-- Seed a match between the main vendor and the main homeowner for testing

DO $$
DECLARE
    v_vendor_id uuid;
    v_homeowner_id uuid;
BEGIN
    -- 1. Find the Vendor (assuming 'christian' from debug output or just the first vendor)
    SELECT id INTO v_vendor_id FROM public.profiles WHERE role = 'vendor' LIMIT 1;

    -- 2. Find the Homeowner (presumed 'chossbiz')
    SELECT id INTO v_homeowner_id FROM public.profiles WHERE role = 'homeowner' LIMIT 1;

    -- 3. Insert Match if both exist
    IF v_vendor_id IS NOT NULL AND v_homeowner_id IS NOT NULL THEN
        INSERT INTO public.matches (vendor_id, homeowner_id, status)
        VALUES (v_vendor_id, v_homeowner_id, 'active')
        ON CONFLICT (vendor_id, homeowner_id) DO NOTHING;
        
        RAISE NOTICE 'Seeded match between Vendor % and Homeowner %', v_vendor_id, v_homeowner_id;
    ELSE
        RAISE NOTICE 'Could not find vendor or homeowner to seed match.';
    END IF;
END $$;
