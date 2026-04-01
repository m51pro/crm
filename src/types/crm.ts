export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  org_name?: string;
  phone?: string;
  contact_phone?: string;
  client_type: "individual" | "legal";
  inn?: string;
  client_inn?: string;
  passport?: string;
  kpp?: string;
  ogrn?: string;
  registration_address?: string;
  bank?: string;
  bik?: string;
  account?: string;
  corr?: string;
  signatory?: string;
  basis?: string;
  birth_date?: string;
  passport_issued_date?: string;
  passport_issued_by?: string;
  [key: string]: unknown;
}

export interface Contract {
  id?: string;
  contract_number?: string;
  contract_date?: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  property?: "chunga_changa" | "golubaya_bukhta";
  cottage_id?: string;
  bath_included?: boolean;
  bath_date?: string;
  bath_time_from?: string;
  bath_time_to?: string;
  checkin_at?: string;
  checkin_at_date?: string;
  checkin_at_time?: string;
  check_in_date?: string;
  check_in_hour?: string | number;
  checkout_at?: string;
  checkout_at_date?: string;
  checkout_at_time?: string;
  check_out_date?: string;
  check_out_hour?: string | number;
  guest_count?: string | number;
  rent_price?: string | number;
  total?: string | number;
  total_amount?: string | number;
  prepayment?: string | number;
  prepayment_amount?: string | number;
  payment_date?: string;
  payment_amount?: string | number;
  extra_info?: string;
  notes?: string;
  status?: string;
  is_prebooking?: boolean;
  is_full_day?: boolean;
  cottage_included?: boolean;
  sauna_included?: boolean;
  hot_tub_included?: boolean;
  sauna_date?: string;
  sauna_time_from?: string;
  sauna_time_to?: string;
  sauna_price?: string | number;
  sauna_guests?: string | number;
  hot_tub_date?: string;
  hot_tub_time_from?: string;
  hot_tub_time_to?: string;
  hot_tub_price?: string | number;
  hot_tub_guests?: string | number;
  created_at?: string;
}

export interface Template {
  id: string;
  title: string;
  html_content: string;
  settings: Record<string, string | number>;
}
