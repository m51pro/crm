import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatHour } from "@/lib/chess-data";
import { toast } from "sonner";

interface QuickBookingFormProps {
  open: boolean;
  cottageId?: string;
  hour?: number;
  isDaily?: boolean;
  onClose: () => void;
}

export function QuickBookingForm({ open, cottageId, hour, isDaily, onClose }: QuickBookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState(hour != null ? formatHour(hour) : "");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSave = () => {
    toast.success("Бронирование сохранено (демо)");
    resetAndClose();
  };

  const handleContract = () => {
    toast.success("Переход к оформлению договора (демо)");
    resetAndClose();
  };

  const resetAndClose = () => {
    setName("");
    setPhone("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isDaily ? "Суточное бронирование" : "Быстрое бронирование"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Имя</Label>
            <Input
              placeholder="Фамилия И.О."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Телефон</Label>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!isDaily && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Заезд</Label>
                <Input
                  placeholder="10:00"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Выезд</Label>
                <Input
                  placeholder="16:00"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
          )}

          {isDaily && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Дата заезда</Label>
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Дата выезда</Label>
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Кол-во человек</Label>
            <Input
              type="number"
              placeholder="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
              Сохранить
            </Button>
            <Button variant="outline" onClick={handleContract} className="flex-1">
              Оформить договор
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
