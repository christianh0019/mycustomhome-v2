-- Allow users to update their own matches (e.g. for saving notes)
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;

CREATE POLICY "Users can update their own matches"
ON public.matches FOR UPDATE
USING (
    auth.uid() = homeowner_id OR auth.uid() = vendor_id
)
WITH CHECK (
    auth.uid() = homeowner_id OR auth.uid() = vendor_id
);
