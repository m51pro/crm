export interface Client {
  id: string;
  client_type: "individual" | "legal_entity";
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  org_name?: string;
  phone?: string;
  contact_phone?: string;
  email?: string;
  contact_email?: string;
  inn?: string;
  passport_series?: string;
  passport_number?: string;
  birth_date?: string;
  passport_issued_date?: string;
  passport_issued_by?: string;
  registration_address?: string;
  legal_address?: string;
  kpp?: string;
  ogrn?: string;
  contact_person?: string;
  bank_name?: string;
  settlement_account?: string;
  corr_account?: string;
  bik?: string;
  notes?: string;
  is_blacklisted?: boolean | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface Contract {
  id?: string;
  contract_number?: string;
  contract_date?: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  property?: "chunga_changa" | "golubaya_bukhta" | "gb_banya";
  cottage_id?: string;
  checkin_at?: string;
  checkout_at?: string;
  check_in_date?: string;
  check_out_date?: string;
  check_in_hour?: string | number;
  check_out_hour?: string | number;
  guest_count?: string | number;
  rent_price?: string | number;
  total?: string | number;
  prepayment?: string | number;
  payment_date?: string;
  payment_amount?: string | number;
  extra_info?: string;
  status?: string;
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
  bath_included?: boolean;
  bath_date?: string;
  bath_time_from?: string;
  bath_time_to?: string;
  is_full_day?: boolean;
  notes?: string;
  [key: string]: unknown;
  created_at?: string;
}

export interface ContractFormData extends Contract {
  is_prebooking?: boolean;
  checkin_at_date?: string;
  checkin_at_time?: string;
  checkout_at_date?: string;
  checkout_at_time?: string;
}

export type BookingStatus =
  | "pre_booking"
  | "contract_signed"
  | "contract_paid"
  | "not_paid"
  | "partial_paid"
  | "paid"
  | "cancelled";

export interface Booking {
  id: string;
  contract_id?: string;
  cottage_id?: string;
  property: string;
  client_name?: string;
  client_phone?: string;
  checkin_at?: string;
  checkout_at?: string;
  check_in_hour?: number | null;
  check_out_hour?: number | null;
  guest_count?: number;
  status?: BookingStatus | string;
  created_at?: string;
  isDaily?: boolean;
}

export interface Template {
  id: string;
  title: string;
  html_content: string;
  settings: Record<string, string | number>;
}
