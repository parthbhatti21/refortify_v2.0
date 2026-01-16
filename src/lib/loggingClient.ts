import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Logging database configuration (NEW Supabase project)
const LOGGING_SUPABASE_URL = process.env.REACT_APP_LOGGING_SUPABASE_URL || '';
const LOGGING_SUPABASE_ANON_KEY = process.env.REACT_APP_LOGGING_SUPABASE_ANON_KEY || '';

// Only create client if URL and key are provided
export const loggingClient: SupabaseClient | null = 
  LOGGING_SUPABASE_URL && LOGGING_SUPABASE_ANON_KEY
    ? createClient(LOGGING_SUPABASE_URL, LOGGING_SUPABASE_ANON_KEY)
    : null;

