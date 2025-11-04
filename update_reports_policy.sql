-- Update policies: allow all authenticated users to view all clients, reports, and step data
-- but only owners can modify their own data

-- Clients: all authenticated users can view all clients
DROP POLICY IF EXISTS clients_select ON public.clients;
CREATE POLICY clients_select
  ON public.clients FOR SELECT TO authenticated
  USING (true);

-- Reports: all authenticated users can view all reports
DROP POLICY IF EXISTS reports_select ON public.reports;
CREATE POLICY reports_select
  ON public.reports FOR SELECT TO authenticated
  USING (true);

-- Step JSON tables: all authenticated users can view all step data
DROP POLICY IF EXISTS step1_json_select ON public.step1_json;
CREATE POLICY step1_json_select
  ON public.step1_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step3_json_select ON public.step3_json;
CREATE POLICY step3_json_select
  ON public.step3_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step5_invoice_json_select ON public.step5_invoice_json;
CREATE POLICY step5_invoice_json_select
  ON public.step5_invoice_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step5_part2_json_select ON public.step5_part2_json;
CREATE POLICY step5_part2_json_select
  ON public.step5_part2_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step6_json_select ON public.step6_json;
CREATE POLICY step6_json_select
  ON public.step6_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step7_json_select ON public.step7_json;
CREATE POLICY step7_json_select
  ON public.step7_json FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS step8_json_select ON public.step8_json;
CREATE POLICY step8_json_select
  ON public.step8_json FOR SELECT TO authenticated
  USING (true);

-- Keep INSERT/UPDATE/DELETE restricted to owners (no changes needed)

