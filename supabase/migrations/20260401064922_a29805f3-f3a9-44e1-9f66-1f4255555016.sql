
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_type TEXT NOT NULL DEFAULT 'individual' CHECK (client_type IN ('individual', 'legal_entity')),
  
  -- Individual fields
  last_name TEXT,
  first_name TEXT,
  middle_name TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  passport_series TEXT,
  passport_number TEXT,
  passport_issued_date DATE,
  passport_issued_by TEXT,
  registration_address TEXT,
  
  -- Legal entity fields
  org_name TEXT,
  inn TEXT,
  kpp TEXT,
  ogrn TEXT,
  legal_address TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  bank_name TEXT,
  settlement_account TEXT,
  corr_account TEXT,
  bik TEXT,
  
  -- Common
  notes TEXT,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to clients" ON public.clients
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);
