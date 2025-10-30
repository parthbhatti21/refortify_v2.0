import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://pqxzjegpbavcxzyqxhbr.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeHpqZWdwYmF2Y3h6eXF4aGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjcyMTUsImV4cCI6MjA3NzQwMzIxNX0.H0FRdgsgtEHytu5oHfdHnWEdeFQEeFVg79lQbiAHaic';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


