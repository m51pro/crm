import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid as isDateValid } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES, GB_BANYA_ITEMS } from "@/lib/chess-data";

interface Props {
  open: boolean;
  onClose: () => void;
  contract?: any | null;
  onSaved: () => void;
}

type ContractStatus = "pre_booking" | "signed" | "paid" | "cancelled";

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: "pre_booking", label: "Предбронь" },
  { value: "signed", label: "Заключён" },
  { value: "paid", label: "Оплачен" },
  { value: "cancelled", label: "Аннулирован" },
];

const hours = Array.from({ length: 24 }, (_, i) => i);

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState("");
  const date = value ? new Date(value) : undefined;

  useEffect(() => {
    setText(date && isDateValid(date) ? format(date, "dd.MM.yyyy") : "");
  }, [value]);

  const handleChange = (val: string) => {
    let v = val.replace(/[^\d.]/g, "");
    const digits = v.replace(/\./g, "");
    if (digits.length >= 4) {
      v = digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4, 8);
    } else if (digits.length >= 2) {
      v = digits.slice(0, 2) + "." + digits.slice(2);
    }
    setText(v);
    const parts = v.split(".");
    if (parts.length === 3 && parts[2].length === 4) {
      const parsed = parse(v, "dd.MM.yyyy", new Date());
      if (isDateValid(parsed)) onChange(format(parsed, "yyyy-MM-dd"));
    }
  };

  const handleBlur = () => {
    if (!text.trim()) { onChange(""); return; }
    // Auto-fill year
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
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input value={text} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} placeholder="ДД.ММ.ГГГГ" className="pr-10 focus-visible:ring-accent" />
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[60]" align="end">
            <Calendar mode="single" selected={date} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")} className="p-3 pointer-events-auto" locale={ru} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function ContractModal({ open, onClose, contract, onSaved }: Props) {
  const isEditing = !!contract?.id;

  const [form, setForm] = useState({
    contract_number: "",
    contract_date: format(new Date(), "yyyy-MM-dd"),
    client_name: "",
    client_phone: "+7",
    client_id: null as string | null,
    property: "chunga_changa",
    cottage_id: "",
    check_in_date: "",
    check_in_hour: null as number | null,
    check_out_date: "",
    check_out_hour: null as number | null,
    is_daily: false,
    guest_count: null as number | null,
    total_amount: "",
    prepayment_amount: "",
    status: "pre_booking" as ContractStatus,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (contract) {
        setForm({
          contract_number: contract.contract_number ?? "",
          contract_date: contract.contract_date ?? format(new Date(), "yyyy-MM-dd"),
          client_name: contract.client_name ?? "",
          client_phone: contract.client_phone ?? "+7",
          client_id: contract.client_id ?? null,
          property: contract.property ?? "chunga_changa",
          cottage_id: contract.cottage_id ?? "",
          check_in_date: contract.check_in_date ?? "",
          check_in_hour: contract.check_in_hour ?? null,
          check_out_date: contract.check_out_date ?? "",
          check_out_hour: contract.check_out_hour ?? null,
          is_daily: contract.is_daily ?? false,
          guest_count: contract.guest_count ?? null,
          total_amount: contract.total_amount?.toString() ?? "",
          prepayment_amount: contract.prepayment_amount?.toString() ?? "",
          status: contract.status ?? "pre_booking",
          notes: contract.notes ?? "",
        });
      } else {
        // Generate contract number
        const num = `Д-${format(new Date(), "ddMMyy")}-${Math.floor(Math.random() * 900 + 100)}`;
        setForm({
          contract_number: num,
          contract_date: format(new Date(), "yyyy-MM-dd"),
          client_name: "", client_phone: "+7", client_id: null,
          property: "chunga_changa", cottage_id: "",
          check_in_date: "", check_in_hour: null,
          check_out_date: "", check_out_hour: null,
          is_daily: false, guest_count: null,
          total_amount: "", prepayment_amount: "",
          status: "pre_booking", notes: "",
        });
      }
      setErrors({});
      // Load clients for autocomplete
      supabase.from("clients").select("id, client_type, first_name, last_name, middle_name, org_name, phone, contact_phone").then(({ data }) => setClients(data ?? []));
    }
  }, [open, contract]);

  const set = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const handlePhone = (val: string) => {
    let v = val.replace(/[^\d+]/g, "");
    if (!v.startsWith("+7")) v = "+7" + v.replace(/^\+?7?/, "");
    if (v.length > 12) v = v.slice(0, 12);
    set("client_phone", v);
  };

  const cottages = form.property === "chunga_changa"
    ? CHUNGA_CHANGA_COTTAGES
    : [...GB_COTTAGES, ...GB_BANYA_ITEMS];

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.contract_number.trim()) e.contract_number = "Обязательное поле";
    if (!form.client_name.trim()) e.client_name = "Обязательное поле";
    if (!form.cottage_id) e.cottage_id = "Выберите коттедж";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormValid = () =>
    !!form.contract_number.trim() && !!form.client_name.trim() && !!form.cottage_id;

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        contract_number: form.contract_number,
        contract_date: form.contract_date,
        client_name: form.client_name,
        client_phone: form.client_phone || null,
        client_id: form.client_id || null,
        property: form.property,
        cottage_id: form.cottage_id,
        check_in_date: form.check_in_date || null,
        check_in_hour: form.check_in_hour,
        check_out_date: form.check_out_date || null,
        check_out_hour: form.check_out_hour,
        is_daily: form.is_daily,
        guest_count: form.guest_count,
        total_amount: form.total_amount ? parseFloat(form.total_amount) : 0,
        prepayment_amount: form.prepayment_amount ? parseFloat(form.prepayment_amount) : 0,
        status: form.status,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      };
      if (isEditing) {
        const { error } = await supabase.from("contracts").update(payload).eq("id", contract.id);
        if (error) throw error;
        toast.success("Договор обновлён");
      } else {
        const { error } = await supabase.from("contracts").insert(payload);
        if (error) throw error;
        toast.success("Договор создан");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error("Ошибка: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectClient = (c: any) => {
    const name = c.client_type === "individual"
      ? [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ")
      : c.org_name ?? "";
    set("client_name", name);
    set("client_phone", c.phone || c.contact_phone || "+7");
    set("client_id", c.id);
    setClientSearch("");
  };

  const filteredClients = clientSearch.trim()
    ? clients.filter(c => {
        const name = c.client_type === "individual"
          ? [c.last_name, c.first_name].filter(Boolean).join(" ")
          : c.org_name ?? "";
        return name.toLowerCase().includes(clientSearch.toLowerCase());
      }).slice(0, 5)
    : [];

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-[11px] text-destructive mt-0.5">{errors[field]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[700px] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="font-heading text-lg">
            {isEditing ? "Редактировать договор" : "Новый договор"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          <SectionHeader title="Основная информация" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">№ договора *</Label>
                <Input value={form.contract_number} onChange={(e) => set("contract_number", e.target.value)} className="focus-visible:ring-accent font-mono" />
                <FieldError field="contract_number" />
              </div>
              <DateInput label="Дата договора" value={form.contract_date} onChange={(v) => set("contract_date", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Статус</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="focus:ring-accent"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SectionHeader title="Клиент" />
          <div className="space-y-3">
            <div className="space-y-1.5 relative">
              <Label className="text-xs text-muted-foreground">ФИО / Название организации *</Label>
              <Input
                value={form.client_name}
                onChange={(e) => { set("client_name", e.target.value); setClientSearch(e.target.value); }}
                className="focus-visible:ring-accent"
                autoComplete="off"
              />
              <FieldError field="client_name" />
              {filteredClients.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredClients.map(c => {
                    const name = c.client_type === "individual"
                      ? [c.last_name, c.first_name].filter(Boolean).join(" ")
                      : c.org_name ?? "";
                    return (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => selectClient(c)}
                      >
                        {name}
                        {c.phone && <span className="ml-2 text-xs text-muted-foreground">{c.phone}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Телефон</Label>
                <Input value={form.client_phone} onChange={(e) => handlePhone(e.target.value)} className="focus-visible:ring-accent" />
              </div>
            </div>
          </div>

          <SectionHeader title="Размещение" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">База</Label>
                <Select value={form.property} onValueChange={(v) => { set("property", v); set("cottage_id", ""); }}>
                  <SelectTrigger className="focus:ring-accent"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chunga_changa">Чунга-Чанга</SelectItem>
                    <SelectItem value="golubaya_bukhta">Голубая Бухта</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Коттедж *</Label>
                <Select value={form.cottage_id} onValueChange={(v) => set("cottage_id", v)}>
                  <SelectTrigger className="focus:ring-accent"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    {cottages.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="cottage_id" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Дата заезда" value={form.check_in_date} onChange={(v) => set("check_in_date", v)} />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Час заезда</Label>
                <Select value={form.check_in_hour?.toString() ?? ""} onValueChange={(v) => set("check_in_hour", v ? parseInt(v) : null)}>
                  <SelectTrigger className="focus:ring-accent"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {hours.map(h => (
                      <SelectItem key={h} value={h.toString()}>{`${h}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Дата выезда" value={form.check_out_date} onChange={(v) => set("check_out_date", v)} />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Час выезда</Label>
                <Select value={form.check_out_hour?.toString() ?? ""} onValueChange={(v) => set("check_out_hour", v ? parseInt(v) : null)}>
                  <SelectTrigger className="focus:ring-accent"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {hours.map(h => (
                      <SelectItem key={h} value={h.toString()}>{`${h}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Кол-во гостей</Label>
              <Input
                type="number"
                value={form.guest_count ?? ""}
                onChange={(e) => set("guest_count", e.target.value ? parseInt(e.target.value) : null)}
                className="focus-visible:ring-accent w-32"
                min={1}
              />
            </div>
          </div>

          <SectionHeader title="Оплата" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Сумма (₽)</Label>
                <Input
                  type="number"
                  value={form.total_amount}
                  onChange={(e) => set("total_amount", e.target.value)}
                  className="focus-visible:ring-accent"
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Предоплата (₽)</Label>
                <Input
                  type="number"
                  value={form.prepayment_amount}
                  onChange={(e) => set("prepayment_amount", e.target.value)}
                  className="focus-visible:ring-accent"
                  min={0}
                />
              </div>
            </div>
          </div>

          <SectionHeader title="Дополнительно" />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Примечания</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="focus-visible:ring-accent" />
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 shrink-0 sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} disabled={!isFormValid() || saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
