import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';
import { Database } from './database.types';

let supabase: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
        supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Error creating Supabase client:", error);
        supabase = null;
    }
} else {
    console.warn("Supabase credentials are not configured. Please check your config.ts file.");
}

export { supabase };
