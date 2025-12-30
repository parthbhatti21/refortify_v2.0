-- Fix UUID defaults for clients and reports tables
-- Run this in Supabase SQL Editor to ensure UUIDs are auto-generated

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix clients table: Set default UUID for id column
ALTER TABLE public.clients 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Fix reports table: Set default UUID for id column  
ALTER TABLE public.reports 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the changes
SELECT 
  column_name, 
  column_default,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'reports')
  AND column_name = 'id';





