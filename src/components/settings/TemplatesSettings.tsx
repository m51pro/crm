import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Pencil, ArrowLeft, CheckCircle2, FileCode2, Sparkles, Layers, Hash } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";

const TEMPLATES = [
  { id: "contract_chunga", name: "Договор аренды", subtype: "Чунга-Чанга", lastModified: "01.04.2026", type: "contract", icon: FileText, color: "bg-chunga", dot: "bg-chunga" },
  { id: "contract_gb", name: "Договор аренды", subtype: "Голубая Бухта", lastModified: "28.03.2026", type: "contract", icon: FileText, color: "bg-bukhta", dot: "bg-bukhta" },
  { id: "invoice", name: "Счёт на оплату", subtype: "Универсальный", lastModified: "15.02.2026", type: "finance", icon: Layers, color: "bg-emerald-500", dot: "bg-emerald-500" },
  { id: "act", name: "Акт выполненных работ", subtype: "Универсальный", lastModified: "10.03.2026", type: "finance", icon: FileCode2, color: "bg-indigo-500", dot: "bg-indigo-500" },
];

const VARIABLES = [
  { category: "Клиент", vars: ["{{client.full_name}}", "{{client.phone}}", "{{client.inn}}", "{{client.passport}}"] },
  { category: "Договор", vars: ["{{contract.number}}", "{{contract.date}}", "{{contract.checkin}}", "{{contract.checkout}}", "{{contract.days}}"] },
  { category: "Объект", vars: ["{{property.name}}", "{{cottage.name}}", "{{cottage.capacity}}"] },
  { category: "Финансы", vars: ["{{contract.rent_price}}", "{{contract.prepayment}}", "{{contract.total_due}}"] },
  { category: "Предприятие", vars: ["{{company.name}}", "{{company.director}}", "{{company.inn}}", "{{company.bank}}"] },
];

const DEFAULT_TEXTS: Record<string, string> = {
  contract_chunga: "ДОГОВОР АРЕНДЫ № {{contract.number}}\nот {{contract.date}}\n\n{{company.name}} в лице директора {{company.director}}, именуемый «Арендодатель», и {{client.full_name}}, паспорт {{client.passport}}, именуемый «Арендатор», заключили настоящий договор:\n\n1. ПРЕДМЕТ ДОГОВОРА\nАрендодатель передает Арендатору коттедж {{cottage.name}} (база {{property.name}}) с {{contract.checkin}} по {{contract.checkout}} ({{contract.days}} ночей).\nВместимость: {{cottage.capacity}} чел.\n\n2. ОПЛАТА\nСтоимость: {{contract.rent_price}} руб.\nПредоплата: {{contract.prepayment}} руб.\nК доплате: {{contract.total_due}} руб.",
};

export default function TemplatesSettings() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [numSettings, setNumSettings] = useState({ prefix: "ДГ", startNum: "221" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (editingId) setContent(DEFAULT_TEXTS[editingId] || "Текст шаблона пуст. Выберите переменные справа.");
  }, [editingId]);

  const insertVariable = (varString: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = content.substring(0, start) + varString + content.substring(end);
    setContent(newText);
    setTimeout(() => { textareaRef.current!.focus(); textareaRef.current!.setSelectionRange(start + varString.length, start + varString.length); }, 0);
  };

  const renderPreview = (text: string) => {
    return text.split('\n').map((line, i) => <p key={i} className="min-h-[1.5em]">{
      line.split(/(\{\{[^}]+\}\})/g).map((part, j) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          let mockValue = "[?]";
          if (part.includes("client.full_name")) mockValue = "Иванов И. И.";
          if (part.includes("contract.number")) mockValue = "2026-001";
          if (part.includes("cottage.name")) mockValue = "«Фамильный»";
          if (part.includes("contract.total_due")) mockValue = "15 000";
          if (part.includes("company.name")) mockValue = "ООО Чунга-Чанга";
          return <span key={j} className="bg-accent/10 border border-accent/20 text-accent px-[3px] rounded-md font-semibold">{mockValue}</span>;
        }
        return part;
      })
    }</p>);
  };

  if (editingId) {
    const template = TEMPLATES.find(t => t.id === editingId);
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] fixed inset-3 bg-card z-50 rounded-3xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-muted rounded-2xl" onClick={() => setEditingId(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Badge variant="secondary" className="rounded-xl text-[10px] mb-1">{template?.type === 'contract' ? 'Договор' : 'Финансы'} — {template?.subtype}</Badge>
              <h2 className="font-heading text-xl font-black">{template?.name}</h2>
            </div>
          </div>
          <Button onClick={() => { toast.success("Шаблон сохранен"); setEditingId(null); }} className="h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20 font-bold">
            <CheckCircle2 className="h-5 w-5 mr-2" /> Сохранить
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[55%] border-r border-border flex flex-col relative">
            <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)}
              className="absolute inset-0 w-full h-full p-8 resize-none outline-none font-mono text-sm leading-relaxed bg-transparent custom-scrollbar caret-accent" spellCheck={false} />
          </div>
          <div className="w-[45%] flex flex-col">
            <div className="flex-[0.35] min-h-[250px] flex flex-col border-b border-border">
              <div className="px-6 py-4 border-b border-border shrink-0"><h3 className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Переменные</h3></div>
              <ScrollArea className="flex-1 custom-scrollbar">
                <div className="p-6 space-y-6">
                  {VARIABLES.map(cat => (
                    <div key={cat.category} className="space-y-3">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{cat.category}</div>
                      <div className="flex flex-wrap gap-2">
                        {cat.vars.map(v => (
                          <button key={v} onClick={() => insertVariable(v)}
                            className="bg-muted border border-border hover:border-accent hover:bg-accent/10 hover:text-accent px-2.5 py-1.5 rounded-xl text-[12px] font-mono font-medium text-muted-foreground transition-all">{v}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex-[0.65] flex flex-col">
              <div className="px-6 py-4 shrink-0 flex items-center justify-between">
                <span className="font-bold text-[13px] uppercase tracking-wider">Превью</span>
                <span className="flex h-2 w-2 relative"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-emerald-500"></span></span>
              </div>
              <ScrollArea className="flex-1 px-8 pb-8 custom-scrollbar">
                <div className="bg-white border rounded-2xl shadow-sm p-8 min-h-[400px] text-[13px] leading-relaxed text-slate-900 font-serif">
                  {content ? renderPreview(content) : <span className="text-muted-foreground italic">Начните печатать...</span>}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-xl font-heading font-bold">Печатные формы</h3>
        <p className="text-muted-foreground mt-1 max-w-2xl">Настройте шаблоны документов для автозаполнения из CRM.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="group relative bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity", t.color)} />
              <div className="flex items-start gap-5">
                <div className="mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-muted group-hover:scale-110 transition-transform duration-300 border border-border/50">
                  <Icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><span className={cn("w-2 h-2 rounded-full", t.dot)} /><span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.subtype}</span></div>
                  <h4 className="text-lg font-bold mb-1">{t.name}</h4>
                  <p className="text-[13px] text-muted-foreground font-medium mb-6">Изменён: {t.lastModified}</p>
                  <Button onClick={() => setEditingId(t.id)} variant="outline" className="w-full justify-between rounded-2xl hover:border-accent hover:text-accent h-11 font-semibold">
                    <span>Редактировать шаблон</span><Pencil className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 h-px bg-border/50" />

      <div className="mt-12">
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
