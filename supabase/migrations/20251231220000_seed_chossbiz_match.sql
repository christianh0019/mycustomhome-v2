DO $$
DECLARE
    v_vendor_id uuid;
    v_homeowner_id uuid;
BEGIN
    -- 1. Find the Vendor
    SELECT id INTO v_vendor_id FROM public.profiles WHERE role = 'vendor' LIMIT 1;

    -- 2. Find or Create 'chossbiz' Homeowner
    SELECT id INTO v_homeowner_id FROM public.profiles 
    WHERE full_name ILIKE 'chossbiz%' OR email ILIKE '%chossbiz%' 
    LIMIT 1;

    IF v_homeowner_id IS NULL THEN
        INSERT INTO public.profiles (id, full_name, role, email, city, budget_range, avatar_url)
        VALUES (
            gen_random_uuid(),
            'chossbiz',
            'homeowner',
            'chossbiz@example.com',
            'San Francisco',
            '$1.2M - $1.5M',
            'https://ui-avatars.com/api/?name=chossbiz&background=random'
        ) RETURNING id INTO v_homeowner_id;
        RAISE NOTICE 'Created new homeowner profile for chossbiz';
    END IF;

    -- 3. Insert or Update Match
    IF v_vendor_id IS NOT NULL AND v_homeowner_id IS NOT NULL THEN
        INSERT INTO public.matches (vendor_id, homeowner_id, status, pipeline_stage)
        VALUES (v_vendor_id, v_homeowner_id, 'active', 'new request')
        ON CONFLICT (vendor_id, homeowner_id) 
        DO UPDATE SET 
            pipeline_stage = 'new request', -- Reset to new request as requested
            lost_reason = NULL, -- Clear any lost reason
            updated_at = now();
            
        RAISE NOTICE 'Ensured chossbiz match is in pipeline for vendor %', v_vendor_id;
    END IF;
END $$;
