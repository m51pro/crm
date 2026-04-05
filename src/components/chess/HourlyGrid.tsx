import { useMemo, useState } from "react";
import { isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  type Booking,
  type BookingStatus,
  formatHour,
  getHourSpan,
  getBookingColor,
  parseColumnName,
} from "@/lib/chess-data";
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
  capacity?: number | null;
}

interface HourlyGridProps {
  columns: Column[];
  hours: number[];
  bookings: Booking[];
  date: Date;
  accentClass?: string;
  onRefresh?: () => void;
}

const ROW_H = 48;
const TIME_W = 64;

function StatusIndicator({ status }: { status: BookingStatus }) {
  if (status === "contract_paid") {
    return <Check className="inline h-3 w-3 text-emerald-600 ml-1" />;
  }
  return null;
}

export function HourlyGrid({ columns, hours, bookings, date, accentClass = "bg-forest", onRefresh }: HourlyGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickBook, setQuickBook] = useState<{ cottageId: string; hour: number } | null>(null);

  const currentHourIdx = useMemo(() => {
    if (!isToday(date)) return -1;
    const now = new Date().getHours();
    return hours.indexOf(now);
  }, [date, hours]);

  const bookingMap = useMemo(() => {
    const map = new Map<string, (Booking & { colorClass: string; startIdx: number; span: number })[]>();
    bookings.forEach((b, i) => {
      // Filter by date
      const dateStr = b.checkin_at || b.checkInDate;
      if (dateStr && !isSameDay(new Date(dateStr), date)) return;
      
      const cInH = b.check_in_hour !== undefined ? b.check_in_hour : b.checkInHour;
      const cOutH = b.check_out_hour !== undefined ? b.check_out_hour : b.checkOutHour;

      const { startIdx, span } = getHourSpan(cInH, cOutH, hours);
      if (span === 0) return;
      const cottageId = b.cottageId;
      const entry = { ...b, cottageId, colorClass: getBookingColor(i, b.status), startIdx, span };
      const arr = map.get(cottageId) || [];
      arr.push(entry);
      map.set(b.cottageId, arr);
    });
    return map;
  }, [bookings, hours, date]);

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
      <div className="relative w-full overflow-x-auto">
        <div
          className="grid min-w-0"
          style={{
            gridTemplateColumns: `${TIME_W}px repeat(${columns.length}, minmax(80px, 1fr))`,
            gridTemplateRows: `auto repeat(${hours.length}, ${ROW_H}px)`,
          }}
        >
          {/* Top-left corner */}
          <div className="sticky left-0 top-0 z-20 bg-card border-b border-r flex items-center justify-center">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Время</span>
          </div>

          {/* Column headers */}
          {columns.map((col) => {
            const { label, number } = parseColumnName(col.name);
            return (
              <div
                key={col.id}
                className="sticky top-0 z-10 bg-card border-b border-r px-2 py-2 text-center flex flex-col items-center justify-center"
              >
                {label && (
                  <p className="text-[11px] font-normal text-muted-foreground uppercase tracking-wide leading-tight">
                    {label}
                  </p>
                )}
                <p className="text-lg font-bold font-heading leading-tight">{number}</p>
                {col.capacity && (
                  <p className="text-[11px] text-muted-foreground leading-tight">{col.capacity} чел</p>
                )}
              </div>
            );
          })}

          {/* Rows */}
          {hours.map((hour, rowIdx) => (
            <div key={`row-${hour}`} className="contents">
              {/* Time cell */}
              <div
                className={cn(
                  "sticky left-0 z-10 bg-card border-b border-r flex items-center justify-center",
                  rowIdx % 2 === 1 && "bg-muted/30"
                )}
                style={{ gridRow: rowIdx + 2 }}
              >
                <span className="text-[13px] font-semibold text-muted-foreground">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Data cells */}
              {columns.map((col, colIdx) => {
                const cellKey = `${col.id}-${rowIdx}`;
                const isOccupied = occupiedCells.has(cellKey);
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
                              "absolute left-0.5 right-0.5 rounded px-1.5 py-1 overflow-hidden cursor-pointer z-[5]",
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
                            <p className="text-[12px] font-bold truncate leading-tight">
                              {startingBooking.clientName}
                              <StatusIndicator status={startingBooking.status} />
                            </p>
                            <p className="text-[11px] truncate opacity-90 font-black tracking-tight">
                              {startingBooking.phone}
                            </p>
                            {startingBooking.status === "pre_booking" && (
                              <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                                Предбронь
                              </p>
                            )}
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
            </div>
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
        onRefresh={onRefresh}
      />

      <PreBookingForm
        open={!!quickBook}
        cottageId={quickBook?.cottageId}
        hour={quickBook?.hour}
        onClose={() => setQuickBook(null)}
        onRefresh={onRefresh}
        date={date}
      />
    </>
  );
}
