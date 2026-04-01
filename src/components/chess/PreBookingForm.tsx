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

interface PreBookingFormProps {
  open: boolean;
  cottageId?: string;
  hour?: number;
  isDaily?: boolean;
  onClose: () => void;
}

export function PreBookingForm({ open, cottageId, hour, isDaily, onClose }: PreBookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState(hour != null ? formatHour(hour) : "");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Введите имя");
      return;
    }
    if (phone.replace(/\D/g, "").length < 11) {
      toast.error("Введите корректный телефон");
      return;
    }
    toast.success("Предбронь сохранена (демо)");
    resetAndClose();
  };

  const handleContract = () => {
    if (!name.trim()) {
      toast.error("Введите имя");
      return;
    }
    toast.success("Переход к оформлению договора (демо)");
    resetAndClose();
  };

  const resetAndClose = () => {
    setName("");
    setPhone("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Предбронь</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Required fields */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Имя <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Фамилия И.О."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Телефон <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("+7")) val = "+7" + val.replace(/^\+?7?/, "");
                setPhone(val);
              }}
            />
          </div>

          {/* Optional fields */}
          <div className="pt-1 border-t">
            <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wide">
              Необязательно
            </p>

            {!isDaily && (
              <div className="grid grid-cols-2 gap-3 mb-3">
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
              <div className="grid grid-cols-2 gap-3 mb-3">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Кол-во человек</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
              Сохранить предбронь
            </Button>
            <Button variant="outline" onClick={handleContract} className="flex-1">
              Оформить договор
            </Button>
          </div>
          <Button variant="ghost" onClick={resetAndClose} className="w-full text-xs text-muted-foreground">
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
