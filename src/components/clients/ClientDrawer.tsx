import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, ChevronDown, AlertTriangle, Building2, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ClientType = "individual" | "legal_entity";

export interface ClientData {
  id?: string;
  client_type: ClientType;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  birth_date?: string | null;
  phone?: string;
  email?: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_date?: string | null;
  passport_issued_by?: string;
  registration_address?: string;
  org_name?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legal_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  bank_name?: string;
  settlement_account?: string;
  corr_account?: string;
  bik?: string;
  notes?: string;
  is_blacklisted?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  client?: ClientData | null;
  onSaved: () => void;
}

const emptyClient: ClientData = {
  client_type: "individual",
  last_name: "",
  first_name: "",
  middle_name: "",
  phone: "+7",
  email: "",
  passport_series: "",
  passport_number: "",
  passport_issued_by: "",
  registration_address: "",
  org_name: "",
  inn: "",
  kpp: "",
  ogrn: "",
  legal_address: "",
  contact_person: "",
  contact_phone: "+7",
  contact_email: "",
  bank_name: "",
  settlement_account: "",
  corr_account: "",
  bik: "",
  notes: "",
  is_blacklisted: false,
};

function DateField({ label, value, onChange }: { label: string; value?: string | null; onChange: (v: string | null) => void }) {
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy") : "Выбрать дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : null)}
            className="p-3 pointer-events-auto"
            locale={ru}
          />
        </PopoverContent>
      </Popover>
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

export default function ClientDrawer({ open, onClose, client, onSaved }: Props) {
  const isEditing = !!client?.id;
  const [form, setForm] = useState<ClientData>(emptyClient);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(client ? { ...emptyClient, ...client } : { ...emptyClient });
      setErrors({});
    }
  }, [open, client]);

  const set = (field: keyof ClientData, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const handlePhone = (val: string, field: "phone" | "contact_phone") => {
    let v = val.replace(/[^\d+]/g, "");
    if (!v.startsWith("+7")) v = "+7" + v.replace(/^\+?7?/, "");
    if (v.length > 12) v = v.slice(0, 12);
    set(field, v);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.client_type === "individual") {
      if (!form.last_name?.trim()) e.last_name = "Обязательное поле";
      if (!form.first_name?.trim()) e.first_name = "Обязательное поле";
      if (!form.phone || form.phone.length < 12) e.phone = "Введите номер полностью";
    } else {
      if (!form.org_name?.trim()) e.org_name = "Обязательное поле";
      if (!form.inn?.trim()) e.inn = "Обязательное поле";
      else if (!/^\d{10}$/.test(form.inn.trim())) e.inn = "ИНН должен содержать 10 цифр";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValid = () => {
    if (form.client_type === "individual") {
      return !!form.last_name?.trim() && !!form.first_name?.trim() && (form.phone?.length ?? 0) >= 12;
    }
    return !!form.org_name?.trim() && /^\d{10}$/.test(form.inn?.trim() ?? "");
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: any = {
        client_type: form.client_type,
        last_name: form.last_name || null,
        first_name: form.first_name || null,
        middle_name: form.middle_name || null,
        birth_date: form.birth_date || null,
        phone: form.phone || null,
        email: form.email || null,
        passport_series: form.passport_series || null,
        passport_number: form.passport_number || null,
        passport_issued_date: form.passport_issued_date || null,
        passport_issued_by: form.passport_issued_by || null,
        registration_address: form.registration_address || null,
        org_name: form.org_name || null,
        inn: form.inn || null,
        kpp: form.kpp || null,
        ogrn: form.ogrn || null,
        legal_address: form.legal_address || null,
        contact_person: form.contact_person || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        bank_name: form.bank_name || null,
        settlement_account: form.settlement_account || null,
        corr_account: form.corr_account || null,
        bik: form.bik || null,
        notes: form.notes || null,
        is_blacklisted: form.is_blacklisted ?? false,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase.from("clients").update(payload).eq("id", client!.id!);
        if (error) throw error;
        toast.success("Клиент обновлён");
      } else {
        const { error } = await supabase.from("clients").insert(payload);
        if (error) throw error;
        toast.success("Клиент добавлен");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error("Ошибка сохранения: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!client?.id) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", client.id);
      if (error) throw error;
      toast.success("Клиент удалён");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error("Ошибка удаления: " + err.message);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-[11px] text-destructive mt-0.5">{errors[field]}</p> : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-heading text-lg">
            {isEditing ? "Редактировать клиента" : "Новый клиент"}
          </SheetTitle>
          {/* Type toggle */}
          <div className="flex mt-3 bg-muted rounded-lg p-1 gap-1">
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                form.client_type === "individual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => set("client_type", "individual")}
            >
              <User className="h-4 w-4" /> Физическое лицо
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                form.client_type === "legal_entity" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => set("client_type", "legal_entity")}
            >
              <Building2 className="h-4 w-4" /> Юридическое лицо
            </button>
          </div>
        </SheetHeader>

        {/* Blacklist banner */}
        {form.is_blacklisted && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2.5 text-sm text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" /> Клиент в чёрном списке
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {form.client_type === "individual" ? (
            <>
              <SectionHeader title="Личные данные" />
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Фамилия *</Label>
                    <Input value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} autoFocus className="focus-visible:ring-accent" />
                    <FieldError field="last_name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Имя *</Label>
                    <Input value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} className="focus-visible:ring-accent" />
                    <FieldError field="first_name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Отчество</Label>
                    <Input value={form.middle_name ?? ""} onChange={(e) => set("middle_name", e.target.value)} className="focus-visible:ring-accent" />
                  </div>
                </div>
                <DateField label="Дата рождения" value={form.birth_date} onChange={(v) => set("birth_date", v)} />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Телефон *</Label>
                  <Input value={form.phone ?? "+7"} onChange={(e) => handlePhone(e.target.value, "phone")} placeholder="+7 (___) ___-__-__" className="focus-visible:ring-accent" />
                  <FieldError field="phone" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className="focus-visible:ring-accent" />
                </div>
              </div>

              <SectionHeader title="Паспортные данные" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Серия</Label>
                    <Input value={form.passport_series ?? ""} onChange={(e) => set("passport_series", e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} placeholder="0000" className="focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Номер</Label>
                    <Input value={form.passport_number ?? ""} onChange={(e) => set("passport_number", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="000000" className="focus-visible:ring-accent" />
                  </div>
                </div>
                <DateField label="Дата выдачи" value={form.passport_issued_date} onChange={(v) => set("passport_issued_date", v)} />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Кем выдан</Label>
                  <Textarea value={form.passport_issued_by ?? ""} onChange={(e) => set("passport_issued_by", e.target.value)} rows={2} className="focus-visible:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Адрес регистрации</Label>
                  <Textarea value={form.registration_address ?? ""} onChange={(e) => set("registration_address", e.target.value)} rows={2} className="focus-visible:ring-accent" />
                </div>
              </div>
            </>
          ) : (
            <>
              <SectionHeader title="Организация" />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Наименование организации *</Label>
                  <Input value={form.org_name ?? ""} onChange={(e) => set("org_name", e.target.value)} autoFocus className="focus-visible:ring-accent" />
                  <FieldError field="org_name" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ИНН *</Label>
                    <Input value={form.inn ?? ""} onChange={(e) => set("inn", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} placeholder="10 цифр" className="focus-visible:ring-accent" />
                    <FieldError field="inn" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">КПП</Label>
                    <Input value={form.kpp ?? ""} onChange={(e) => set("kpp", e.target.value)} className="focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ОГРН</Label>
                    <Input value={form.ogrn ?? ""} onChange={(e) => set("ogrn", e.target.value)} className="focus-visible:ring-accent" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Юридический адрес</Label>
                  <Textarea value={form.legal_address ?? ""} onChange={(e) => set("legal_address", e.target.value)} rows={2} className="focus-visible:ring-accent" />
                </div>
              </div>

              <SectionHeader title="Контактное лицо" />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">ФИО контактного лица</Label>
                  <Input value={form.contact_person ?? ""} onChange={(e) => set("contact_person", e.target.value)} className="focus-visible:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Телефон</Label>
                  <Input value={form.contact_phone ?? "+7"} onChange={(e) => handlePhone(e.target.value, "contact_phone")} placeholder="+7 (___) ___-__-__" className="focus-visible:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} className="focus-visible:ring-accent" />
                </div>
              </div>

              <SectionHeader title="Банковские реквизиты" />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Банк</Label>
                  <Input value={form.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value)} className="focus-visible:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Расчётный счёт</Label>
                  <Input value={form.settlement_account ?? ""} onChange={(e) => set("settlement_account", e.target.value)} className="focus-visible:ring-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Корр. счёт</Label>
                    <Input value={form.corr_account ?? ""} onChange={(e) => set("corr_account", e.target.value)} className="focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">БИК</Label>
                    <Input value={form.bik ?? ""} onChange={(e) => set("bik", e.target.value)} className="focus-visible:ring-accent" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Common section */}
          <SectionHeader title="Дополнительно" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Доп. информация</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} className="focus-visible:ring-accent" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Чёрный список</span>
              </div>
              <Switch checked={form.is_blacklisted ?? false} onCheckedChange={(v) => set("is_blacklisted", v)} />
            </div>
          </div>

          {/* Contract history stub */}
          {isEditing && (
            <Collapsible className="mt-6">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-180" />
                История договоров (0)
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <p className="text-xs text-muted-foreground">Договоров пока нет.</p>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t px-6 py-4 flex-row items-center">
          <div className="flex-1">
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-1" /> Удалить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
                    <AlertDialogDescription>Это действие нельзя отменить. Все данные клиента будут удалены.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button onClick={handleSave} disabled={!isValid() || saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </SheetFooter>

        {isEditing && (
          <div className="px-6 pb-4 text-center">
            <button className="text-xs text-accent hover:underline">
              Создать договор для этого клиента →
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
