import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Booking, formatHour } from "@/lib/chess-data";
import { toast } from "sonner";
import { User, Phone, FileText, Users, Calendar, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { DateInput } from "@/components/ui/DateInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES, GB_BANYA_ITEMS } from "@/lib/chess-data";
import { Home } from "lucide-react";

interface BookingDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function BookingDrawer({ booking, onClose, onRefresh }: BookingDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Booking>>({});

  useEffect(() => {
    if (booking) {
      setEditData({
        ...booking,
        cottageId: booking.cottageId,
        clientName: booking.clientName,
        phone: booking.phone,
        guestCount: booking.guestCount ?? booking.guest_count,
        checkInDate: booking.checkInDate || booking.checkin_at,
        checkOutDate: booking.checkOutDate || booking.checkout_at,
        checkInHour: booking.checkInHour ?? booking.check_in_hour,
        checkOutHour: booking.checkOutHour ?? booking.check_out_hour,
      });
      setIsEditing(false);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSave = async () => {
    try {
      const payload = {
        ...editData,
        cottage_id: editData.cottageId,
        cottageId: undefined,
        client_name: editData.clientName,
        clientName: undefined,
        client_phone: editData.phone,
        phone: undefined,
        guest_count: editData.guestCount ?? editData.guest_count,
        guestCount: undefined,
        checkin_at: editData.checkin_at ?? editData.checkInDate,
        checkout_at: editData.checkout_at ?? editData.checkOutDate,
        checkInDate: undefined,
        checkOutDate: undefined,
        check_in_hour: editData.check_in_hour ?? editData.checkInHour,
        check_out_hour: editData.check_out_hour ?? editData.checkOutHour,
        checkInHour: undefined,
        checkOutHour: undefined,
      };
      const res = await apiFetch(`/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Изменения сохранены");
      setIsEditing(false);
      onRefresh?.();
      onClose();
    } catch (e) {
      toast.error("Ошибка при сохранении");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить это бронирование?")) return;
    try {
      const res = await apiFetch(`/bookings/${booking.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success("Бронирование удалено");
      onRefresh?.();
      onClose();
    } catch (e) {
      toast.error("Ошибка при удалении");
    }
  };

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-[28px] p-0 border border-border/60 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="px-7 pt-7 pb-5 bg-background/90 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-heading text-2xl font-bold leading-tight">
                {isEditing ? "Редактирование брони" : "Детали брони"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Проверьте данные, затем сохраните изменения</p>
            </div>
            {!isEditing && (
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 border",
                booking.status === 'contract_paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                booking.status === 'contract_signed' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
              )}>
                {booking.status === 'contract_paid' ? "Оплачено" :
                 booking.status === 'contract_signed' ? "Подтверждено" : "Предбронь"}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="p-7 space-y-7">
          {/* Main Grid: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Left Column: Client & Object */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Home className="h-3 w-3" /> Объект/Дом
                </Label>
                {isEditing ? (
                  <Select
                    value={editData.cottageId || ""}
                    onValueChange={(val) => setEditData({...editData, cottageId: val})}
                  >
                    <SelectTrigger className="rounded-xl font-bold h-12 bg-background border-border">
                      <SelectValue placeholder="Выберите дом" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...CHUNGA_CHANGA_COTTAGES, ...GB_COTTAGES, ...GB_BANYA_ITEMS].map(c => (
                        <SelectItem key={c.id} value={c.id} className="font-medium">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-bold text-lg leading-tight">
                    {[...CHUNGA_CHANGA_COTTAGES, ...GB_COTTAGES, ...GB_BANYA_ITEMS].find(c => c.id === booking.cottageId)?.name || booking.cottageId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-3 w-3" /> ФИО Клиента
                </Label>
                {isEditing ? (
                  <Input 
                   value={editData.clientName || ""}
                    onChange={e => setEditData({...editData, clientName: e.target.value})}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="rounded-xl font-bold h-12"
                  />
                ) : (
                  <p className="font-bold text-lg leading-tight">{booking.clientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Телефон
                </Label>
                {isEditing ? (
                  <Input 
                   value={editData.phone || ""}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="rounded-xl font-mono font-bold h-12"
                  />
                ) : (
                  <p className="font-mono font-bold text-base leading-tight">{booking.phone}</p>
                )}
              </div>
            </div>

            {/* Right Column: Time/Date */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Время / Период
                </Label>
                {isEditing ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                    {booking.isDaily ? (
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase font-black">Даты проживания</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <DateInput 
                            value={editData.checkin_at || editData.checkInDate || ""}
                            onChange={v => setEditData({...editData, checkin_at: v, checkInDate: v})}
                            className="h-10"
                          />
                          <DateInput 
                            value={editData.checkout_at || editData.checkOutDate || ""}
                            onChange={v => setEditData({...editData, checkout_at: v, checkOutDate: v})}
                            className="h-10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase font-black">Дата</Label>
                          <DateInput 
                            value={editData.checkin_at || editData.checkInDate || ""} 
                            onChange={v => setEditData({...editData, checkin_at: v, checkout_at: v})}
                            className="h-10"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-black">С:</Label>
                            <Input 
                              type="number"
                              value={editData.check_in_hour !== undefined ? editData.check_in_hour : editData.checkInHour} 
                              onChange={e => setEditData({...editData, check_in_hour: parseInt(e.target.value)})}
                              className="h-10 rounded-xl font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-black">До:</Label>
                            <Input 
                              type="number"
                              value={editData.check_out_hour !== undefined ? editData.check_out_hour : editData.checkOutHour} 
                              onChange={e => setEditData({...editData, check_out_hour: parseInt(e.target.value)})}
                              className="h-10 rounded-xl font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-bold text-lg leading-tight">
                    {booking.isDaily
                      ? `${booking.checkin_at || booking.checkInDate} — ${booking.checkout_at || booking.checkOutDate}`
                      : `${formatHour(booking.check_in_hour !== undefined ? booking.check_in_hour : booking.checkInHour)} — ${formatHour(booking.check_out_hour !== undefined ? booking.check_out_hour : booking.checkOutHour)}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Bottom Section: Guests & Contract */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3 w-3" /> Количество гостей
              </Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={editData.guestCount ?? (editData.guest_count || 1)} 
                  onChange={e => setEditData({...editData, guestCount: parseInt(e.target.value)})}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="rounded-xl font-bold h-12"
                />
              ) : (
                <p className="font-bold text-lg leading-none py-1">{(booking.guest_count !== undefined ? booking.guest_count : booking.guestCount)} человек</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3 w-3" /> Номер договора
              </Label>
              {isEditing ? (
                <Input 
                  value={editData.contractNumber || ""} 
                  onChange={e => setEditData({...editData, contractNumber: e.target.value})}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Без договора"
                  className="rounded-xl font-bold h-12"
                />
              ) : (
                <p className="font-bold text-lg leading-none py-1">{booking.contractNumber || "—"}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t flex flex-col gap-3">
            {isEditing ? (
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-12 font-bold shadow-lg shadow-accent/20">
                  <Save className="h-4 w-4 mr-2" /> Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-2xl h-12 px-6 border-border hover:bg-muted font-bold">
                  Отмена
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Button onClick={() => setIsEditing(true)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-2xl h-12 font-bold transition-all border border-border/50">
                    <PencilIcon className="h-4 w-4 mr-2" /> Редактировать
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold border-border hover:bg-muted">
                    Открыть договор
                  </Button>
                </div>
                <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12 font-bold">
                  <Trash2 className="h-4 w-4 mr-2" /> Удалить бронирование
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
}
