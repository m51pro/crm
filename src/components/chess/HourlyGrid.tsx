import { useMemo, useState } from "react";
import { isToday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  type Booking,
  formatHour,
  getHourSpan,
  getBookingColor,
} from "@/lib/chess-data";
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
  capacity?: number | null;
}

interface HourlyGridProps {
  columns: Column[];
  hours: number[];
  bookings: Booking[];
  date: Date;
  accentClass?: string;
}

const ROW_H = 48;
const COL_W = 130;
const TIME_W = 70;

export function HourlyGrid({ columns, hours, bookings, date, accentClass = "bg-forest" }: HourlyGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickBook, setQuickBook] = useState<{ cottageId: string; hour: number } | null>(null);

  const currentHourIdx = useMemo(() => {
    if (!isToday(date)) return -1;
    const now = new Date().getHours();
    return hours.indexOf(now);
  }, [date, hours]);

  // Map bookings by cottageId
  const bookingMap = useMemo(() => {
    const map = new Map<string, (Booking & { colorClass: string; startIdx: number; span: number })[]>();
    bookings.forEach((b, i) => {
      const { startIdx, span } = getHourSpan(b.checkInHour, b.checkOutHour, hours);
      if (span === 0) return;
      const entry = { ...b, colorClass: getBookingColor(i), startIdx, span };
      const arr = map.get(b.cottageId) || [];
      arr.push(entry);
      map.set(b.cottageId, arr);
    });
    return map;
  }, [bookings, hours]);

  // Build occupied set for quick lookup
  const occupiedCells = useMemo(() => {
    const set = new Set<string>();
    bookingMap.forEach((bks, cottageId) => {
      bks.forEach((b) => {
        for (let i = 0; i < b.span; i++) {
          set.add(`${cottageId}-${(b.startIdx + i) % hours.length}`);
        }
      });
    });
    return set;
  }, [bookingMap, hours]);

  return (
    <>
      <div className="relative overflow-auto border rounded-lg bg-card">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${TIME_W}px repeat(${columns.length}, ${COL_W}px)`,
            gridTemplateRows: `auto repeat(${hours.length}, ${ROW_H}px)`,
          }}
        >
          {/* Top-left corner */}
          <div className="sticky left-0 top-0 z-20 bg-card border-b border-r flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">Время</span>
          </div>

          {/* Column headers */}
          {columns.map((col) => (
            <div
              key={col.id}
              className="sticky top-0 z-10 bg-card border-b border-r px-2 py-2 text-center"
            >
              <p className="font-heading text-xs font-semibold truncate">{col.name}</p>
              {col.capacity && (
                <p className="text-[10px] text-muted-foreground">{col.capacity} чел</p>
              )}
            </div>
          ))}

          {/* Rows */}
          {hours.map((hour, rowIdx) => (
            <>
              {/* Time cell */}
              <div
                key={`time-${hour}`}
                className={cn(
                  "sticky left-0 z-10 bg-card border-b border-r flex items-center justify-center",
                  rowIdx % 2 === 1 && "bg-muted/30"
                )}
                style={{ gridRow: rowIdx + 2 }}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Data cells */}
              {columns.map((col, colIdx) => {
                const cellKey = `${col.id}-${rowIdx}`;
                const isOccupied = occupiedCells.has(cellKey);

                // Check if a booking starts here
                const bks = bookingMap.get(col.id) || [];
                const startingBooking = bks.find((b) => b.startIdx === rowIdx);

                return (
                  <div
                    key={`${col.id}-${hour}`}
                    className={cn(
                      "border-b border-r relative",
                      rowIdx % 2 === 1 && "bg-muted/30",
                      !isOccupied && "hover:bg-accent/20 cursor-pointer transition-colors"
                    )}
                    style={{
                      gridRow: rowIdx + 2,
                      gridColumn: colIdx + 2,
                    }}
                    onClick={() => {
                      if (!isOccupied) {
                        setQuickBook({ cottageId: col.id, hour });
                      }
                    }}
                  >
                    {startingBooking && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute left-0.5 right-0.5 rounded border px-1.5 py-1 overflow-hidden cursor-pointer z-[5]",
                              startingBooking.colorClass
                            )}
                            style={{
                              top: 1,
                              height: startingBooking.span * ROW_H - 3,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(startingBooking);
                            }}
                          >
                            <p className="text-[11px] font-semibold truncate leading-tight">
                              {startingBooking.clientName}
                            </p>
                            <p className="text-[10px] truncate opacity-80">
                              {startingBooking.phone}
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs space-y-1">
                          <p className="font-semibold">{startingBooking.clientName}</p>
                          <p>{startingBooking.phone}</p>
                          {startingBooking.contractNumber && (
                            <p>Договор: {startingBooking.contractNumber}</p>
                          )}
                          <p>
                            {formatHour(startingBooking.checkInHour)} — {formatHour(startingBooking.checkOutHour)}
                          </p>
                          <p>{startingBooking.guestCount} чел.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </>
          ))}

          {/* Current time indicator */}
          {currentHourIdx >= 0 && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-destructive z-20 pointer-events-none"
              style={{
                top: 40 + currentHourIdx * ROW_H + (new Date().getMinutes() / 60) * ROW_H,
              }}
            />
          )}
        </div>
      </div>

      <BookingDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      <QuickBookingForm
        open={!!quickBook}
        cottageId={quickBook?.cottageId}
        hour={quickBook?.hour}
        onClose={() => setQuickBook(null)}
      />
    </>
  );
}
