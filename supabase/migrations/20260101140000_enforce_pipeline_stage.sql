-- 1. Backfill existing nulls to 'new request'
UPDATE public.matches
SET pipeline_stage = 'new request'
WHERE pipeline_stage IS NULL;

-- 2. Enforce NOT NULL constraint to prevent future nulls
ALTER TABLE public.matches
ALTER COLUMN pipeline_stage SET DEFAULT 'new request';

ALTER TABLE public.matches
ALTER COLUMN pipeline_stage SET NOT NULL;
