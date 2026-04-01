import { useMemo, useState } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { type Booking, type BookingStatus, getBookingColor, parseColumnName } from "@/lib/chess-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingDrawer } from "./BookingDrawer";
import { PreBookingForm } from "./PreBookingForm";

interface Column {
  id: string;
  name: string;
}

interface DailyGridProps {
  columns: Column[];
  bookings: Booking[];
  date: Date;
  onRefresh?: () => void;
}

type RawBooking = Booking & {
  cottage_id?: string;
  client_name?: string;
  client_phone?: string;
  guest_count?: number;
  checkin_at?: string;
  checkout_at?: string;
};

const CELL_H = 120;

function StatusIndicator({ status }: { status: BookingStatus }) {
  if (status === "contract_paid") {
    return <Check className="inline h-3 w-3 text-emerald-600 ml-1" />;
  }
  return null;
}

export function DailyGrid({ columns, bookings, date, onRefresh }: DailyGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickBook, setQuickBook] = useState<string | null>(null);

  const bookingMap = useMemo(() => {
    const map = new Map<string, (RawBooking & { colorClass: string, isStartDay: boolean, isEndDay: boolean })[]>();
    bookings.forEach((b, i) => {
      const rawB = b as RawBooking;
      // Filter by date range for daily grid (fallback checkin_at -> checkInDate)
      const startStr = rawB.checkin_at || b.checkInDate;
      const endStr = rawB.checkout_at || b.checkOutDate;
      const cottageId = rawB.cottage_id || b.cottageId;

      let isStartDay = false;
      let isEndDay = false;

      if (startStr && endStr) {
        const start = startOfDay(new Date(startStr));
        const end = startOfDay(new Date(endStr));
        const current = startOfDay(date);
        if (!isWithinInterval(current, { start, end })) return;

        isStartDay = current.getTime() === start.getTime();
        isEndDay = current.getTime() === end.getTime();
      }
      
      const arr = map.get(cottageId) || [];
      arr.push({ ...b, colorClass: getBookingColor(i, b.status), isStartDay, isEndDay });
      map.set(cottageId, arr);
    });
    return map;
  }, [bookings, date]);

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <div
          className="grid min-w-0"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(130px, 1fr))`,
          }}
        >
          {/* Headers */}
          {columns.map((col) => {
            const { label, number } = parseColumnName(col.name);
            return (
              <div
                key={col.id}
                className="sticky top-0 z-10 bg-card border-b border-r px-3 py-2 text-center flex flex-col items-center justify-center"
              >
                {label && (
                  <p className="text-[11px] font-normal text-muted-foreground uppercase tracking-wide leading-tight">
                    {label}
                  </p>
                )}
                <p className="text-lg font-bold font-heading leading-tight">{number}</p>
              </div>
            );
          })}

          {/* Cells */}
          {columns.map((col) => {
            const cellBookings = bookingMap.get(col.id) || [];
            return (
              <div
                key={`cell-${col.id}`}
                className={cn(
                  "border-r relative p-1",
                  cellBookings.length === 0 && "hover:bg-accent/20 cursor-pointer transition-colors"
                )}
                style={{ minHeight: CELL_H }}
                onClick={() => {
                  if (cellBookings.length === 0) setQuickBook(col.id);
                }}
              >
                {cellBookings.length > 0 ? (
                  cellBookings.map((booking, bIdx) => {
                    const rawBooking = booking as RawBooking;
                    let heightClass = "inset-1"; // full day
                    if (booking.isStartDay && !booking.isEndDay) heightClass = "top-[28%] bottom-1 inset-x-1"; // ~72% height
                    if (booking.isEndDay && !booking.isStartDay) heightClass = "top-1 bottom-[75%] inset-x-1"; // 24% height

                    return (
                      <Tooltip key={bIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute rounded px-2 py-1.5 flex flex-col cursor-pointer shadow-sm overflow-hidden",
                              booking.colorClass,
                              heightClass,
                              booking.isEndDay && !booking.isStartDay && "py-0.5 opacity-90"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                          >
                            <p className="text-sm font-bold truncate leading-tight">
                              {booking.clientName || rawBooking.client_name}
                              <StatusIndicator status={booking.status} />
                            </p>
                            {!booking.isEndDay && (
                              <p className="text-[11px] opacity-90 mt-0.5 font-extrabold tracking-tight truncate">
                                {booking.phone || rawBooking.client_phone}
                              </p>
                            )}
                            {booking.status === "pre_booking" && !booking.isEndDay && (
                              <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide truncate">
                                Предбронь
                              </p>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs space-y-1 z-50">
                          <p className="font-semibold">{booking.clientName || rawBooking.client_name}</p>
                          <p>{booking.phone || rawBooking.client_phone}</p>
                          <p>{rawBooking.guest_count || booking.guestCount} чел.</p>
                          {rawBooking.checkin_at && <p>Заезд: {format(new Date(rawBooking.checkin_at), "d MMM HH:mm", { locale: ru })}</p>}
                          {rawBooking.checkout_at && <p>Выезд: {format(new Date(rawBooking.checkout_at), "d MMM HH:mm", { locale: ru })}</p>}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-muted-foreground">Свободен</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} onRefresh={onRefresh} />
      <PreBookingForm
        open={!!quickBook}
        cottageId={quickBook ?? undefined}
        hour={undefined}
        isDaily
        onClose={() => setQuickBook(null)}
        onRefresh={onRefresh}
        date={date}
      />
    </>
  );
}
