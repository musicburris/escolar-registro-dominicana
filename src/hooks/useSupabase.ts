import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export const useSupabase = () => {
  return supabase;
};