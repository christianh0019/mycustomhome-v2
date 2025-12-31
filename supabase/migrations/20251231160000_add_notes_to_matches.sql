-- Add notes column to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
