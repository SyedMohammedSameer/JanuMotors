-- Add coupon_id column to the customers table for VIP coupon support
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS coupon_id TEXT;
