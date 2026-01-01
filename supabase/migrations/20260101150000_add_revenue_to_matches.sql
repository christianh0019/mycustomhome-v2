-- Add revenue column to matches table for tracking won deal value
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS revenue numeric DEFAULT NULL;
