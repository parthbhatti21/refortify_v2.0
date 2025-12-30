-- If you need to restore the three clients (but without their reports/data)
-- This will only recreate the client records, not their reports
-- Run this in Supabase SQL Editor

-- First, check if they already exist
SELECT id, full_name FROM public.clients 
WHERE full_name IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
   OR full_name ILIKE '%brady%mcgale%'
   OR full_name ILIKE '%elijah%joy%'
   OR full_name ILIKE '%tina%shetler%';

-- If they don't exist, you can insert them (you'll need a user_id for created_by)
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users
-- INSERT INTO public.clients (full_name, created_by)
-- VALUES 
--   ('Brady-McGale', 'YOUR_USER_ID_HERE'),
--   ('Elijah-Joy', 'YOUR_USER_ID_HERE'),
--   ('Tina-Shetler', 'YOUR_USER_ID_HERE')
-- ON CONFLICT DO NOTHING;

-- To get your user ID, run:
-- SELECT id, email FROM auth.users LIMIT 1;













