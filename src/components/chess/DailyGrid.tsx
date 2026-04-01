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
    const map = new Map<string, Booking & { colorClass: string }>();
    bookings.forEach((b, i) => {
      // Filter by date range for daily grid (fallback checkin_at -> checkInDate)
      const startStr = b.checkin_at || b.checkInDate;
      const endStr = b.checkout_at || b.checkOutDate;

      if (startStr && endStr) {
        const start = startOfDay(new Date(startStr));
        const end = endOfDay(new Date(endStr));
        const current = startOfDay(date);
        if (!isWithinInterval(current, { start, end })) return;
      }
      map.set(b.cottageId, { ...b, colorClass: getBookingColor(i, b.status) });
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
            const booking = bookingMap.get(col.id);
            return (
              <div
                key={`cell-${col.id}`}
                className={cn(
                  "border-r relative p-1",
                  !booking && "hover:bg-accent/20 cursor-pointer transition-colors"
                )}
                style={{ minHeight: CELL_H }}
                onClick={() => {
                  if (!booking) setQuickBook(col.id);
                }}
              >
                {booking ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "rounded px-2 py-2 h-full cursor-pointer shadow-sm",
                          booking.colorClass
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        <p className="text-sm font-bold truncate">
                          {booking.clientName}
                          <StatusIndicator status={booking.status} />
                        </p>
                        <p className="text-[11px] opacity-90 mt-1 font-extrabold tracking-tight">
                          {booking.phone}
                        </p>
                        {booking.status === "pre_booking" && (
                          <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                            Предбронь
                          </p>
                        )}
                        {booking.checkOutDate && (
                          <p className="text-[10px] mt-2 opacity-70">
                            → до{" "}
                            {format(new Date(booking.checkOutDate), "d MMM", {
                              locale: ru,
                            })}
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs space-y-1">
                      <p className="font-semibold">{booking.clientName}</p>
                      <p>{booking.phone}</p>
                      {booking.contractNumber && <p>Договор: {booking.contractNumber}</p>}
                      <p>{booking.guestCount} чел.</p>
                    </TooltipContent>
                  </Tooltip>
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
