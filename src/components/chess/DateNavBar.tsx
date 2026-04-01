import { format, addDays, subDays, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateNavBarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onExportPdf: () => void;
}

export function DateNavBar({ date, onDateChange, onExportPdf }: DateNavBarProps) {
  const dateStr = format(date, "EEEE, d MMMM yyyy", { locale: ru });

  return (
    <div className="sticky top-0 z-30 bg-card border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDateChange(subDays(date, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="font-heading text-lg font-semibold capitalize min-w-[280px] text-center">
          {dateStr}
        </h2>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDateChange(addDays(date, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 ml-1">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {!isToday(date) && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => onDateChange(new Date())}
          >
            Сегодня
          </Button>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onExportPdf}>
        Экспорт PDF
      </Button>
    </div>
  );
}
