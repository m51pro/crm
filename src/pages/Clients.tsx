import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search, User, Building2, Ban, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import ClientDrawer, { type ClientData } from "@/components/clients/ClientDrawer";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

type FilterType = "all" | "individual" | "legal_entity" | "blacklist";

export default function Clients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 100;

  const fetchClients = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/clients?page=${nextPage}&limit=${pageSize}`);
      const data = await res.json();
      const total = Number(res.headers.get("X-Total-Count") || data.length || 0);
      setClients(Array.isArray(data) ? data : data.data || []);
      setTotalCount(total);
      setPage(nextPage);
    } catch(e) { console.error(e); setClients([]); setTotalCount(0); }
    setLoading(false);
  };

  useEffect(() => { fetchClients(1); }, []);

  const filtered = useMemo(() => {
    let list = clients;
    if (filter === "individual") list = list.filter((c) => c.client_type === "individual");
    else if (filter === "legal_entity") list = list.filter((c) => c.client_type === "legal_entity");
    else if (filter === "blacklist") list = list.filter((c) => c.is_blacklisted);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const name = c.client_type === "individual"
          ? [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ")
          : c.org_name ?? "";
        const fields = [name, c.phone, c.email, c.inn, c.passport_series, c.passport_number].filter(Boolean).join(" ").toLowerCase();
        return fields.includes(q);
      });
    }
    return list;
  }, [clients, filter, search]);

  const getDisplayName = (c: ClientData) =>
    c.client_type === "individual"
      ? [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ") || "—"
      : c.org_name || "—";

  const getPassportOrInn = (c: ClientData) =>
    c.client_type === "individual"
      ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
      : c.inn || "—";

  const getAddress = (c: ClientData) =>
    c.client_type === "individual"
      ? c.registration_address || "—"
      : c.legal_address || "—";

  const openNew = () => { setSelectedClient(null); setDrawerMode("edit"); setDrawerOpen(true); };
  const openView = (c: ClientData) => { setSelectedClient(c); setDrawerMode("view"); setDrawerOpen(true); };
  const openEdit = (c: ClientData) => { setSelectedClient(c); setDrawerMode("edit"); setDrawerOpen(true); };

  const blacklistCount = useMemo(() => clients.filter((c) => c.is_blacklisted).length, [clients]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const filters: { key: FilterType; label: string; isRed?: boolean }[] = [
    { key: "all", label: "Все" },
    { key: "individual", label: "Физлица" },
    { key: "legal_entity", label: "Юрлица" },
    { key: "blacklist", label: `🚫 Чёрный список${blacklistCount > 0 ? ` (${blacklistCount})` : ""}`, isRed: true },
  ];

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">Клиенты</h2>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-6 h-11 font-semibold shadow-md shadow-accent/20">
          <Plus className="h-4 w-4 mr-2" /> Добавить клиента
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, email, паспорту..."
          className="pl-11 h-11 rounded-2xl focus-visible:ring-accent bg-secondary/50 border-0"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200",
              filter === f.key
                ? f.isRed
                  ? "bg-destructive text-destructive-foreground shadow-md"
                  : "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table or empty state */}
      {!loading && filtered.length === 0 ? (
        <Card className="p-6 flex flex-col items-center justify-center py-20 rounded-3xl">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">Клиентов пока нет.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Добавьте первого клиента для начала работы.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-3xl border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Тип</TableHead>
                <TableHead>ФИО / Название</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Паспорт / ИНН</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Дата добавления</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className={cn(
                    "cursor-pointer group transition-colors", 
                    c.is_blacklisted ? "bg-destructive/5 hover:bg-destructive/10 border-l-[3px] border-l-destructive/60" : "hover:bg-muted/50"
                  )}
                  onDoubleClick={() => openView(c)}
                >
                  <TableCell>
                    {c.client_type === "individual"
                      ? <User className="h-4 w-4 text-muted-foreground" />
                      : <Building2 className="h-4 w-4 text-muted-foreground" />
                    }
                  </TableCell>
                  <TableCell className="font-medium">{getDisplayName(c)}</TableCell>
                  <TableCell className="text-sm">{c.phone || c.contact_phone || "—"}</TableCell>
                  <TableCell className="text-sm">{c.email || c.contact_email || "—"}</TableCell>
                  <TableCell className="text-sm font-mono">{getPassportOrInn(c)}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate" title={getAddress(c)}>{getAddress(c)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.created_at ? format(new Date(c.created_at), "dd.MM.yyyy", { locale: ru }) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <div>Страница {page} из {totalPages}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchClients(Math.max(1, page - 1))} disabled={page <= 1 || loading}>Назад</Button>
          <Button variant="outline" size="sm" onClick={() => fetchClients(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading}>Вперёд</Button>
        </div>
      </div>

      <ClientDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} client={selectedClient} onSaved={() => fetchClients(page)} mode={drawerMode} />
    </div>
  );
}
