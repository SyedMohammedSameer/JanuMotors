import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

// Kept separate from vite.config.ts so the production build is unaffected.
// The garage runs on India time; pinning it keeps date-dependent tests identical on every developer machine.
process.env.TZ = 'Asia/Kolkata';

export default defineConfig({
  resolve: {
    alias: { '@': root },
  },
  // Tests must never reach a real database: blank the Supabase variables so the client is never created.
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(''),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
