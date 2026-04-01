import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/DateInput";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES } from "@/lib/chess-data";
import { Contract } from "@/types/crm";

interface BookingSectionProps {
  form: Contract;
  setF: (k: string, v: string | number | boolean) => void;
  daysCalc: number;
}

export function BookingSection({ form, setF, daysCalc }: BookingSectionProps) {
  const cottages = useMemo(() => {
    return form.property === "chunga_changa" ? CHUNGA_CHANGA_COTTAGES : GB_COTTAGES;
  }, [form.property]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Бронирование" />
      
      <div className={cn(
        "space-y-4 p-5 rounded-xl border transition-all", 
        form.cottage_included ? "bg-muted/20 border-border/50 shadow-sm" : "bg-muted/5 border-dashed opacity-50 shadow-none"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox 
              id="cottage_inc" 
              checked={form.cottage_included} 
              onCheckedChange={(c) => setF("cottage_included", !!c)} 
              disabled={form.property === "chunga_changa"}
              className="h-5 w-5" 
            />
            <Label htmlFor="cottage_inc" className="font-black text-sm cursor-pointer uppercase tracking-tight">Коттедж (основной блок)</Label>
          </div>
          {form.property === "chunga_changa" && (form.cottage_id === "cc-6" || form.cottage_id === "cc-9") && (
            <div className="flex items-center space-x-2 text-xs font-bold text-accent px-3 py-1 bg-accent/5 rounded-lg border border-accent/10">
              <Checkbox id="full_day" checked={form.is_full_day} onCheckedChange={(c) => setF("is_full_day", !!c)} className="h-4 w-4 data-[state=checked]:bg-accent" />
              <label htmlFor="full_day" className="leading-none cursor-pointer uppercase tracking-tighter">На сутки (13:00 - 12:00)</label>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <Label className="text-xs text-muted-foreground font-black uppercase">Коттедж *</Label>
            <Select value={form.cottage_id} onValueChange={(v) => { setF("cottage_id", v); setF("is_full_day", false); }} disabled={!form.cottage_included}>
              <SelectTrigger className="h-10 bg-background rounded-lg font-bold shadow-sm w-full">
                <SelectValue placeholder="Выберите коттедж" />
              </SelectTrigger>
              <SelectContent>
                {cottages.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center justify-between min-w-[150px] w-full gap-2">
                      <span>{c.name}</span>
                      {c && (c as { capacity?: number | null }).capacity && <Badge variant="secondary" className="text-xs ml-auto">{(c as { capacity?: number | null }).capacity} мест</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.property !== "chunga_changa" && (
            <div className="space-y-1.5 min-w-[100px] flex-initial">
              <Label className="text-xs text-muted-foreground font-black uppercase">Гостей</Label>
              <Input type="number" value={form.guest_count} onChange={(e) => setF("guest_count", e.target.value)} disabled={!form.cottage_included} className="h-10 rounded-lg font-bold bg-background shadow-sm" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="p-3 bg-background/50 rounded-xl border border-border/40 flex-1 min-w-[200px]">
            <span className="text-xs font-black uppercase text-muted-foreground/70 mb-2 block tracking-widest">Заезд</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm"><DateInput value={form.checkin_at_date} onChange={(v) => setF("checkin_at_date", v)} /></div>
              <div className="w-16"><Input type="time" value={form.checkin_at_time} onChange={(e) => setF("checkin_at_time", e.target.value)} className="h-8 rounded-lg text-xs font-bold p-1" /></div>
            </div>
          </div>
          <div className="p-3 bg-background/50 rounded-xl border border-border/40 flex-1 min-w-[200px]">
            <span className="text-xs font-black uppercase text-muted-foreground/70 mb-2 block tracking-widest">Выезд</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm"><DateInput value={form.checkout_at_date} onChange={(v) => setF("checkout_at_date", v)} /></div>
              <div className="w-16"><Input type="time" value={form.checkout_at_time} onChange={(e) => setF("checkout_at_time", e.target.value)} className="h-8 rounded-lg text-xs font-bold p-1" /></div>
            </div>
          </div>
          {form.property !== "chunga_changa" && (
            <div className="flex flex-col items-center justify-center h-[58px] bg-amber-50 rounded-xl border border-amber-200 min-w-[80px]">
              <span className="text-xs font-black uppercase text-amber-700/70 block text-center mb-0.5">Ночей</span>
              <span className="text-xl font-black text-amber-700 leading-none">{daysCalc}</span>
            </div>
          )}
        </div>
      </div>

      {/* ADDITIONAL SERVICES for Golubaya Bukhta */}
      {form.property === "golubaya_bukhta" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Дополнительные услуги</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={cn(
              "p-4 rounded-xl border transition-all", 
              form.sauna_included ? "bg-teal-50/30 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900 shadow-sm" : "bg-muted/5 border-border/40 opacity-70"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="sauna_inc" checked={form.sauna_included} onCheckedChange={(c) => setF("sauna_included", !!c)} className="h-5 w-5 data-[state=checked]:bg-teal-600 dark:data-[state=checked]:bg-teal-500 border-teal-600 dark:border-teal-500" />
                <Label htmlFor="sauna_inc" className="font-black text-xs cursor-pointer uppercase text-teal-800 dark:text-teal-400">Русская баня</Label>
              </div>
              {form.sauna_included && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-black uppercase text-teal-700/60 dark:text-teal-400/60">Дата услуги</Label>
                    <div className="h-9"><DateInput value={form.sauna_date} onChange={(v) => setF("sauna_date", v)} /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-teal-700/60 dark:text-teal-400/60">Время С</Label>
                    <Input type="time" value={form.sauna_time_from} onChange={(e) => setF("sauna_time_from", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-teal-700/60 dark:text-teal-400/60">Время ПО</Label>
                    <Input type="time" value={form.sauna_time_to} onChange={(e) => setF("sauna_time_to", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-teal-700/60 dark:text-teal-400/60">Стоимость (₽)</Label>
                    <Input type="number" value={form.sauna_price} onChange={(e) => setF("sauna_price", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" placeholder="0" min={0} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-teal-700/60 dark:text-teal-400/60">Гостей</Label>
                    <Input type="number" value={form.sauna_guests} onChange={(e) => setF("sauna_guests", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" placeholder="0" min={0} />
                  </div>
                </div>
              )}
            </div>

            <div className={cn(
              "p-4 rounded-xl border transition-all", 
              form.hot_tub_included ? "bg-sky-50/30 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 shadow-sm" : "bg-muted/5 border-border/40 opacity-70"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="hot_tub_inc" checked={form.hot_tub_included} onCheckedChange={(c) => setF("hot_tub_included", !!c)} className="h-5 w-5 data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500 border-sky-600 dark:border-sky-500" />
                <Label htmlFor="hot_tub_inc" className="font-black text-xs cursor-pointer uppercase text-sky-800 dark:text-sky-400">Фурако</Label>
              </div>
              {form.hot_tub_included && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-black uppercase text-sky-700/60 dark:text-sky-400/60">Дата услуги</Label>
                    <div className="h-9"><DateInput value={form.hot_tub_date} onChange={(v) => setF("hot_tub_date", v)} /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-sky-700/60 dark:text-sky-400/60">Время С</Label>
                    <Input type="time" value={form.hot_tub_time_from} onChange={(e) => setF("hot_tub_time_from", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-sky-700/60 dark:text-teal-400/60">Время ПО</Label>
                    <Input type="time" value={form.hot_tub_time_to} onChange={(e) => setF("hot_tub_time_to", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-sky-700/60 dark:text-sky-400/60">Стоимость (₽)</Label>
                    <Input type="number" value={form.hot_tub_price} onChange={(e) => setF("hot_tub_price", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" placeholder="0" min={0} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-sky-700/60 dark:text-sky-400/60">Гостей</Label>
                    <Input type="number" value={form.hot_tub_guests} onChange={(e) => setF("hot_tub_guests", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" placeholder="0" min={0} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
