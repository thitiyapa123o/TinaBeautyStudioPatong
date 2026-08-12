-- Supabase Schema for Tina Beauty Studio
-- Run this once in the SQL editor of a FRESH Supabase project (SQL Editor -> New query).
--
-- Access model:
--  - services / staff: public reads active rows only; an authenticated admin
--    session can read/write everything.
--  - business_settings: public read (no PII in this table); admin write.
--  - customers / appointments: hold customer PII, so the public can only INSERT
--    (booking creates these rows) - nothing public can read them back. Admin
--    (authenticated) has full access. A narrow view exposes just enough
--    appointment data for the public "availability" calendar on the homepage.
--  - users (marketing/contact records, NOT a login table): no public policies
--    at all. The two public flows that touch it (booking, homepage promo
--    signup) go through SECURITY DEFINER functions instead, so the public
--    anon key never gets direct table access.
--  - Admin accounts live in Supabase Auth (Authentication -> Users), not in a
--    table here - create one there after running this script, then paste your
--    project's URL + anon key into js/config.js.

-- 1. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR DEFAULT 'Other',
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR,
    specialties TEXT[],
    bio TEXT,
    photo_url TEXT,
    working_hours JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers Table (PII - no public read, see RLS below)
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR,
    whatsapp VARCHAR,
    line_contact VARCHAR,
    address TEXT,
    birth_date DATE,
    notes TEXT,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Appointments Table (linked to customers - no public read, see RLS below)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    status VARCHAR DEFAULT 'scheduled',
    notes TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR UNIQUE NOT NULL,
    salon_name VARCHAR,
    address TEXT,
    phone VARCHAR,
    whatsapp VARCHAR,
    email VARCHAR,
    opening_hours JSONB,
    about_text TEXT,
    services_intro TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Users Table - marketing/contact records only. This is NOT a login table:
-- no password is stored here. Admin accounts live in Supabase Auth instead.
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    active BOOLEAN DEFAULT true,
    promotional_consent BOOLEAN DEFAULT false,
    promotional_signup_date TIMESTAMPTZ,
    promotional_source VARCHAR,
    created_by VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The old custom session-token table is gone - Supabase Auth manages sessions.
DROP TABLE IF EXISTS user_sessions;

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- services: public reads active rows only; admin session reads/writes everything
CREATE POLICY "services_public_read_active" ON services FOR SELECT TO anon USING (active = true);
CREATE POLICY "services_admin_read_all" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_admin_insert" ON services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "services_admin_update" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "services_admin_delete" ON services FOR DELETE TO authenticated USING (true);

-- staff: same pattern as services
CREATE POLICY "staff_public_read_active" ON staff FOR SELECT TO anon USING (active = true);
CREATE POLICY "staff_admin_read_all" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_admin_insert" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_admin_update" ON staff FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_admin_delete" ON staff FOR DELETE TO authenticated USING (true);

-- business_settings: public read (no PII), admin write
CREATE POLICY "settings_public_read" ON business_settings FOR SELECT TO anon USING (true);
CREATE POLICY "settings_admin_read" ON business_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_insert" ON business_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "settings_admin_update" ON business_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "settings_admin_delete" ON business_settings FOR DELETE TO authenticated USING (true);

-- customers: public can only INSERT (booking creates the record); nothing
-- public can read customer PII back. Admin session has full access.
CREATE POLICY "customers_public_insert" ON customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "customers_admin_read" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_admin_update" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "customers_admin_delete" ON customers FOR DELETE TO authenticated USING (true);

-- appointments: public can only INSERT (booking requests); nothing public can
-- read full rows (see public_appointment_slots view below). Admin has full access.
CREATE POLICY "appointments_public_insert" ON appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "appointments_admin_read" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "appointments_admin_update" ON appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "appointments_admin_delete" ON appointments FOR DELETE TO authenticated USING (true);

-- users: no public policies at all - the two RPC functions below are the only
-- way the public site touches this table.
CREATE POLICY "users_admin_read" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_admin_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_admin_update" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "users_admin_delete" ON users FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Public availability calendar (homepage)
-- A view exposing only the columns needed to render "is this slot free" -
-- no customer_id, notes, or price. Views run with the owner's privileges by
-- default, so this intentionally bypasses the appointments table's RLS to
-- show ALL appointments' date/time/status/service/staff, just not their
-- linked customer data.
-- ============================================================
CREATE OR REPLACE VIEW public_appointment_slots AS
SELECT date, time, status, service_id, staff_id
FROM appointments;

GRANT SELECT ON public_appointment_slots TO anon, authenticated;

-- ============================================================
-- SECURITY DEFINER functions: the only public path into `users`.
-- Both run with the privileges of the function owner (bypassing RLS on this
-- one table, for this one narrow purpose) instead of opening the table itself
-- up to the anon key. SET search_path pins the schema to prevent hijacking.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_promotional_subscriber(check_email TEXT)
RETURNS TABLE(subscribed BOOLEAN, signup_date TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT promotional_consent, promotional_signup_date
    FROM users
    WHERE lower(email) = lower(check_email)
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_promotional_subscriber(TEXT) TO anon;

CREATE OR REPLACE FUNCTION public.upsert_customer_account(
    p_name TEXT,
    p_email TEXT,
    p_promotional_consent BOOLEAN,
    p_source TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO users (name, email, active, promotional_consent, promotional_signup_date, promotional_source, created_by)
    VALUES (
        p_name, p_email, true, p_promotional_consent,
        CASE WHEN p_promotional_consent THEN NOW() END,
        CASE WHEN p_promotional_consent THEN p_source END,
        p_source
    )
    ON CONFLICT (email) DO UPDATE SET
        promotional_consent = users.promotional_consent OR EXCLUDED.promotional_consent,
        promotional_signup_date = CASE
            WHEN users.promotional_consent IS NOT TRUE AND EXCLUDED.promotional_consent
            THEN NOW() ELSE users.promotional_signup_date
        END,
        promotional_source = CASE
            WHEN users.promotional_consent IS NOT TRUE AND EXCLUDED.promotional_consent
            THEN EXCLUDED.promotional_source ELSE users.promotional_source
        END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_customer_account(TEXT, TEXT, BOOLEAN, TEXT) TO anon;
