import { useState, useRef, useEffect } from "react";
import { format, addDays, subDays, isToday, parse, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateNavBarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onExportPdf: () => void;
}

export function DateNavBar({ date, onDateChange, onExportPdf }: DateNavBarProps) {
  const dateStr = format(date, "EEEE, d MMMM yyyy", { locale: ru });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = () => {
    setInputValue(format(date, "dd.MM.yyyy"));
    setEditing(true);
  };

  const commitDate = () => {
    const parsed = parse(inputValue, "dd.MM.yyyy", new Date());
    if (isValid(parsed) && parsed.getFullYear() > 1900) {
      onDateChange(parsed);
      setEditing(false);
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setEditing(false);
      }, 500);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/60 px-5 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDateChange(subDays(date, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {editing ? (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitDate();
              if (e.key === "Escape") cancelEditing();
            }}
            onBlur={commitDate}
            placeholder="ДД.ММ.ГГГГ"
            className={cn(
              "w-[180px] h-9 text-center font-mono text-sm font-semibold bg-background border-border/70 rounded-xl",
              shake && "animate-shake"
            )}
          />
        ) : (
          <h2
            className="font-heading text-lg font-semibold capitalize min-w-[280px] text-center cursor-pointer hover:text-accent transition-colors"
            onClick={startEditing}
            title="Нажмите для ручного ввода даты"
          >
            {dateStr}
          </h2>
        )}

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
              locale={ru}
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

      <Button
        variant="secondary"
        size="sm"
        onClick={onExportPdf}
        className="rounded-xl px-5 h-9 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
      >
        Экспорт PDF
      </Button>
    </div>
  );
}
