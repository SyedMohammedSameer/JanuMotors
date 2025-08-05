-- OPTION 1: DISABLE RLS (Recommended for demo/development)
-- This completely disables Row Level Security for all tables
-- Run this if you want to disable RLS entirely:

ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll DISABLE ROW LEVEL SECURITY;

-- OPTION 2: UPDATE RLS POLICIES FOR ANONYMOUS ACCESS
-- This keeps RLS enabled but allows anonymous users to perform operations
-- Uncomment the lines below if you prefer to keep RLS enabled:

/*
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.workers;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.inventory;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.job_cards;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.payroll;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow all access for anonymous users" ON public.workers FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.inventory FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.job_cards FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow all access for anonymous users" ON public.payroll FOR ALL USING (true);
*/ 