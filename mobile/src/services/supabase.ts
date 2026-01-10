import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzqqeodwdpqlsgvydqyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXFlb2R3ZHBxbHNndnlkcXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODQ5MTQsImV4cCI6MjA3ODI2MDkxNH0.tDYMxOsIlIso-478XVgbP91zt13O3M_j9Xc7PGyzEX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
