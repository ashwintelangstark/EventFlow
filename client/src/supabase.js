import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hckxoiaoowzrvusxhzoc.supabase.co';
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja3hvaWFvb3d6cnZ1c3hoem9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjU3ODY5MCwiZXhwIjoyMTA4MTU0NjkwfQ.xHk4YXAxBmKUHMldCqR2HOmuzk5EJH_5Xj4zx_wcYlA';

export const isSupabaseDirectReady = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseDirectReady
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;
