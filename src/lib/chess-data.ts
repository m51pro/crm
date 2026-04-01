// Static configuration for properties

export const CHUNGA_CHANGA_COTTAGES = [
  { id: "cc-1", name: "Дом №1", capacity: 15 },
  { id: "cc-2", name: "Дом №2", capacity: 10 },
  { id: "cc-3", name: "Дом №3", capacity: 15 },
  { id: "cc-4", name: "Дом №4", capacity: 30 },
  { id: "cc-5", name: "Дом №5", capacity: null },
  { id: "cc-6", name: "Дом №6", capacity: 15 },
  { id: "cc-8", name: "Дом №8", capacity: 30 },
  { id: "cc-9", name: "Дом №9", capacity: 20 },
  { id: "cc-10", name: "Дом №10", capacity: 15 },
  { id: "cc-11", name: "Дом №11", capacity: 15 },
  { id: "cc-12", name: "Дом №12", capacity: 15 },
  { id: "cc-14", name: "Дом №14", capacity: 15 },
  { id: "cc-15", name: "Дом №15", capacity: 15 },
];

export const GB_COTTAGES = [
  { id: "gb-1", name: "Коттедж №1" },
  { id: "gb-2", name: "Коттедж №2" },
  { id: "gb-3-1", name: "Коттедж №3/1" },
  { id: "gb-3-2", name: "Коттедж №3/2" },
  { id: "gb-3-3", name: "Коттедж №3/3" },
  { id: "gb-3-4", name: "Коттедж №3/4" },
  { id: "gb-3-5", name: "Коттедж №3/5" },
  { id: "gb-5-1", name: "Коттедж №5.1" },
  { id: "gb-5-2", name: "Коттедж №5.2" },
  { id: "gb-6-1", name: "Коттедж №6.1" },
  { id: "gb-6-2", name: "Коттедж №6.2" },
];

export const GB_BANYA_ITEMS = [
  { id: "gb-banya", name: "Баня" },
  { id: "gb-furako", name: "Фурако" },
];

// Hours starting from 10:00 wrapping around to 9:00 (24h)
export const HOURS_CC = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
];

// Hours starting from 12:00 wrapping around to 11:00 (24h)
export const HOURS_GB_BANYA = [
  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
];

export const BOOKING_COLORS = {
  pre_booking: [
    "bg-sky-300 text-sky-950 border-none",
  ],
  contract_signed: [
    "bg-amber-500 text-amber-950 border-none shadow-sm",
  ],
  contract_paid: [
    "bg-emerald-500 text-white border-none shadow-md",
  ],
};

export type BookingStatus = "pre_booking" | "contract_signed" | "contract_paid";

export interface Booking {
  id: string;
  cottageId: string;
  property?: string;
  clientName: string;
  phone: string;
  email?: string;
  checkInHour: number;
  checkOutHour: number;
  check_in_hour?: number;
  check_out_hour?: number;
  guestCount: number;
  guest_count?: number;
  contractNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkin_at?: string;
  checkout_at?: string;
  isDaily?: boolean;
  status: BookingStatus;
  notes?: string;
}

// Mock bookings for demo
export const MOCK_BOOKINGS_CC: Booking[] = [
  {
    id: "b1",
    cottageId: "cc-1",
    clientName: "Иванов А.П.",
    phone: "+7 (900) 123-45-67",
    checkInHour: 10,
    checkOutHour: 16,
    guestCount: 12,
    contractNumber: "Д-001",
    status: "contract_paid",
  },
  {
    id: "b2",
    cottageId: "cc-3",
    clientName: "Петрова М.И.",
    phone: "+7 (912) 555-33-11",
    checkInHour: 14,
    checkOutHour: 22,
    guestCount: 8,
    contractNumber: "Д-002",
    status: "contract_signed",
  },
  {
    id: "b3",
    cottageId: "cc-8",
    clientName: "Сидоров К.В.",
    phone: "+7 (905) 777-88-99",
    checkInHour: 18,
    checkOutHour: 2,
    guestCount: 25,
    contractNumber: "Д-003",
    status: "contract_signed",
  },
  {
    id: "b4",
    cottageId: "cc-4",
    clientName: "Козлова Е.Н.",
    phone: "+7 (903) 222-11-44",
    checkInHour: 12,
    checkOutHour: 18,
    guestCount: 20,
    status: "pre_booking",
  },
];

export const MOCK_BOOKINGS_GB_COTTAGES: Booking[] = [
  {
    id: "gb-b1",
    cottageId: "gb-1",
    clientName: "Морозов Д.А.",
    phone: "+7 (916) 111-22-33",
    checkInHour: 0,
    checkOutHour: 24,
    checkInDate: "2025-04-01",
    checkOutDate: "2025-04-05",
    guestCount: 6,
    isDaily: true,
    contractNumber: "ГБ-001",
    status: "contract_paid",
  },
  {
    id: "gb-b2",
    cottageId: "gb-3-2",
    clientName: "Волкова С.М.",
    phone: "+7 (926) 444-55-66",
    checkInHour: 0,
    checkOutHour: 24,
    checkInDate: "2025-03-30",
    checkOutDate: "2025-04-02",
    guestCount: 4,
    isDaily: true,
    contractNumber: "ГБ-002",
    status: "contract_signed",
  },
];

export const MOCK_BOOKINGS_GB_BANYA: Booking[] = [
  {
    id: "gb-banya-1",
    cottageId: "gb-banya",
    clientName: "Лебедев И.К.",
    phone: "+7 (915) 999-00-11",
    checkInHour: 14,
    checkOutHour: 18,
    guestCount: 4,
    status: "contract_signed",
  },
  {
    id: "gb-furako-1",
    cottageId: "gb-furako",
    clientName: "Новикова А.В.",
    phone: "+7 (903) 888-77-66",
    checkInHour: 16,
    checkOutHour: 19,
    guestCount: 2,
    status: "pre_booking",
  },
];

export function getBookingColor(_index: number, status: BookingStatus = "contract_signed"): string {
  const palette = BOOKING_COLORS[status];
  return palette[0];
}

export function formatHour(h: number): string {
  return `${h}:00`;
}

/** Parse a column name into label + number parts */
export function parseColumnName(name: string): { label: string; number: string } {
  // Match patterns like "Дом №1", "Коттедж №3/1", "Баня"
  const match = name.match(/^(Дом|Коттедж)\s*(№.+)$/);
  if (match) {
    return { label: match[1], number: match[2] };
  }
  // No split possible (e.g. "Баня", "Фурако")
  return { label: "", number: name };
}

/** Get hour index within a given hours array, handling wrap-around */
export function getHourIndex(hour: number, hours: number[]): number {
  return hours.indexOf(hour);
}

/** Calculate span in the hours array from start to end, handling wrap-around */
export function getHourSpan(startHour: number, endHour: number, hours: number[]): { startIdx: number; span: number } {
  const startIdx = hours.indexOf(startHour);
  if (startIdx === -1) return { startIdx: 0, span: 0 };
  
  const endIdx = hours.indexOf(endHour);
  if (endIdx === -1) return { startIdx, span: 1 };
  
  let span = endIdx - startIdx;
  if (span <= 0) span += hours.length;
  
  return { startIdx, span };
}
