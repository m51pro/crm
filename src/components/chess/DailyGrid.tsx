import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type Booking, getBookingColor } from "@/lib/chess-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingDrawer } from "./BookingDrawer";
import { QuickBookingForm } from "./QuickBookingForm";

interface Column {
  id: string;
  name: string;
}

interface DailyGridProps {
  columns: Column[];
  bookings: Booking[];
  date: Date;
}

const CELL_H = 120;

export function DailyGrid({ columns, bookings, date }: DailyGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickBook, setQuickBook] = useState<string | null>(null);

  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking & { colorClass: string }>();
    bookings.forEach((b, i) => {
      map.set(b.cottageId, { ...b, colorClass: getBookingColor(i) });
    });
    return map;
  }, [bookings]);

  return (
    <>
      <div className="border rounded-lg bg-card overflow-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(130px, 1fr))`,
          }}
        >
          {/* Headers */}
          {columns.map((col) => (
            <div
              key={col.id}
              className="sticky top-0 z-10 bg-card border-b border-r px-3 py-2 text-center"
            >
              <p className="font-heading text-xs font-semibold">{col.name}</p>
            </div>
          ))}

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
                          "rounded border px-2 py-2 h-full cursor-pointer",
                          booking.colorClass
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        <p className="text-xs font-semibold truncate">{booking.clientName}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">{booking.phone}</p>
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

      <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      <QuickBookingForm
        open={!!quickBook}
        cottageId={quickBook ?? undefined}
        hour={undefined}
        isDaily
        onClose={() => setQuickBook(null)}
      />
    </>
  );
}
