import { useState, useEffect } from "react";
import { format, parse, isValid as isDateValid } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateInput({ value, onChange, placeholder = "ДД.ММ.ГГГГ", className }: DateInputProps) {
  const [text, setText] = useState("");
  const date = value ? new Date(value) : undefined;

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (isDateValid(d)) {
        setText(format(d, "dd.MM.yyyy"));
      }
    } else {
      setText("");
    }
  }, [value]);

  const handleChange = (val: string, e: React.ChangeEvent<HTMLInputElement>) => {
    // If we're deleting (backspace/delete), we want to prevent automatic dot insertion 
    // that might fight with the user's deletion
    const isDeleting = (e.nativeEvent as any).inputType === 'deleteContentBackward';
    
    let v = val.replace(/[^\d.]/g, "");
    const digits = v.replace(/\./g, "");
    
    if (!isDeleting) {
      if (digits.length >= 4) {
        v = digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4, 8);
      } else if (digits.length >= 2) {
        v = digits.slice(0, 2) + "." + digits.slice(2);
      }
    } else {
      // If deleting and we just deleted a digit next to a dot, 
      // let's keep the dot for a split second or handle it naturally via the Input value
      // The simplest way is to just use the value as is from the input during deletion
      v = val;
    }
    
    setText(v);
    
    const cleanV = v.replace(/[^\d.]/g, "");
    if (cleanV.length === 10) {
      const parsed = parse(cleanV, "dd.MM.yyyy", new Date());
      if (isDateValid(parsed)) onChange(format(parsed, "yyyy-MM-dd"));
    }
  };

  const handleBlur = () => {
    if (!text.trim()) {
      onChange("");
      return;
    }
    const parts = text.split(".");
    if (parts.length >= 2 && (!parts[2] || parts[2].length === 0)) {
      const full = parts[0] + "." + parts[1] + "." + new Date().getFullYear();
      const parsed = parse(full, "dd.MM.yyyy", new Date());
      if (isDateValid(parsed)) {
        onChange(format(parsed, "yyyy-MM-dd"));
        setText(format(parsed, "dd.MM.yyyy"));
        return;
      }
    }
    const parsed = parse(text, "dd.MM.yyyy", new Date());
    if (isDateValid(parsed)) {
      onChange(format(parsed, "yyyy-MM-dd"));
      setText(format(parsed, "dd.MM.yyyy"));
    } else {
      setText(date && isDateValid(date) ? format(date, "dd.MM.yyyy") : "");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        value={text}
        onChange={(e) => handleChange(e.target.value, e)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="pr-10 h-9 rounded-lg"
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[60]" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            className="p-3 pointer-events-auto"
            locale={ru}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
