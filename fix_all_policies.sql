-- Comprehensive policy update: allow all authenticated users to view all data
-- This script handles existing policies and creates new ones if needed

-- First, drop all existing SELECT policies that might be blocking access
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all SELECT policies on clients
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND policyname LIKE '%select%') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.clients';
    END LOOP;
    
    -- Drop all SELECT policies on reports
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reports' AND policyname LIKE '%select%') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.reports';
    END LOOP;
    
    -- Drop all SELECT policies on step JSON tables
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename IN ('step1_json', 'step3_json', 'step5_invoice_json', 'step5_part2_json', 'step6_json', 'step7_json', 'step8_json') AND policyname LIKE '%select%') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Create new SELECT policies allowing all authenticated users to view all data

-- Clients: all authenticated users can view all clients
CREATE POLICY clients_select
  ON public.clients FOR SELECT TO authenticated
  USING (true);

-- Reports: all authenticated users can view all reports
CREATE POLICY reports_select
  ON public.reports FOR SELECT TO authenticated
  USING (true);

-- Step JSON tables: all authenticated users can view all step data
CREATE POLICY step1_json_select
  ON public.step1_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step3_json_select
  ON public.step3_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step5_invoice_json_select
  ON public.step5_invoice_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step5_part2_json_select
  ON public.step5_part2_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step6_json_select
  ON public.step6_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step7_json_select
  ON public.step7_json FOR SELECT TO authenticated
  USING (true);

CREATE POLICY step8_json_select
  ON public.step8_json FOR SELECT TO authenticated
  USING (true);

-- Note: INSERT/UPDATE/DELETE policies remain restricted to owners (no changes needed)

