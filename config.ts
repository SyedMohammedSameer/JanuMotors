// src/config.ts

// Supabase credentials are loaded from environment variables.
// For local dev, create a .env.local file (see .env.example).
// For Netlify, set these in Site Settings > Environment Variables.
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;