-- WARNING: This script will DELETE all clients except the three specified ones
-- Keep only: Brady-McGale, Elijah-Joy, Tina-Shetler
-- Run this in Supabase SQL Editor
-- Make sure you have a backup before running this!

-- Step 1: Delete step JSON data for reports belonging to clients NOT in the keep list
DELETE FROM public.step1_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step3_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step5_invoice_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step5_part2_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step6_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step7_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

DELETE FROM public.step8_json
WHERE report_id IN (
  SELECT r.id 
  FROM public.reports r
  LEFT JOIN public.clients c ON r.client_id = c.id
  WHERE c.full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
    OR c.full_name IS NULL
);

-- Step 2: Delete reports for clients NOT in the keep list
DELETE FROM public.reports
WHERE client_id IN (
  SELECT id 
  FROM public.clients
  WHERE full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
)
OR client_id IS NULL
OR client_id NOT IN (
  SELECT id 
  FROM public.clients
  WHERE full_name IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler')
);

-- Step 3: Delete clients NOT in the keep list
DELETE FROM public.clients
WHERE full_name NOT IN ('Brady-McGale', 'Elijah-Joy', 'Tina-Shetler');

-- Verify deletion (optional - run these to check)
-- SELECT full_name, COUNT(*) as report_count 
-- FROM public.clients c
-- LEFT JOIN public.reports r ON c.id = r.client_id
-- GROUP BY c.id, c.full_name
-- ORDER BY c.full_name;

