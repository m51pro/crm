import { Check } from "lucide-react";

export function BookingLegend() {
  return (
    <div className="flex items-center gap-6 px-2 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-5 h-3 rounded border-2 border-dashed border-blue-300 bg-blue-50" />
        <span>Предбронь</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-5 h-3 rounded border border-solid border-blue-400 bg-blue-100" />
        <span>Договор заключён</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5">
          <span className="inline-block w-5 h-3 rounded border border-solid border-blue-500 bg-blue-200" />
          <Check className="h-3 w-3 text-emerald-600" />
        </span>
        <span>Договор оплачен</span>
      </div>
    </div>
  );
}
