import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FileText, Plus, Search, Eye, Pencil, FileDown, X, AlertTriangle, CalendarIcon, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInHours } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ContractModal from "@/components/contracts/ContractModal";

type ContractStatus = "pre_booking" | "signed" | "paid" | "cancelled";
type FilterStatus = "all" | ContractStatus;
type PropertyFilter = "all" | "chunga_changa" | "golubaya_bukhta";

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const fetchContracts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    setContracts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, []);

  // Count overdue signed contracts (>24h not paid)
  const overdueContracts = useMemo(() =>
    contracts.filter(c =>
      c.status === "signed" &&
      differenceInHours(new Date(), new Date(c.created_at)) > 24
    ), [contracts]);

  const filtered = useMemo(() => {
    let list = contracts;

    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);

    if (propertyFilter !== "all") list = list.filter(c => c.property === propertyFilter);

    if (dateFrom) {
      list = list.filter(c => c.check_in_date && new Date(c.check_in_date) >= dateFrom);
    }
    if (dateTo) {
      list = list.filter(c => c.check_in_date && new Date(c.check_in_date) <= dateTo);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => {
        const fields = [c.contract_number, c.client_name, c.client_phone].filter(Boolean).join(" ").toLowerCase();
        return fields.includes(q);
      });
    }
    return list;
  }, [contracts, statusFilter, propertyFilter, dateFrom, dateTo, search]);

  const openNew = () => { setSelectedContract(null); setModalOpen(true); };
  const openEdit = (c: any) => { setSelectedContract(c); setModalOpen(true); };

  const handleCancel = async (id: string) => {
    await supabase.from("contracts").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id);
    fetchContracts();
  };

  const statusFilters: { key: FilterStatus; label: string; color?: string }[] = [
    { key: "all", label: "Все" },
    { key: "pre_booking", label: "Предбронь", color: "blue" },
    { key: "signed", label: "Заключён", color: "amber" },
    { key: "paid", label: "Оплачен", color: "green" },
    { key: "cancelled", label: "Аннулирован", color: "gray" },
  ];

  const propertyFilters: { key: PropertyFilter; label: string }[] = [
    { key: "all", label: "Все базы" },
    { key: "chunga_changa", label: "Чунга-Чанга" },
    { key: "golubaya_bukhta", label: "Голубая Бухта" },
  ];

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case "pre_booking":
        return <Badge variant="outline" className="border-dashed border-blue-400 text-blue-600 bg-blue-50 text-xs">Предбронь</Badge>;
      case "signed":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Заключён</Badge>;
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs"><Check className="h-3 w-3 mr-1" />Оплачен</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="text-muted-foreground text-xs">Аннулирован</Badge>;
    }
  };

  const getPropertyLabel = (p: string) =>
    p === "chunga_changa" ? "Чунга-Чанга" : p === "golubaya_bukhta" ? "Голубая Бухта" : p;

  const isOverdue = (c: any) =>
    c.status === "signed" && differenceInHours(new Date(), new Date(c.created_at)) > 24;

  const formatAmount = (v: any) => {
    if (!v && v !== 0) return "—";
    return Number(v).toLocaleString("ru-RU") + " ₽";
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-semibold">Договоры</h2>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" /> Новый договор
        </Button>
      </div>

      {/* Overdue notification banner */}
      {overdueContracts.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
            <AlertTriangle className="h-4 w-4" />
            ⚠️ У вас {overdueContracts.length} {overdueContracts.length === 1 ? "договор ожидает" : overdueContracts.length < 5 ? "договора ожидают" : "договоров ожидают"} оплаты более 24 часов
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => setStatusFilter("signed")}
          >
            Посмотреть
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по ФИО, телефону, номеру договора..."
          className="pl-10 focus-visible:ring-accent"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Status chips */}
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              statusFilter === f.key
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Property chips */}
        {propertyFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setPropertyFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              propertyFilter === f.key
                ? "bg-accent text-accent-foreground shadow-sm"
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
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
            <X className="h-3 w-3 mr-1" /> Сбросить
          </Button>
        )}
      </div>

      {/* Table or empty state */}
      {!loading && filtered.length === 0 ? (
        <Card className="p-6 flex flex-col items-center justify-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">Договоров пока нет.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Создайте первый договор.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
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
                  const overdue = isOverdue(c);
                  const cancelled = c.status === "cancelled";
                  return (
                    <TableRow
                      key={c.id}
                      className={cn(
                        "cursor-pointer group",
                        overdue && "border-l-2 border-l-destructive",
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
                      <TableCell className="text-sm">{getPropertyLabel(c.property)}</TableCell>
                      <TableCell className="text-sm">{c.cottage_id}</TableCell>
                      <TableCell className="text-sm">
                        {c.check_in_date ? format(new Date(c.check_in_date), "dd.MM.yy") : "—"}
                        {c.check_in_hour != null && ` ${c.check_in_hour}:00`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.check_out_date ? format(new Date(c.check_out_date), "dd.MM.yy") : "—"}
                        {c.check_out_hour != null && ` ${c.check_out_hour}:00`}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatAmount(c.total_amount)}</TableCell>
                      <TableCell className="text-right text-sm">{formatAmount(c.prepayment_amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(c.status)}
                          {overdue && <Clock className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)} title="Просмотр">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)} title="Редактировать">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Сгенерировать документ">
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                          {c.status !== "cancelled" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleCancel(c.id)} title="Аннулировать">
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
        <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5 font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {value ? format(value, "dd.MM.yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
