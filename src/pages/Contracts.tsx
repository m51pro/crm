import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FileText, Plus, Search, Eye, Pencil, FileDown, X, AlertTriangle, CalendarIcon, Check, Clock } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ContractModal from "@/components/contracts/ContractModal";
import { NotifierAlert } from "@/components/contracts/NotifierAlert";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES, GB_BANYA_ITEMS } from "@/lib/chess-data";
import { API_URL } from "@/lib/api";

type ContractStatus = "pre_booking" | "not_paid" | "partial_paid" | "paid" | "cancelled";
type FilterStatus = "all" | ContractStatus;
type PropertyFilter = "all" | "chunga_changa" | "golubaya_bukhta";

export interface Contract {
  id: string;
  contract_number: string;
  contract_date: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  property: string;
  cottage_id: string;
  bath_included: boolean;
  bath_date: string;
  bath_time_from: string;
  bath_time_to: string;
  checkin_at?: string;
  checkout_at?: string;
  check_in_date?: string;
  check_in_hour?: number;
  check_out_date?: string;
  check_out_hour?: number;
  guest_count: number;
  rent_price: number;
  prepayment: number;
  payment_date: string;
  payment_amount: number;
  extra_info: string;
  notes?: string;
  status: ContractStatus;
  created_at: string;
  total_amount?: number;
  prepayment_amount?: number;
  total?: number;
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.preselectClient) {
      const c = location.state.preselectClient;
      setSelectedContract({
        id: "",
        client_id: c.id,
        client_name: c.client_type === "individual" ? [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ") : c.org_name,
        client_phone: c.phone || c.contact_phone || "",
        status: "not_paid",
        property: "chunga_changa"
      } as unknown as Contract);
      setModalOpen(true);
      // Clear state so it doesn't trigger on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contracts`);
      const data = await res.json();
      setContracts(data);
    } catch(e) { console.error(e); setContracts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, []);

  const getComputedStatus = useCallback((c: Contract): ContractStatus => {
    if (c.status === "cancelled") return "cancelled";
    const rentVal = c.rent_price !== undefined && c.rent_price !== null ? c.rent_price : (c.total_amount || 0);
    const rent = typeof rentVal === 'number' ? rentVal : parseFloat(String(rentVal || 0));
    const prepayVal = c.prepayment || 0;
    const prepay = typeof prepayVal === 'number' ? prepayVal : parseFloat(String(prepayVal || 0));
    if (c.status === "pre_booking" && prepay === 0 && rent === 0) return "pre_booking";
    if (prepay === 0) return "not_paid"; 
    const remains = Math.max(0, rent - prepay);
    if (remains === 0) return "paid"; 
    if (remains > 0 && remains < rent) return "partial_paid";
    return "not_paid";
  }, []);

  const formatAmount = useCallback((v: number | string | null | undefined) => {
    if (!v && v !== 0) return "—";
    return Number(v).toLocaleString("ru-RU") + " ₽";
  }, []);

  const filtered = useMemo(() => {
    let list = [...contracts];
    if (statusFilter !== "all") {
      list = list.filter(c => getComputedStatus(c) === statusFilter);
    }
    if (propertyFilter !== "all") list = list.filter(c => c.property === propertyFilter);
    if (dateFrom) list = list.filter(c => c.check_in_date && new Date(c.check_in_date) >= dateFrom);
    if (dateTo) list = list.filter(c => c.check_in_date && new Date(c.check_in_date) <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => {
        const fields = [c.contract_number, c.client_name, c.client_phone].filter(Boolean).join(" ").toLowerCase();
        return fields.includes(q);
      });
    }
    return list;
  }, [contracts, statusFilter, propertyFilter, dateFrom, dateTo, search, getComputedStatus]);

  const openNew = () => { setSelectedContract(null); setModalOpen(true); };
  const openEdit = (c: Contract) => { setSelectedContract(c); setModalOpen(true); };

  const handleCancel = async (id: string) => {
    const target = contracts.find(c => c.id === id);
    if (!target) return;
    try {
      await fetch(`${API_URL}/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, status: "cancelled", updated_at: new Date().toISOString() })
      });
      fetchContracts();
    } catch(e) { console.error(e); }
  };

  const statusFilters: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "not_paid", label: "Не оплачен" },
    { key: "partial_paid", label: "Частичная предоплата" },
    { key: "paid", label: "Оплачен" },
    { key: "cancelled", label: "Аннулирован" },
  ];

  const propertyFilters: { key: PropertyFilter; label: string; colorClass: string }[] = [
    { key: "all", label: "Все базы", colorClass: "bg-accent text-accent-foreground" },
    { key: "chunga_changa", label: "🟠 Чунга-Чанга", colorClass: "bg-chunga text-chunga-foreground shadow-md shadow-chunga/20" },
    { key: "golubaya_bukhta", label: "🔵 Голубая Бухта", colorClass: "bg-bukhta text-bukhta-foreground shadow-md shadow-bukhta/20" },
  ];

  // removed from here (already moved up)

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case "pre_booking":
        return <Badge variant="outline" className="border-dashed border-sky-400 text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400 text-xs rounded-xl shadow-sm">Предбронь</Badge>;
      case "not_paid":
        return <Badge className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-none shadow-sm text-xs rounded-xl font-bold">Не оплачен</Badge>;
      case "partial_paid":
        return <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100 text-xs rounded-xl shadow-sm font-bold">Частичная предоплата</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs rounded-xl shadow-md font-bold px-3 py-0.5"><Check className="h-3 w-3 mr-1" />Оплачен</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="text-muted-foreground text-[10px] rounded-xl opacity-50">Аннулирован</Badge>;
      default:
        return <Badge variant="outline" className="text-xs rounded-xl">{status}</Badge>;
    }
  };

  const getPropertyLabel = (p: string) =>
    p === "chunga_changa" ? "Чунга-Чанга" : p === "golubaya_bukhta" ? "Голубая Бухта" : p;

  const getPropertyBadge = (p: string) => {
    if (p === "chunga_changa") return <Badge className="bg-chunga/10 text-chunga border-chunga/20 text-xs rounded-xl font-bold px-3">Чунга-Чанга</Badge>;
    if (p === "golubaya_bukhta") return <Badge className="bg-bukhta/10 text-bukhta border-bukhta/20 text-xs rounded-xl font-bold px-3">Голубая Бухта</Badge>;
    return <span className="text-sm">{p}</span>;
  };

  // status computing removed from here (moved up)

  // formatAmount removed from here (moved up)

  const getCottageName = (id: string) => {
    const all = [...CHUNGA_CHANGA_COTTAGES, ...GB_COTTAGES, ...GB_BANYA_ITEMS];
    return all.find(c => c.id === id)?.name || id;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">Договоры</h2>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-6 h-11 font-semibold shadow-md shadow-accent/20">
          <Plus className="h-4 w-4 mr-2" /> Новый договор
        </Button>
      </div>

      <NotifierAlert />

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по ФИО, телефону, номеру договора..."
          className="pl-11 h-11 rounded-2xl focus-visible:ring-accent bg-secondary/50 border-0"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200",
              statusFilter === f.key
                ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {propertyFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setPropertyFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200",
              propertyFilter === f.key
                ? f.colorClass
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Период заселения:</span>
        <DatePickerField label="с" value={dateFrom} onChange={setDateFrom} />
        <DatePickerField label="по" value={dateTo} onChange={setDateTo} />
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground rounded-xl" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
            <X className="h-3 w-3 mr-1" /> Сбросить
          </Button>
        )}
      </div>

      {/* Table or empty state */}
      {!loading && filtered.length === 0 ? (
        <Card className="p-6 flex flex-col items-center justify-center py-20 rounded-3xl">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">Договоров пока нет.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Создайте первый договор.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-3xl border-border/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ договора</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>База</TableHead>
                  <TableHead>Коттедж</TableHead>
                  <TableHead>Заезд</TableHead>
                  <TableHead>Выезд</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-right">Предоплата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-28">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const cancelled = c.status === "cancelled";
                  return (
                    <TableRow
                      key={c.id}
                      className={cn(
                        "cursor-pointer group",
                        cancelled && "opacity-60"
                      )}
                      onDoubleClick={() => openEdit(c)}
                    >
                      <TableCell className={cn("font-mono text-sm", cancelled && "line-through")}>
                        {c.contract_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(c.contract_date), "dd.MM.yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className={cn(cancelled && "line-through")}>
                          <div className="font-medium text-sm">{c.client_name}</div>
                          {c.client_phone && <div className="text-xs text-muted-foreground">{c.client_phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getPropertyBadge(c.property)}</TableCell>
                      <TableCell className="text-sm font-bold text-accent">{getCottageName(c.cottage_id)}</TableCell>
                      <TableCell className="text-sm">
                        {c.checkin_at ? format(new Date(c.checkin_at), "dd.MM.yy HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.checkout_at ? format(new Date(c.checkout_at), "dd.MM.yy HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold text-foreground">
                        {formatAmount(c.rent_price !== undefined ? c.rent_price : (c.total_amount || c.total))}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground font-medium">
                        {formatAmount(c.prepayment)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(getComputedStatus(c))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(c)} title="Просмотр">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(c)} title="Редактировать">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" title="Сгенерировать документ">
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                          {c.status !== "cancelled" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:text-destructive" onClick={() => handleCancel(c.id)} title="Аннулировать">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ContractModal open={modalOpen} onClose={() => setModalOpen(false)} contract={selectedContract} onSaved={fetchContracts} />
    </div>
  );
}

function DatePickerField({ label, value, onChange }: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 text-xs gap-1.5 font-normal rounded-xl", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {value ? format(value, "dd.MM.yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          className="p-3 pointer-events-auto"
          locale={ru}
        />
      </PopoverContent>
    </Popover>
  );
}
