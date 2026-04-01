import React from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "./SectionHeader";
import { Contract } from "@/types/crm";

interface FinanceSectionProps {
  form: Contract;
  setF: (k: string, v: string | number | boolean) => void;
  totalRentSum: number;
  totalToPay: number;
  showExtraInfo: boolean;
  setShowExtraInfo: (v: boolean) => void;
}

export function FinanceSection({
  form,
  setF,
  totalRentSum,
  totalToPay,
  showExtraInfo,
  setShowExtraInfo,
}: FinanceSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Финансы" />
      <div className="grid grid-cols-2 gap-6 items-start">
        <div className="flex gap-4 text-xs font-bold text-muted-foreground whitespace-nowrap">
          <div className="space-y-1.5 flex-1 min-w-0">
            <Label className="text-xs">Стоимость аренды (₽) *</Label>
            <Input 
              type="number" 
              value={form.rent_price} 
              onChange={e => setF("rent_price", e.target.value)} 
              className="h-10 focus:ring-accent font-bold text-lg rounded-lg" 
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <Label className="text-xs">Внесена предоплата (₽)</Label>
            <Input 
              type="number" 
              value={form.prepayment} 
              onChange={e => setF("prepayment", e.target.value)} 
              className="h-10 focus:ring-accent font-bold text-lg rounded-lg" 
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-black uppercase text-muted-foreground opacity-80 mb-1">Итоговая стоимость (₽)</span>
            <span className="text-2xl font-black text-foreground">{totalRentSum.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="bg-amber-500 rounded-xl p-4 text-white shadow-lg flex flex-col justify-center">
            <span className="text-xs font-black uppercase opacity-80 mb-1">Остаток к оплате</span>
            <span className="text-3xl font-black">{totalToPay.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {!showExtraInfo ? (
          <Button variant="ghost" size="sm" onClick={() => setShowExtraInfo(true)} className="w-full justify-start text-xs text-muted-foreground gap-2">
            <Plus className="h-3 w-3" /> Добавить комментарий
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between border-t pt-4">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase">
                <MessageSquare className="h-3 w-3" /> Комментарий
              </Label>
              <Button variant="ghost" size="sm" onClick={() => setShowExtraInfo(false)} className="h-6 px-2 text-xs">Скрыть</Button>
            </div>
            <Textarea 
              value={form.extra_info} 
              onChange={(e) => setF("extra_info", e.target.value)} 
              rows={3} 
              className="rounded-lg bg-muted/20 resize-none" 
              placeholder="Доп. информация..." 
            />
          </div>
        )}
      </div>
    </div>
  );
}
