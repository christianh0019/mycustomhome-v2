
-- Delete dependencies and the invalid test match where roles were reversed
-- Match ID: cd2f3890-f4a8-4db8-8c54-cf677f90dab3

-- 1. Delete associated notes
DELETE FROM public.match_notes 
WHERE match_id = 'cd2f3890-f4a8-4db8-8c54-cf677f90dab3';

-- 2. Delete associated messages (if any messages used this thread_id)
DELETE FROM public.messages 
WHERE thread_id = 'cd2f3890-f4a8-4db8-8c54-cf677f90dab3';

-- 3. Delete the match itself
DELETE FROM public.matches 
WHERE id = 'cd2f3890-f4a8-4db8-8c54-cf677f90dab3';
