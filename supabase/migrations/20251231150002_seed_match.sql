-- Seed a Match between two profiles

DO $$
DECLARE
    v_homeowner_id uuid;
    v_vendor_id uuid;
BEGIN
    -- 1. Find a Homeowner (Just pick one)
    SELECT id INTO v_homeowner_id FROM public.profiles LIMIT 1;
    
    -- 2. Find a Vendor (Pick a different one if possible, or same for loopback test)
    SELECT id INTO v_vendor_id FROM public.profiles WHERE id != v_homeowner_id LIMIT 1;

    -- Fallback: If only 1 user exists, use them for both (Loopback)
    IF v_vendor_id IS NULL THEN
        v_vendor_id := v_homeowner_id;
    END IF;

    IF v_homeowner_id IS NOT NULL AND v_vendor_id IS NOT NULL THEN
        INSERT INTO public.matches (homeowner_id, vendor_id, status)
        VALUES (v_homeowner_id, v_vendor_id, 'active')
        ON CONFLICT (homeowner_id, vendor_id) DO NOTHING;
    END IF;
END $$;
