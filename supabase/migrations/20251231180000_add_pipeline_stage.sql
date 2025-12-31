-- Add pipeline_stage column to matches table for Vendor Sales Pipeline
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'new request';

-- Optional: Add a check constraint to ensure valid stages (or just handle in app code for flexibility)
-- We will stick to the requested stages: "new request", "contacted", "proposal sent", "won"
