import { Check } from "lucide-react";

export function BookingLegend() {
  return (
    <div className="flex items-center gap-5 px-4 py-2 text-[11px] font-medium bg-background/70 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-3 rounded-md bg-sky-300 shadow-sm" />
        <span>Предбронь</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-3 rounded-md bg-amber-500 shadow-sm" />
        <span>Заключён</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-3 rounded-md bg-emerald-500 shadow-sm" />
          <Check className="h-3 w-3 text-emerald-600" />
        </div>
        <span>Оплачен</span>
      </div>
    </div>
  );
}
