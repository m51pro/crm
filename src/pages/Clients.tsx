import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search, User, Building2, Ban, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import ClientDrawer, { type ClientData } from "@/components/clients/ClientDrawer";

type FilterType = "all" | "individual" | "legal_entity" | "blacklist";

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

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

  const getDisplayName = (c: any) =>
    c.client_type === "individual"
      ? [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ") || "—"
      : c.org_name || "—";

  const getPassportOrInn = (c: any) =>
    c.client_type === "individual"
      ? [c.passport_series, c.passport_number].filter(Boolean).join(" ") || "—"
      : c.inn || "—";

  const openNew = () => { setSelectedClient(null); setDrawerOpen(true); };
  const openEdit = (c: any) => { setSelectedClient(c as ClientData); setDrawerOpen(true); };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "individual", label: "Физлица" },
    { key: "legal_entity", label: "Юрлица" },
    { key: "blacklist", label: "Чёрный список 🚫" },
  ];

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-semibold">Клиенты</h2>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" /> Добавить клиента
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, email, паспорту..."
          className="pl-10 focus-visible:ring-accent"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table or empty state */}
      {!loading && filtered.length === 0 ? (
        <Card className="p-6 flex flex-col items-center justify-center py-20">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">Клиентов пока нет.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Добавьте первого клиента для начала работы.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Тип</TableHead>
                <TableHead>ФИО / Название</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Паспорт / ИНН</TableHead>
                <TableHead>Дата добавления</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-16">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer group ${c.is_blacklisted ? "border-l-2 border-l-destructive" : ""}`}
                  onDoubleClick={() => openEdit(c)}
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
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(c.created_at), "dd.MM.yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {c.is_blacklisted ? (
                      <Badge variant="destructive" className="text-xs"><Ban className="h-3 w-3 mr-1" />ЧС</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Активен</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ClientDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} client={selectedClient} onSaved={fetchClients} />
    </div>
  );
}
