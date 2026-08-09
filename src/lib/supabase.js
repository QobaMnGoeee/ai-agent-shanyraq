import { createClient } from "@supabase/supabase-js";

// Бұл екі мәнді .env файлынан аласың (Supabase Dashboard → Project Settings → API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
