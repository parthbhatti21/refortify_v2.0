-- Check what data remains in the database
-- Run this in Supabase SQL Editor to see what's left

-- Check remaining clients
SELECT id, full_name, created_at 
FROM public.clients 
ORDER BY full_name;

-- Check remaining reports
SELECT r.id, r.client_name, r.client_id, r.created_at, c.full_name as client_full_name
FROM public.reports r
LEFT JOIN public.clients c ON r.client_id = c.id
ORDER BY r.created_at DESC
LIMIT 20;

-- Count remaining data
SELECT 
  (SELECT COUNT(*) FROM public.clients) as clients_count,
  (SELECT COUNT(*) FROM public.reports) as reports_count,
  (SELECT COUNT(*) FROM public.step1_json) as step1_count,
  (SELECT COUNT(*) FROM public.step3_json) as step3_count,
  (SELECT COUNT(*) FROM public.step5_invoice_json) as step5_invoice_count,
  (SELECT COUNT(*) FROM public.step5_part2_json) as step5_part2_count,
  (SELECT COUNT(*) FROM public.step6_json) as step6_count,
  (SELECT COUNT(*) FROM public.step7_json) as step7_count,
  (SELECT COUNT(*) FROM public.step8_json) as step8_count;



