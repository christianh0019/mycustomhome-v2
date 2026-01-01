-- Broadcast 'chossbiz' match to ALL profiles to ensure the logged-in user sees it
DO $$
DECLARE
    v_homeowner_id uuid;
BEGIN
    -- 1. Ensure 'chossbiz' homeowner exists
    SELECT id INTO v_homeowner_id FROM public.profiles 
    WHERE email = 'chossbiz@example.com' LIMIT 1;

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
    END IF;

    -- 2. Create a match for EVERY other profile (potential vendor)
    INSERT INTO public.matches (vendor_id, homeowner_id, status, pipeline_stage)
    SELECT id, v_homeowner_id, 'active', 'new request'
    FROM public.profiles
    WHERE id != v_homeowner_id
    ON CONFLICT (vendor_id, homeowner_id) 
    DO UPDATE SET 
        pipeline_stage = 'new request',
        status = 'active',
        lost_reason = NULL;

END $$;
