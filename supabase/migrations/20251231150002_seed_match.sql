-- Seed a Match between two profiles

DO $$
DECLARE
    homeowner_id uuid;
    vendor_id uuid;
BEGIN
    -- 1. Find a Homeowner (Just pick one)
    SELECT id INTO homeowner_id FROM public.profiles LIMIT 1;
    
    -- 2. Find a Vendor (Pick a different one if possible, or same for loopback test)
    SELECT id INTO vendor_id FROM public.profiles WHERE id != homeowner_id LIMIT 1;

    -- Fallback: If only 1 user exists, use them for both (Loopback)
    IF vendor_id IS NULL THEN
        vendor_id := homeowner_id;
    END IF;

    IF homeowner_id IS NOT NULL AND vendor_id IS NOT NULL THEN
        INSERT INTO public.matches (homeowner_id, vendor_id, status)
        VALUES (homeowner_id, vendor_id, 'active')
        ON CONFLICT (homeowner_id, vendor_id) DO NOTHING;
    END IF;
END $$;
