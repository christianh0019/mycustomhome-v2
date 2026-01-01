-- Add detailed business profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS legal_business_name text,
ADD COLUMN IF NOT EXISTS friendly_business_name text,
ADD COLUMN IF NOT EXISTS business_email text,
ADD COLUMN IF NOT EXISTS business_phone text,
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS website text;

-- Add a comment to document field usage
COMMENT ON COLUMN public.profiles.legal_business_name IS 'Official registered business name (LLC, Inc, etc.)';
COMMENT ON COLUMN public.profiles.friendly_business_name IS 'Display name for the business (e.g. Acme Builders)';
