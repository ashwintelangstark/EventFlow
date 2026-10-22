import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hckxoiaoowzrvusxhzoc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja3hvaWFvb3d6cnZ1c3hoem9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1Nzg2OTAsImV4cCI6MjEwODE1NDY5MH0.UPN4mJUbAq0QZ1HHMt4N9ivwumm8zPYo5lD771TVIKI';

export const isSupabaseDirectReady = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseDirectReady
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;
