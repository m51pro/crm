import React from "react";
import { Search, Plus, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { DateInput } from "@/components/ui/DateInput";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { Client, Contract } from "@/types/crm";

interface MainSectionProps {
  form: Contract;
  setF: (k: string, v: string | number | boolean) => void;
  clientSearch: string;
  setClientSearch: (v: string) => void;
  clientSearchOpen: boolean;
  setClientSearchOpen: (v: boolean) => void;
  filteredClients: Client[];
  setClientDrawerOpen: (v: boolean) => void;
}

export function MainSection({
  form,
  setF,
  clientSearch,
  setClientSearch,
  clientSearchOpen,
  setClientSearchOpen,
  filteredClients,
  setClientDrawerOpen,
}: MainSectionProps) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Основное" />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 flex flex-col justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 border border-border/50 rounded-xl w-fit">
            <div className={cn(
              "w-2 h-2 rounded-full",
              form.property === "chunga_changa" 
                ? "bg-chunga shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                : "bg-bukhta shadow-[0_0_8px_rgba(14,165,233,0.4)]"
            )} />
            <span className="text-xs font-bold">
              {form.property === "chunga_changa" ? "Чунга-Чанга" : "Голубая Бухта"}
            </span>
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
                  setClientSearch(e.target.value); 
                  setClientSearchOpen(true);
                }}
                onFocus={() => setClientSearchOpen(true)}
                placeholder="Поиск по имени или телефону..."
                className="pr-10 h-11 bg-background focus-visible:ring-accent font-bold text-base rounded-lg"
              />
              <Search className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                clientSearchOpen ? "text-accent" : "text-muted-foreground"
              )} />
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
                      setF("client_id", c.id); 
                      setF("client_name", name || ""); 
                      setF("client_phone", (c.phone as string) || (c.contact_phone as string) || "");
                      setClientSearch(""); 
                      setClientSearchOpen(false);
                    }}>
                    <div className="flex items-center gap-2">
                      {c.client_type === "individual" ? <User className="h-4 w-4 text-muted-foreground" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium text-foreground">{name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs font-bold">{(c.phone as string) || (c.contact_phone as string)}</span>
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
  );
}
