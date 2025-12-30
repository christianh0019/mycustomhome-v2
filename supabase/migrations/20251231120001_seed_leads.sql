-- Seeding Mock Leads for Testing
-- This tries to find a user profile and insert leads for them.

DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Try to find a user. In local dev, there's usually at least one.
    SELECT id INTO target_user_id FROM public.profiles LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.leads (homeowner_id, project_title, location_city, location_state, status, budget_range)
        VALUES 
            (target_user_id, 'Modern Lake House', 'Austin', 'TX', 'active', '$1.5M - $2M'),
            (target_user_id, 'Downtown Loft Renovation', 'New York', 'NY', 'vetting', '$500k - $750k'),
            (target_user_id, 'Aspen Mountain Cabin', 'Aspen', 'CO', 'draft', '$2M+')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
