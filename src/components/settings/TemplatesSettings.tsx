import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, Plus, FileText, Clock, Hash } from "lucide-react";
import { TemplateBuilder } from "@/components/contracts/TemplateBuilder";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiFetch, API_URL } from "@/lib/api";
import { toast } from "sonner";

interface TemplateInfo {
  id: string;
  title: string;
  updated_at: string;
  target_property: string;
  client_type: string;
}

export default function TemplatesSettings() {
  // --- Состояния для управления шаблонами ---
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // --- Состояния для нумерации договоров ---
  const [numSettings, setNumSettings] = useState({ prefix: "ДГ", startNum: "221" });

  // Загрузка динамических шаблонов
  const fetchTemplates = () => {
    setIsLoading(true);
    apiFetch("/templates")
      .then(res => res.json())
      .then(data => {
        if (data.success) setTemplates(data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // Загрузка настроек нумерации
  useEffect(() => {
    fetch(`${API_URL}/settings`).then(r => r.json()).then(data => {
      if (data.contract_prefix || data.contract_start_num) {
        setNumSettings({
          prefix: data.contract_prefix || "ДГ",
          startNum: data.contract_start_num || "221"
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!isBuilderMode) {
      fetchTemplates();
    }
  }, [isBuilderMode]);

  const saveNumSettings = async () => {
    try {
      await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_prefix: numSettings.prefix,
          contract_start_num: numSettings.startNum
        })
      });
      toast.success("Настройки нумерации сохранены");
    } catch (e) { toast.error("Ошибка сохранения"); }
  };

  // Если включен режим редактора, показываем только его
  if (isBuilderMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
         <TemplateBuilder onBack={() => setIsBuilderMode(false)} templateId={editingTemplateId} />
      </div>
    );
  }

  const filteredTemplates = templates.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
      
      {/* 1. Блок динамических шаблонов */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-heading font-bold">Печатные формы</h3>
            <p className="text-muted-foreground mt-1 max-w-2xl">Создавайте и настраивайте шаблоны документов для автозаполнения.</p>
          </div>
          <Button onClick={() => { setEditingTemplateId(null); setIsBuilderMode(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-6 h-11 font-semibold shadow-md shadow-accent/20">
            <Plus className="h-4 w-4 mr-2" /> Создать шаблон
          </Button>
        </div>

        <div className="relative w-full max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по шаблонам..."
            className="pl-9 h-11 rounded-xl bg-background border-border/50"
          />
        </div>

        {isLoading ? (
           <div className="flex items-center justify-center py-12 text-muted-foreground">Загрузка...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-60 bg-muted/20 border border-border/50 rounded-2xl">
            <FileText className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Шаблоны не найдены</p>
            <p className="text-sm mt-1">Добавьте первый шаблон договоров, счетов или актов.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
            {filteredTemplates.map(t => (
              <Card 
                key={t.id} 
                className="rounded-2xl p-5 border border-border/40 hover:border-accent/50 hover:bg-card/80 cursor-pointer transition-all shadow-sm group"
                onClick={() => { setEditingTemplateId(t.id); setIsBuilderMode(true); }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate" title={t.title || "Без названия"}>
                      {t.title || "Без названия"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground opacity-80">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Обновлено: {format(new Date(t.updated_at), 'dd MMM yyyy', { locale: ru })}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {t.target_property === 'all' ? 'Везде' : t.target_property}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border/50" />

      {/* 2. Блок настроек нумерации */}
      <div>
        <div className="mb-8">
          <h3 className="text-xl font-heading font-bold flex items-center gap-2">
            <Hash className="h-5 w-5 text-accent" /> Нумерация договоров
          </h3>
          <p className="text-muted-foreground mt-1 max-w-2xl">Настройте формат автоматического номера для новых договоров.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-2xl">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <Label className="text-muted-foreground ml-1">Префикс (2 буквы)</Label>
              <Input 
                value={numSettings.prefix} 
                onChange={e => setNumSettings(p => ({ ...p, prefix: e.target.value.toUpperCase().slice(0, 2) }))}
                className="h-12 rounded-2xl bg-muted/20 font-bold text-lg"
                placeholder="ДГ"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground ml-1">Начать отсчёт с числа</Label>
              <Input 
                type="number"
                value={numSettings.startNum} 
                onChange={e => setNumSettings(p => ({ ...p, startNum: e.target.value }))}
                className="h-12 rounded-2xl bg-muted/20 font-bold text-lg"
                placeholder="221"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/10 rounded-2xl mb-8">
            <div className="text-sm font-medium text-muted-foreground">Пример следующего номера:</div>
            <div className="text-xl font-black text-accent">{numSettings.prefix}{numSettings.startNum}</div>
          </div>

          <Button onClick={saveNumSettings} className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-black shadow-lg shadow-accent/20">
            Сохранить настройки нумерации
          </Button>
        </div>
      </div>
      
    </div>
  );
}
