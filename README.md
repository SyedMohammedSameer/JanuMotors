# JANU MOTORS - Car Garage Management System

This is a comprehensive, full-featured Car Garage Management System built as a modern single-page web application. It provides an intuitive and responsive UI to manage all aspects of a busy garage. This version is integrated with a Supabase backend for persistent data storage.

## Key Features

- **Database Persistence**: All data is stored and managed in a Supabase PostgreSQL database.
- **Dashboard**: A real-time overview of key metrics from the database.
- **Full CRUD Operations**: Create, Read, Update, and Delete functionality works across all modules (Customers, Jobs, Invoices, etc.) and persists in the database.
- **Downloadable PDF Invoices**: Generate professional, downloadable PDF invoices from completed jobs.
- **And all other features from the previous version...**

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, React Router 6, Tailwind CSS
- **Backend**: **Supabase** (PostgreSQL, Auth, Storage)
- **Charts**: Recharts
- **PDF Generation**: jsPDF, html2canvas

---

## **Required Setup: Supabase Configuration**

To run this application, you **MUST** create a Supabase project and configure the application to connect to it.

### Step 1: Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com/) and create a new project.
2.  Save your **Project URL** and **Project `anon` Key**. You will need these in the next step.

### Step 2: Configure the Application

1.  Open the file named `config.ts` in the project's root directory.
2.  Replace the placeholder values with your actual Supabase credentials from Step 1.

    ```typescript
    // src/config.ts
    export const supabaseUrl = 'YOUR_SUPABASE_URL'; // Paste your Project URL here
    export const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Paste your Project anon Key here
    ```

### Step 3: Set Up the Database Schema

1.  In your Supabase project dashboard, go to the **SQL Editor**.
2.  Click **New query**.
3.  Copy the entire SQL script below and paste it into the Supabase SQL Editor.
4.  Click **RUN**. This will create all the necessary tables, types, and relationships for the application to function correctly.

```sql
-- Create ENUM types for status fields
CREATE TYPE public.job_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE public.payment_status AS ENUM ('Paid', 'Unpaid', 'Partial');
CREATE TYPE public.worker_role AS ENUM ('Mechanic', 'Receptionist', 'Manager');
CREATE TYPE public.comm_type AS ENUM ('Call', 'Visit', 'Email');
CREATE TYPE public.payment_method AS ENUM ('Cash', 'Card', 'Transfer');

-- 1. Workers Table
CREATE TABLE public.workers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role worker_role NOT NULL
);
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.workers FOR ALL USING (auth.role() = 'authenticated');


-- 2. Customers Table
CREATE TABLE public.customers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    communication_log JSONB DEFAULT '[]'::jsonb,
    service_history JSONB DEFAULT '[]'::jsonb
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.customers FOR ALL USING (auth.role() = 'authenticated');


-- 3. Vehicles Table
CREATE TABLE public.vehicles (
    id TEXT PRIMARY KEY NOT NULL,
    make TEXT,
    model TEXT,
    year INT,
    vin TEXT,
    license_plate TEXT,
    owner_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.vehicles FOR ALL USING (auth.role() = 'authenticated');


-- 4. Inventory Table
CREATE TABLE public.inventory (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier TEXT
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');


-- 5. Job Cards Table
CREATE TABLE public.job_cards (
    id TEXT PRIMARY KEY NOT NULL,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    assigned_to TEXT REFERENCES public.workers(id) ON DELETE SET NULL,
    description TEXT,
    status job_status NOT NULL DEFAULT 'Pending',
    parts_used JSONB DEFAULT '[]'::jsonb,
    labor_hours NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_date TIMESTAMPTZ
);
ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.job_cards FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.job_cards FOR ALL USING (auth.role() = 'authenticated');


-- 6. Invoices Table
CREATE TABLE public.invoices (
    id TEXT PRIMARY KEY NOT NULL,
    job_card_id TEXT NOT NULL REFERENCES public.job_cards(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(5, 2) NOT NULL,
    discount NUMERIC(10, 2),
    total NUMERIC(10, 2) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'Unpaid',
    payment_method payment_method
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');


-- 7. Attendance Table
CREATE TABLE public.attendance (
    id TEXT PRIMARY KEY NOT NULL,
    worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    daily_pay NUMERIC(10, 2)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.attendance FOR ALL USING (auth.role() = 'authenticated');


-- 8. Payroll Table
CREATE TABLE public.payroll (
    id TEXT PRIMARY KEY NOT NULL,
    worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    notes TEXT
);
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.payroll FOR SELECT USING (true);
CREATE POLICY "Allow all access for authenticated users" ON public.payroll FOR ALL USING (auth.role() = 'authenticated');

```
---

Once these steps are completed, the application will be connected to your Supabase project, and all data will be persistent. All features, including delete functionality, will work as expected.