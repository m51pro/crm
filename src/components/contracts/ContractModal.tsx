import { useEffect, useState, useMemo, useCallback } from "react";
import { format, differenceInDays, addHours, parse } from "date-fns";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover, PopoverContent, PopoverTrigger, PopoverAnchor 
} from "@/components/ui/popover";
import { 
  Search, Plus, User, Building2, Calendar as CalendarIcon, 
  Check, ChevronDown, Mail, FileDown, MessageSquare 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DateInput } from "@/components/ui/DateInput";
import { API_URL } from "@/lib/api";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES } from "@/lib/chess-data";
import { toast } from "sonner";
import ClientDrawer from "../clients/ClientDrawer";

interface Cottage {
  id: string;
  name: string;
  capacity?: number;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  org_name?: string;
  phone?: string;
  contact_phone?: string;
  client_type: "individual" | "legal";
}

interface Props {
  open: boolean;
  onClose: () => void;
  contract?: {
    id?: string;
    contract_number?: string;
    contract_date?: string;
    client_id?: string;
    client_name?: string;
    client_phone?: string;
    property?: string;
    cottage_id?: string;
    bath_included?: boolean;
    bath_date?: string;
    bath_time_from?: string;
    bath_time_to?: string;
    checkin_at?: string;
    check_in_date?: string;
    check_in_hour?: string | number;
    checkout_at?: string;
    check_out_date?: string;
    check_out_hour?: string | number;
    guest_count?: string | number;
    rent_price?: number;
    total_amount?: number;
    prepayment?: number;
    prepayment_amount?: number;
    payment_date?: string;
    payment_amount?: number;
    extra_info?: string;
    notes?: string;
    status?: string;
    is_full_day?: boolean;
    cottage_included?: boolean;
    sauna_included?: boolean;
    hot_tub_included?: boolean;
    sauna_date?: string;
    sauna_time_from?: string;
    sauna_time_to?: string;
    sauna_price?: string | number;
    sauna_guests?: string | number;
    hot_tub_date?: string;
    hot_tub_time_from?: string;
    hot_tub_time_to?: string;
    hot_tub_price?: string | number;
    hot_tub_guests?: string | number;
    created_at?: string;
  };
  onSaved: () => void;
}

const statusOptions = [
  { value: "pre_booking", label: "Предбронь" },
  { value: "not_paid", label: "Не оплачен" },
  { value: "partial_paid", label: "Частичная предоплата" },
  { value: "paid", label: "Оплачен" },
  { value: "cancelled", label: "Аннулирован" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-2">
      <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-accent/80 whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export default function ContractModal({ open, onClose, contract, onSaved }: Props) {
  const isEditing = !!contract?.id;
  
  const [form, setForm] = useState({
    contract_number: "",
    contract_date: format(new Date(), "yyyy-MM-dd"),
    client_id: "",
    client_name: "",
    client_phone: "",
    property: "chunga_changa",
    cottage_id: "",
    bath_included: false,
    bath_date: "",
    bath_time_from: "",
    bath_time_to: "",
    checkin_at_date: "",
    checkin_at_time: "14:00",
    checkout_at_date: "",
    checkout_at_time: "12:00",
    guest_count: "" as string | number,
    rent_price: "",
    prepayment: "",
    payment_date: "",
    payment_amount: "",
    extra_info: "",
    status: "not_paid",
    is_prebooking: false,
    is_full_day: false,
    cottage_included: true,
    sauna_included: false,
    hot_tub_included: false,
    sauna_date: "",
    sauna_time_from: "",
    sauna_time_to: "",
    sauna_price: "",
    sauna_guests: "",
    hot_tub_date: "",
    hot_tub_time_from: "",
    hot_tub_time_to: "",
    hot_tub_price: "",
    hot_tub_guests: "",
  });

  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClients();
      if (contract) {
        setForm({
          contract_number: contract.contract_number || "",
          contract_date: contract.contract_date || format(new Date(), "yyyy-MM-dd"),
          client_id: contract.client_id || "",
          client_name: contract.client_name || "",
          client_phone: contract.client_phone || "",
          property: contract.property || "chunga_changa",
          cottage_id: contract.cottage_id || "",
          bath_included: !!contract.bath_included,
          bath_date: contract.bath_date || "",
          bath_time_from: contract.bath_time_from || "",
          bath_time_to: contract.bath_time_to || "",
          checkin_at_date: contract.checkin_at ? format(new Date(contract.checkin_at), "yyyy-MM-dd") : (contract.check_in_date || ""),
          checkin_at_time: contract.checkin_at ? format(new Date(contract.checkin_at), "HH:mm") : (contract.check_in_hour ? `${contract.check_in_hour}:00` : "14:00"),
          checkout_at_date: contract.checkout_at ? format(new Date(contract.checkout_at), "yyyy-MM-dd") : (contract.check_out_date || ""),
          checkout_at_time: contract.checkout_at ? format(new Date(contract.checkout_at), "HH:mm") : (contract.check_out_hour ? `${contract.check_out_hour}:00` : "12:00"),
          guest_count: contract.guest_count || "",
          rent_price: (contract.rent_price || contract.total_amount || 0).toString(),
          prepayment: (contract.prepayment || contract.prepayment_amount || 0).toString(),
          payment_date: contract.payment_date || "",
          payment_amount: (contract.payment_amount || 0).toString(),
          extra_info: contract.extra_info || contract.notes || "",
          status: contract.status || "not_paid",
          is_prebooking: contract.status === "pre_booking",
          is_full_day: !!contract.is_full_day,
          cottage_included: contract.cottage_included !== undefined ? !!contract.cottage_included : true,
          sauna_included: !!contract.sauna_included,
          hot_tub_included: !!contract.hot_tub_included,
          sauna_date: contract.sauna_date || "",
          sauna_time_from: contract.sauna_time_from || "",
          sauna_time_to: contract.sauna_time_to || "",
          sauna_price: contract.sauna_price?.toString() || "",
          sauna_guests: contract.sauna_guests?.toString() || "",
          hot_tub_date: contract.hot_tub_date || "",
          hot_tub_time_from: contract.hot_tub_time_from || "",
          hot_tub_time_to: contract.hot_tub_time_to || "",
          hot_tub_price: contract.hot_tub_price?.toString() || "",
          hot_tub_guests: contract.hot_tub_guests?.toString() || "",
        });
      } else {
        fetch(`${API_URL}/contracts/next-number`).then(r => r.json()).then(d => {
          setForm(prev => ({ ...prev, contract_number: d.next_number || "Новый" }));
        });
        setForm({
          contract_number: "Загрузка...",
          contract_date: format(new Date(), "yyyy-MM-dd"),
          client_id: "", client_name: "", client_phone: "",
          property: "chunga_changa", cottage_id: "",
          bath_included: false, bath_date: "", bath_time_from: "", bath_time_to: "",
          checkin_at_date: "", checkin_at_time: "14:00",
          checkout_at_date: "", checkout_at_time: "12:00",
          guest_count: "", rent_price: "", prepayment: "",
          payment_date: "", payment_amount: "", extra_info: "",
          status: "not_paid",
          is_prebooking: false,
          is_full_day: false,
          cottage_included: true,
          sauna_included: false,
          hot_tub_included: false,
          sauna_date: "",
          sauna_time_from: "",
          sauna_time_to: "",
          sauna_price: "",
          sauna_guests: "",
          hot_tub_date: "",
          hot_tub_time_from: "",
          hot_tub_time_to: "",
          hot_tub_price: "",
          hot_tub_guests: "",
        });
      }
    }
  }, [open, contract]);

  const setF = useCallback((k: string, v: string | number | boolean) => setForm(p => {
    const next = { ...p, [k]: v };
    
    // Auto-set checkout day/time for Golubaya Bukhta
    if (k === "property" && v === "golubaya_bukhta") {
      next.checkin_at_time = "17:00";
      next.checkout_at_time = "14:00";
      if (next.checkin_at_date) {
        const d = new Date(next.checkin_at_date);
        d.setDate(d.getDate() + 1);
        next.checkout_at_date = format(d, "yyyy-MM-dd");
      }
    } else if (k === "checkin_at_date" && next.property === "golubaya_bukhta") {
      const d = new Date(v as string);
      d.setDate(d.getDate() + 1);
      next.checkin_at_time = "17:00";
      next.checkout_at_time = "14:00";
      next.checkout_at_date = format(d, "yyyy-MM-dd");
    }
    
    // Auto-set checkout day/time for Chunga Changa (Full day logic for cc-6 / cc-9)
    if (next.property === "chunga_changa") {
      if (k === "is_full_day" && v === true) {
        next.checkin_at_time = "13:00";
        next.checkout_at_time = "12:00";
        if (next.checkin_at_date) {
          const d = new Date(next.checkin_at_date);
          d.setDate(d.getDate() + 1);
          next.checkout_at_date = format(d, "yyyy-MM-dd");
        }
      } else if (!next.is_full_day && (k === "checkin_at_date" || k === "checkin_at_time")) {
        // Mode 3 hours for regular Chunga Changa
        if (next.checkin_at_date && next.checkin_at_time) {
          try {
            const currentCheckin = parse(`${next.checkin_at_date} ${next.checkin_at_time}`, "yyyy-MM-dd HH:mm", new Date());
            const threeHoursLater = addHours(currentCheckin, 3);
            next.checkout_at_date = format(threeHoursLater, "yyyy-MM-dd");
            next.checkout_at_time = format(threeHoursLater, "HH:mm");
          } catch (e) {
            console.error("Date parse error", e);
          }
        }
      }
    }
    
    return next;
  }), []);

  const cottages: Cottage[] = useMemo(() => {
    const baseList = form.property === "chunga_changa" ? CHUNGA_CHANGA_COTTAGES : GB_COTTAGES;
    return baseList;
  }, [form.property]);

  const daysCalc = useMemo(() => {
    if (!form.checkin_at_date || !form.checkout_at_date) return 0;
    const d1 = new Date(form.checkin_at_date);
    const d2 = new Date(form.checkout_at_date);
    return Math.max(0, differenceInDays(d2, d1));
  }, [form.checkin_at_date, form.checkout_at_date]);

  const totalRentSum = useMemo(() => {
    let sum = parseFloat(form.rent_price) || 0;
    if (form.property === "golubaya_bukhta") {
      if (form.sauna_included) sum += (parseFloat(form.sauna_price as string) || 0);
      if (form.hot_tub_included) sum += (parseFloat(form.hot_tub_price as string) || 0);
    }
    return sum;
  }, [form.rent_price, form.property, form.sauna_included, form.sauna_price, form.hot_tub_included, form.hot_tub_price]);

  const totalToPay = useMemo(() => {
    const prepay = parseFloat(form.prepayment) || 0;
    return Math.max(0, totalRentSum - prepay);
  }, [totalRentSum, form.prepayment]);

  useEffect(() => {
    if (form.status === "cancelled") return;
    if (form.is_prebooking) {
      if (form.status !== "pre_booking") setF("status", "pre_booking");
      return;
    }
    const rent = totalRentSum;
    const prepay = parseFloat(form.prepayment.toString()) || 0;
    let newStatus = "not_paid";
    if (prepay === 0) {
      newStatus = "not_paid";
    } else {
      const remains = Math.max(0, rent - prepay);
      if (remains === 0) newStatus = "paid";
      else if (remains > 0 && remains < rent) newStatus = "partial_paid";
      else newStatus = "not_paid"; 
    }
    if (form.status !== newStatus) setF("status", newStatus);
  }, [totalRentSum, form.prepayment, form.status, form.is_prebooking, setF]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q && !clientSearchOpen) return [];
    return clients.filter(c => {
      const fullName = [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ").toLowerCase();
      const orgName = (c.org_name || "").toLowerCase();
      const phone = (c.phone || c.contact_phone || "").toLowerCase();
      return fullName.includes(q) || orgName.includes(q) || phone.includes(q);
    }).slice(0, 10);
  }, [clients, clientSearch, clientSearchOpen]);

  const handleSave = async (closeAfter = true) => {
    if (!form.client_name || !form.cottage_id) {
      toast.error("Заполните арендатора и коттедж");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        days: daysCalc,
        total: totalToPay,
        checkin_at: form.checkin_at_date ? `${form.checkin_at_date}T${form.checkin_at_time}:00` : null,
        checkout_at: form.checkout_at_date ? `${form.checkout_at_date}T${form.checkout_at_time}:00` : null,
      };
      if (isEditing && contract) {
        await fetch(`${API_URL}/contracts/${contract.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Договор обновлён");
      } else {
        await fetch(`${API_URL}/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Договор создан");
      }
      onSaved();
      if (closeAfter) onClose();
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(error.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (newStatus: string) => {
    if (newStatus === "cancelled" && !confirm("Вы уверены? Бронь будет снята с шахматки.")) return;
    setF("status", newStatus);
    toast.success(`Статус изменен на: ${statusOptions.find(o => o.value === newStatus)?.label}. Нажмите ОК для сохранения.`);
  };

  const getStatusBadge = () => {
    const opt = statusOptions.find(o => o.value === form.status);
    if (!opt) return null;
    if (form.status === "paid") return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold ml-3 shadow-md border-0"><Check className="h-3 w-3 mr-1" />{opt.label}</Badge>;
    if (form.status === "partial_paid") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold ml-3 border-amber-200">{opt.label}</Badge>;
    if (form.status === "not_paid") return <Badge className="bg-red-50 text-red-600 font-bold ml-3 shadow-sm border-none">{opt.label}</Badge>;
    if (form.status === "cancelled") return <Badge variant="secondary" className="text-muted-foreground ml-3 opacity-50">{opt.label}</Badge>;
    return <Badge variant="outline" className="border-sky-400 text-sky-600 bg-sky-50 font-bold ml-3 uppercase tracking-tighter">{opt.label}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[780px] max-h-[95vh] p-0 flex flex-col gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-xl">
          <DialogHeader className="px-8 pt-7 pb-5 border-b bg-muted/30 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-heading text-2xl font-bold flex items-center">
                {isEditing ? "Договор" : "Новый договор"}
                {getStatusBadge()}
              </DialogTitle>
            </div>
            {!isEditing && (
              <div className="flex mt-3 bg-muted rounded-lg p-1 gap-1">
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all",
                    form.property === "chunga_changa" ? "bg-background shadow-sm text-chunga" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setF("property", "chunga_changa")}
                >
                  <div className={cn("w-2 h-2 rounded-full bg-chunga", form.property !== "chunga_changa" && "opacity-40")} />
                  Чунга-Чанга
                </button>
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all",
                    form.property === "golubaya_bukhta" ? "bg-background shadow-sm text-bukhta" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setF("property", "golubaya_bukhta")}
                >
                  <div className={cn("w-2 h-2 rounded-full bg-bukhta", form.property !== "golubaya_bukhta" && "opacity-40")} />
                  Голубая Бухта
                </button>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-8 min-h-0 custom-scrollbar relative">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-6 pb-2">
              <div className="flex items-center gap-6">
                <SectionHeader title="Основное" />
                {!isEditing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-xl transition-all hover:bg-sky-100/50">
                    <Checkbox id="prebooking" checked={form.is_prebooking} onCheckedChange={(c) => setF("is_prebooking", !!c)} className="border-sky-400 data-[state=checked]:bg-sky-500" />
                    <label htmlFor="prebooking" className="text-[11px] font-black uppercase text-sky-700 dark:text-sky-400 cursor-pointer tracking-wider">Предбронь</label>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter opacity-70">№ договора</span>
                <span className="font-mono text-lg font-black text-accent -mt-0.5 leading-none">{form.contract_number}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 border border-border/50 rounded-xl w-fit">
                    <div className={cn("w-2 h-2 rounded-full", form.property === "chunga_changa" ? "bg-chunga shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-bukhta shadow-[0_0_8px_rgba(14,165,233,0.4)]")} />
                    <span className="text-[12px] font-bold">{form.property === "chunga_changa" ? "Чунга-Чанга" : "Голубая Бухта"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-bold">Дата заключения</Label>
                  <DateInput value={form.contract_date} onChange={(v) => setF("contract_date", v)} />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label className="text-xs text-muted-foreground font-bold">Арендатор *</Label>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverAnchor asChild>
                    <div className="relative cursor-pointer">
                      <Input 
                        value={form.client_name ? `${form.client_name} ${form.client_phone ? '(' + form.client_phone + ')' : ''}` : clientSearch}
                        onChange={(e) => { 
                          if (form.client_name) {
                            setF("client_name", ""); setF("client_id", ""); setF("client_phone", "");
                          }
                          setClientSearch(e.target.value); setClientSearchOpen(true);
                        }}
                        onFocus={() => setClientSearchOpen(true)}
                        placeholder="Поиск по имени или телефону..."
                        className="pr-10 h-11 bg-background focus-visible:ring-accent font-bold text-base rounded-xl"
                      />
                      <Search className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", clientSearchOpen ? "text-accent" : "text-muted-foreground")} />
                    </div>
                  </PopoverAnchor>
                  <PopoverContent className="w-[700px] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Результаты поиска</div>
                      {filteredClients.map(c => {
                        const name = c.client_type === "individual" ? `${c.last_name} ${c.first_name}` : c.org_name;
                        return (
                          <button key={c.id} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                            onClick={() => {
                              setF("client_id", c.id); setF("client_name", name); setF("client_phone", c.phone || c.contact_phone || "");
                              setClientSearch(""); setClientSearchOpen(false);
                            }}>
                            <div className="flex items-center gap-2">
                              {c.client_type === "individual" ? <User className="h-4 w-4 text-muted-foreground" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                              <span className="font-medium text-foreground">{name}</span>
                            </div>
                            <span className="text-muted-foreground text-xs font-bold">{c.phone || c.contact_phone}</span>
                          </button>
                        );
                      })}
                      <div className="h-px bg-border my-1" />
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-accent hover:bg-accent/10 transition-colors font-medium"
                        onClick={() => setClientDrawerOpen(true)}>
                        <Plus className="h-4 w-4" /> Добавить нового клиента
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <SectionHeader title="Бронирование" />
            
            {/* БЛОК КОТТЕДЖА */}
            <div className={cn("space-y-4 p-5 rounded-2xl border transition-all mb-6", 
              form.cottage_included ? "bg-muted/20 border-border/50 shadow-sm" : "bg-muted/5 border-dashed opacity-50 shadow-none")}>
              
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

              <div className="grid gap-4" style={{ gridTemplateColumns: form.property === "chunga_changa" ? "1fr" : "1fr 140px" }}>
                <div className="space-y-1.5 w-full">
                  <Label className="text-[10px] text-muted-foreground font-black uppercase">Коттедж *</Label>
                  <Select value={form.cottage_id} onValueChange={(v) => { setF("cottage_id", v); setF("is_full_day", false); }} disabled={!form.cottage_included}>
                    <SelectTrigger className="h-10 bg-background rounded-xl font-bold shadow-sm w-full">
                      <SelectValue placeholder="Выберите коттедж" />
                    </SelectTrigger>
                    <SelectContent>
                      {cottages.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center justify-between min-w-[150px] w-full gap-2">
                            <span>{c.name}</span>
                            {form.property !== "chunga_changa" && c.capacity && <Badge variant="secondary" className="text-[9px] ml-auto">{c.capacity} мест</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.property !== "chunga_changa" && (
                  <div className="space-y-1.5 w-[140px]">
                    <Label className="text-[10px] text-muted-foreground font-black uppercase">Гостей</Label>
                    <Input type="number" value={form.guest_count} onChange={(e) => setF("guest_count", e.target.value)} disabled={!form.cottage_included} className="h-10 rounded-xl font-bold bg-background shadow-sm" />
                  </div>
                )}
              </div>

              <div className={cn("grid gap-4 items-end", form.property === "chunga_changa" ? "grid-cols-[1fr_1fr]" : "grid-cols-[1fr_1fr_80px]")}>
                <div className="p-3 bg-background/50 rounded-xl border border-border/40 flex-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground/70 mb-2 block tracking-widest">Заезд</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm"><DateInput value={form.checkin_at_date} onChange={(v) => setF("checkin_at_date", v)} /></div>
                    <div className="w-16"><Input type="time" value={form.checkin_at_time} onChange={(e) => setF("checkin_at_time", e.target.value)} className="h-8 rounded-lg text-xs font-bold p-1" /></div>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border/40 flex-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground/70 mb-2 block tracking-widest">Выезд</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm"><DateInput value={form.checkout_at_date} onChange={(v) => setF("checkout_at_date", v)} /></div>
                    <div className="w-16"><Input type="time" value={form.checkout_at_time} onChange={(e) => setF("checkout_at_time", e.target.value)} className="h-8 rounded-lg text-xs font-bold p-1" /></div>
                  </div>
                </div>
                {form.property !== "chunga_changa" && (
                  <div className="flex flex-col items-center justify-center h-[58px] bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[9px] font-black uppercase text-amber-700/70 block text-center mb-0.5">Ночей</span>
                    <span className="text-xl font-black text-amber-700 leading-none">{daysCalc}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ */}
            {form.property === "golubaya_bukhta" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Дополнительные услуги</span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={cn("p-4 rounded-2xl border transition-all", form.sauna_included ? "bg-teal-50/30 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900 shadow-sm" : "bg-muted/5 border-border/40 opacity-70")}>
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox id="sauna_inc" checked={form.sauna_included} onCheckedChange={(c) => setF("sauna_included", !!c)} className="h-5 w-5 data-[state=checked]:bg-teal-600 dark:data-[state=checked]:bg-teal-500 border-teal-600 dark:border-teal-500" />
                      <Label htmlFor="sauna_inc" className="font-black text-xs cursor-pointer uppercase text-teal-800 dark:text-teal-400">Русская баня</Label>
                    </div>
                    {form.sauna_included && (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
                        <div className="space-y-1 col-span-2">
                          <Label className="text-[9px] font-black uppercase text-teal-700/60 dark:text-teal-400/60">Дата услуги</Label>
                          <div className="h-9"><DateInput value={form.sauna_date} onChange={(v) => setF("sauna_date", v)} /></div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-teal-700/60 dark:text-teal-400/60">Время С</Label>
                          <Input type="time" value={form.sauna_time_from} onChange={(e) => setF("sauna_time_from", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-teal-700/60 dark:text-teal-400/60">Время ПО</Label>
                          <Input type="time" value={form.sauna_time_to} onChange={(e) => setF("sauna_time_to", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-teal-700/60 dark:text-teal-400/60">Стоимость (₽)</Label>
                          <Input type="number" value={form.sauna_price} onChange={(e) => setF("sauna_price", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" placeholder="0" min={0} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-teal-700/60 dark:text-teal-400/60">Гостей</Label>
                          <Input type="number" value={form.sauna_guests} onChange={(e) => setF("sauna_guests", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-teal-200 dark:border-teal-900 bg-background" placeholder="0" min={0} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={cn("p-4 rounded-2xl border transition-all", form.hot_tub_included ? "bg-sky-50/30 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 shadow-sm" : "bg-muted/5 border-border/40 opacity-70")}>
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox id="hot_tub_inc" checked={form.hot_tub_included} onCheckedChange={(c) => setF("hot_tub_included", !!c)} className="h-5 w-5 data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500 border-sky-600 dark:border-sky-500" />
                      <Label htmlFor="hot_tub_inc" className="font-black text-xs cursor-pointer uppercase text-sky-800 dark:text-sky-400">Фурако</Label>
                    </div>
                    {form.hot_tub_included && (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
                        <div className="space-y-1 col-span-2">
                          <Label className="text-[9px] font-black uppercase text-sky-700/60 dark:text-sky-400/60">Дата услуги</Label>
                          <div className="h-9"><DateInput value={form.hot_tub_date} onChange={(v) => setF("hot_tub_date", v)} /></div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-sky-700/60 dark:text-sky-400/60">Время С</Label>
                          <Input type="time" value={form.hot_tub_time_from} onChange={(e) => setF("hot_tub_time_from", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-sky-700/60 dark:text-sky-400/60">Время ПО</Label>
                          <Input type="time" value={form.hot_tub_time_to} onChange={(e) => setF("hot_tub_time_to", e.target.value)} className="h-9 text-xs font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-sky-700/60 dark:text-sky-400/60">Стоимость (₽)</Label>
                          <Input type="number" value={form.hot_tub_price} onChange={(e) => setF("hot_tub_price", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" placeholder="0" min={0} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-sky-700/60 dark:text-sky-400/60">Гостей</Label>
                          <Input type="number" value={form.hot_tub_guests} onChange={(e) => setF("hot_tub_guests", e.target.value)} className="h-9 text-sm font-bold rounded-lg border-sky-200 dark:border-sky-900 bg-background" placeholder="0" min={0} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <SectionHeader title="Финансы" />
            <div className="grid grid-cols-2 gap-6 items-start">
              <div className="flex gap-4 text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Label className="text-[11px]">Стоимость аренды (₽) *</Label>
                  <Input type="number" value={form.rent_price} onChange={e => setF("rent_price", e.target.value)} className="h-10 focus:ring-accent font-bold text-lg rounded-xl" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Label className="text-[11px]">Внесена предоплата (₽)</Label>
                  <Input type="number" value={form.prepayment} onChange={e => setF("prepayment", e.target.value)} className="h-10 focus:ring-accent font-bold text-lg rounded-xl" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground opacity-80 mb-1">Итоговая стоимость (₽)</span>
                  <span className="text-2xl font-black text-foreground">{totalRentSum.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="bg-amber-500 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase opacity-80 mb-1">Остаток к оплате</span>
                  <span className="text-3xl font-black">{totalToPay.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {!showExtraInfo ? (
                <Button variant="ghost" size="sm" onClick={() => setShowExtraInfo(true)} className="w-full justify-start text-[11px] text-muted-foreground gap-2">
                  <Plus className="h-3 w-3" /> Добавить комментарий
                </Button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between border-t pt-4">
                    <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-2 uppercase"><MessageSquare className="h-3 w-3" /> Комментарий</Label>
                    <Button variant="ghost" size="sm" onClick={() => setShowExtraInfo(false)} className="h-6 px-2 text-[10px]">Скрыть</Button>
                  </div>
                  <Textarea value={form.extra_info} onChange={(e) => setF("extra_info", e.target.value)} rows={3} className="rounded-xl bg-muted/20 resize-none" placeholder="Доп. информация..." />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t p-4 flex-row items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-xl"><FileDown className="h-4 w-4" /> Сформировать <ChevronDown className="h-3 w-3 opacity-50" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuItem>Договор</DropdownMenuItem><DropdownMenuItem>Счёт</DropdownMenuItem><DropdownMenuItem>Акт</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2 rounded-xl"><Mail className="h-4 w-4" /> Email</Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving} className="rounded-xl">Применить</Button>
              <Button onClick={() => handleSave(true)} disabled={saving} className="bg-amber-500 text-white hover:bg-amber-600 font-bold px-8 rounded-xl shadow-md">ОК</Button>
              <Button variant="ghost" onClick={onClose} className="rounded-xl">Закрыть</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ClientDrawer open={clientDrawerOpen} onClose={() => setClientDrawerOpen(false)} onSaved={fetchClients} />
    </>
  );
}
