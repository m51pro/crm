import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatHour } from "@/lib/chess-data";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { DateInput } from "@/components/ui/DateInput";
import { apiFetch } from "@/lib/api";

interface PreBookingFormProps {
  open: boolean;
  cottageId?: string;
  hour?: number;
  isDaily?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  date?: Date;
}

export function PreBookingForm({ open, cottageId, hour, isDaily, onClose, onRefresh, date }: PreBookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone("+7 ");
      if (isDaily && date) {
        const dateStr = format(date, "yyyy-MM-dd");
        setCheckIn(dateStr);
        setCheckOut(dateStr);
      } else if (hour != null) {
        setCheckIn(formatHour(hour));
        setCheckOut(formatHour((hour + 3) % 24));
      }
    }
  }, [open, hour, isDaily, date]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Введите имя");
      return;
    }
    if (phone.replace(/\D/g, "").length < 11) {
      toast.error("Введите корректный телефон");
      return;
    }

    try {
      const property = isDaily ? "golubaya_bukhta" : (cottageId?.startsWith("cc") ? "chunga_changa" : "gb_banya");
      
      const defaultDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

      const res = await apiFetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cottage_id: cottageId,
          property,
          client_name: name,
          client_phone: phone,
          checkin_at: isDaily ? checkIn : defaultDate,
          checkout_at: isDaily ? checkOut : defaultDate,
          check_in_hour: !isDaily && checkIn ? parseInt(checkIn) : 0,
          check_out_hour: !isDaily && checkOut ? parseInt(checkOut) : 0,
          guest_count: parseInt(guests) || 1,
          status: "pre_booking",
        }),
      });

      if (!res.ok) throw new Error();
      
      toast.success("Предбронь сохранена");
      onRefresh?.();
      resetAndClose();
    } catch (e) {
      toast.error("Ошибка при сохранении");
    }
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
    setPhone("+7 ");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setEmail("");
    setComment("");
    setShowComment(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-none bg-card shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-heading text-xl">Создание предброни</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Required fields */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Имя <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Фамилия И.О."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="font-bold text-base h-11 rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Телефон <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => {
                const input = e.target.value;
                const isDelete = (e.nativeEvent as any).inputType === "deleteContentBackward";
                let val = input.replace(/\D/g, "");
                
                if (val.startsWith("7") || val.startsWith("8")) val = val.slice(1);
                
                // If user deleted a formatting character, remove one more digit
                if (isDelete && (input.endsWith("-") || input.endsWith(" ") || input.endsWith(")"))) {
                  val = val.slice(0, -1);
                }
                
                val = val.slice(0, 10);
                
                let formatted = "+7 ";
                if (val.length > 0) formatted += "(" + val.slice(0, 3);
                if (val.length >= 3) formatted += ") ";
                if (val.length > 3) formatted += val.slice(3, 6);
                if (val.length >= 6) formatted += "-";
                if (val.length > 6) formatted += val.slice(6, 8);
                if (val.length >= 8) formatted += "-";
                if (val.length > 8) formatted += val.slice(8, 10);
                
                setPhone(formatted);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="font-mono font-bold text-base h-11 rounded-xl"
            />
          </div>

          {/* Optional fields */}
          <div className="pt-2">
            {!isDaily && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Заезд</Label>
                  <Input
                    placeholder="10:00"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="rounded-xl h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Выезд</Label>
                  <Input
                    placeholder="16:00"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="rounded-xl h-10 border-accent/30 focus-visible:ring-accent"
                  />
                </div>
              </div>
            )}

            {isDaily && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Дата заезда</Label>
                  <DateInput value={checkIn} onChange={(v) => setCheckIn(v)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Дата выезда</Label>
                  <DateInput value={checkOut} onChange={(v) => setCheckOut(v)} className="h-10" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Кол-во человек</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            {/* Comment Section */}
            <div className="mt-4 pt-4 border-t">
              {!showComment ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowComment(true)}
                  className="w-full justify-start text-[11px] text-muted-foreground uppercase tracking-wide gap-2 h-8 px-0 hover:bg-muted/30 rounded-lg group"
                >
                  <Plus className="h-3 w-3 text-accent group-hover:scale-110 transition-transform" /> Добавить комментарий
                </Button>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                       <MessageSquare className="h-3 w-3 text-accent" /> Комментарий
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowComment(false)}
                      className="h-6 px-2 text-[10px] rounded-md"
                    >
                      Скрыть
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Напишите здесь детали бронирования..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none text-sm min-h-[80px] bg-muted/20 rounded-xl focus:bg-background transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-11 font-bold shadow-md shadow-accent/20">
              Сохранить
            </Button>
            <Button variant="outline" onClick={handleContract} className="flex-1 rounded-2xl h-11 font-bold border-border hover:bg-muted">
              Договор
            </Button>
          </div>
          <Button variant="ghost" onClick={resetAndClose} className="w-full text-xs text-muted-foreground font-medium rounded-xl h-10">
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
