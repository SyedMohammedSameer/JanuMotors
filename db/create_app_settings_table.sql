-- Shared application settings (tax rate, labour rate, notification preferences).
--
-- Before this table existed the Settings page saved to each browser's localStorage, so a rate changed on one
-- computer did not apply on another. The app reads and writes the single row with id = 'default'.
-- Until you run this script the app keeps working: it falls back to the browser and says so on the Settings page.
--
-- Run once in the Supabase SQL Editor. Safe to run more than once.

CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY NOT NULL DEFAULT 'default',
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18,
    labor_rate NUMERIC(10, 2) NOT NULL DEFAULT 80,
    notifications JSONB NOT NULL DEFAULT '{"lowStockAlerts": true, "invoiceReminders": true, "jobAlerts": true, "carWashAlerts": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Signed-in users only. There is intentionally no public read policy.
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.app_settings;
CREATE POLICY "Allow all access for authenticated users"
    ON public.app_settings FOR ALL USING (auth.role() = 'authenticated');

-- No row is seeded on purpose. Until the first save, the app keeps using the rates already in your browser (or the
-- defaults 18% / 80 per hour), so running this script never changes the amounts on new invoices by itself.
-- After deploying, open Settings once and press Save: that creates the shared row for every computer.
