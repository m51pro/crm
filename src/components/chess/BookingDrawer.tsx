import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { type Booking, formatHour } from "@/lib/chess-data";

interface BookingDrawerProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDrawer({ booking, onClose }: BookingDrawerProps) {
  if (!booking) return null;

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">Бронирование</SheetTitle>
          <SheetDescription>Детали бронирования</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <InfoRow label="Клиент" value={booking.clientName} />
          <InfoRow label="Телефон" value={booking.phone} />
          {booking.contractNumber && (
            <InfoRow label="Договор" value={booking.contractNumber} />
          )}
          <InfoRow
            label="Время"
            value={
              booking.isDaily
                ? `${booking.checkInDate} — ${booking.checkOutDate}`
                : `${formatHour(booking.checkInHour)} — ${formatHour(booking.checkOutHour)}`
            }
          />
          <InfoRow label="Гостей" value={`${booking.guestCount} чел.`} />

          <div className="pt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Редактировать
            </Button>
            <Button variant="destructive" size="sm" className="flex-1">
              Отменить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
