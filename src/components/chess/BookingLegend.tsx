import { Check } from "lucide-react";

export function BookingLegend() {
  return (
    <div className="flex items-center gap-5 px-4 py-2 text-[11px] font-bold bg-secondary/30 backdrop-blur-sm rounded-2xl border border-white/5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-3 rounded-md bg-sky-300 shadow-sm" />
        <span className="text-muted-foreground">Предбронь</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-3 rounded-md bg-amber-500 shadow-sm" />
        <span className="text-muted-foreground">Заключён</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-3 rounded-md bg-emerald-500 shadow-sm" />
          <Check className="h-3 w-3 text-emerald-600" />
        </div>
        <span className="text-muted-foreground">Оплачен</span>
      </div>
    </div>
  );
}
