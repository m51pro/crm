import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus, FileText, Clock, Trash2 } from "lucide-react";
import { TemplateBuilder } from "@/components/contracts/TemplateBuilder";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiFetch, API_URL } from "@/lib/api";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isBuilderMode) {
      fetchTemplates();
    }
  }, [isBuilderMode]);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Шаблон удален");
        fetchTemplates();
      } else {
        toast.error("Ошибка удаления: " + data.error);
      }
    } catch (e) {
      toast.error("Ошибка сети");
    } finally {
      setDeleteId(null);
    }
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
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm truncate pr-2" title={t.title || "Без названия"}>
                        {t.title || "Без названия"}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Это действие необратимо. Шаблон будет полностью удален из базы данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl border-border hover:bg-muted transition-colors">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="rounded-2xl bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}
