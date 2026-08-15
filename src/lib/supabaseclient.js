import { createClient } from "@supabase/supabase-js";

//   VITE_SUPABASE_URL=https://xxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) 
{
    throw new Error("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
}

// Instancia única: todos los repositorios importan este mismo cliente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);