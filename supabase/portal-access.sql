ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS is_client boolean NOT NULL DEFAULT false;

UPDATE public.students
SET is_client = false
WHERE is_client IS NULL;

-- Set trusted client accounts explicitly, for example:
-- UPDATE public.students SET is_client = true WHERE email = 'client@example.com';
-- Admin accounts use the existing is_admin column.
