-- Add lost_reason column to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS lost_reason text DEFAULT NULL;
