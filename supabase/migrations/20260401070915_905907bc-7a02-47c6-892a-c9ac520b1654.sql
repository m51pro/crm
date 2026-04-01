
-- Create contract status enum
CREATE TYPE public.contract_status AS ENUM ('pre_booking', 'signed', 'paid', 'cancelled');

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number TEXT NOT NULL,
  contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  property TEXT NOT NULL DEFAULT 'chunga_changa',
  cottage_id TEXT NOT NULL,
  check_in_date DATE,
  check_in_hour INTEGER,
  check_out_date DATE,
  check_out_hour INTEGER,
  is_daily BOOLEAN NOT NULL DEFAULT false,
  guest_count INTEGER,
  total_amount NUMERIC(12,2) DEFAULT 0,
  prepayment_amount NUMERIC(12,2) DEFAULT 0,
  status contract_status NOT NULL DEFAULT 'pre_booking',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Allow all access (single-user CRM, no auth)
CREATE POLICY "Allow all access to contracts"
  ON public.contracts FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
