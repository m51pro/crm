
-- Booking status enum
CREATE TYPE public.booking_status AS ENUM ('pre_booking', 'contract_signed', 'contract_paid');

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cottage_id TEXT NOT NULL,
  property TEXT NOT NULL DEFAULT 'chunga_changa',
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  check_in_hour INTEGER,
  check_out_hour INTEGER,
  check_in_date DATE,
  check_out_date DATE,
  is_daily BOOLEAN NOT NULL DEFAULT false,
  guest_count INTEGER,
  contract_number TEXT,
  status booking_status NOT NULL DEFAULT 'pre_booking',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: public read for now (single manager, no auth yet)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
