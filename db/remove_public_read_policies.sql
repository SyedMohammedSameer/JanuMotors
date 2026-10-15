-- Removes the anonymous "public read" policies that earlier versions of the README created.
--
-- Why: the Supabase anon key is embedded in the web app, so with a `FOR SELECT USING (true)` policy anyone on the
-- internet could read every row (customers' phones/emails, invoices, payroll) without logging in.
-- The app only reads data after a user has signed in, and the "Allow all access for authenticated users" policies
-- stay in place, so removing these policies does not affect normal use.
--
-- Run this once in the Supabase SQL Editor. It is safe to run more than once and skips tables that do not exist.

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'workers', 'customers', 'vehicles', 'inventory', 'job_cards',
        'invoices', 'attendance', 'payroll', 'carwash_bookings', 'app_settings'
    ] LOOP
        IF to_regclass('public.' || t) IS NOT NULL THEN
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I', t);
        END IF;
    END LOOP;
END $$;

-- Afterwards, review what is left. Every policy listed should mention authenticated users, none should be "true":
--   SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
-- Also confirm Row Level Security is ON for each table (Table Editor shows an "RLS enabled" badge), including
-- carwash_bookings, which is not part of the README schema.
