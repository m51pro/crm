import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Editor } from '@tiptap/react';
import Handlebars from 'handlebars';
import { incline } from "lvovich";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import * as mammoth from "mammoth";

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Search, 
  User, 
  Building2, 
  FileCheck, 
  Sparkles, 
  Home, 
  Upload, 
  Eye, 
  FileText,
  Save,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { TiptapEditor } from "./TiptapEditor";
import { API_URL } from '@/lib/api';

interface TemplateBuilderProps {
  onBack: () => void;
  templateId?: string | null;
}

const DEFAULT_CONTENT = `<h2 style="text-align: center">ДОГОВОР АРЕНДЫ № {{doc_number}}</h2>\n<p style="text-align: center">от {{doc_date}}</p>\n<p><strong>ООО Чунга-Чанга</strong> в лице Директора, именуемый «Арендодатель», и <strong>{{client_name}}</strong>, паспорт {{client_passport}}, именуемый «Арендатор», заключили настоящий договор:</p>\n<p><strong>1. ПРЕДМЕТ ДОГОВОРА</strong></p>\n<p>Арендодатель передает Арендатору коттедж <strong>{{cottage_name}}</strong> (база {{property_name}}) с {{deal_start}} по {{deal_end}}.</p>\n<p><strong>2. ОПЛАТА</strong></p>\n<ul>\n<li>Стоимость: {{doc_amount}} руб.</li>\n<li>Предоплата: <span style="background-color: #fef08a"><strong>{{doc_prepayment}}</strong></span> руб.</li>\n</ul>`;

// Mock data to feed into Handlebars for live preview
const MOCK_DATA = {
  doc_number: "2026/04-01",
  doc_date: "1 апреля 2026 г.",
  doc_amount: "45 000",
  doc_amount_words: "Сорок пять тысяч рублей 00 копеек",
  vat_amount: "7 500",
  vat_amount_words: "Семь тысяч пятьсот рублей 00 копеек",
  doc_prepayment: "15 000",
  deal_start: "10.05.2026",
  deal_end: "12.05.2026",
  guest_count: "10",
  parent_invoice_number: "СЧ-991",

  client_name: "Иванов Иван Иванович",
  client_phone: "+7 (999) 123-45-67",
  client_inn: "770123456789",
  client_kpp: "770101001",
  client_ogrn: "1027700132195",
  client_address: "г. Москва, ул. Пушкина, д. 10, кв. 45",
  client_bank: "ПАО СБЕРБАНК",
  client_bik: "044525225",
  client_account: "40817810000001234567",
  client_corr: "30101810400000000225",
  client_passport: "45 10 123456, выдан ОВД г. Москвы",
  client_signatory: "Иванов И.И.",
  client_basis: "Устава",

  my_short_name: "Чунга-Чанга",
  my_name: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ЧУНГА-ЧАНГА"',
  my_inn: "2315214040",
  my_kpp: "231501001",
  my_ogrn: "1192375052327",
  my_address: "Краснодарский край, г. Новороссийск, ул. Советов, д. 1",
  my_postal: "353900, г. Новороссийск, ул. Советов, д. 1",
  my_phone: "+7 (861) 712-34-56",
  my_signatory_role: "Директор",
  my_city: "Геленджик",

  property_name: "Голубая Бухта",
  cottage_name: "Фрегат",
  cottage_capacity: "15",
  sauna_included: true,
  sauna_price: "3000",
  sauna_time: "18:00 - 21:00",
  hot_tub_included: false,
};

const PRESETS = {
  act: {
    title: "Акт об оказании услуг",
    html: `
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 5px;">Акт № {{doc_number}} от {{doc_date}}</h1>
      <hr style="border: 0; border-top: 1px solid #000; margin-bottom: 20px;" />
      
      <p style="margin-bottom: 10px;"><strong>Исполнитель:</strong> {{my_name}}</p>
      <p style="margin-bottom: 20px;"><strong>Заказчик:</strong> {{client_name}}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;" border="1">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: center; width: 40px;">№</th>
            <th style="padding: 8px; text-align: left;">Наименование работ, услуг</th>
            <th style="padding: 8px; text-align: center; width: 60px;">Кол-во</th>
            <th style="padding: 8px; text-align: center; width: 60px;">Ед.</th>
            <th style="padding: 8px; text-align: right; width: 100px;">Цена</th>
            <th style="padding: 8px; text-align: right; width: 100px;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; text-align: center;">1</td>
            <td style="padding: 8px;">Услуги по временному размещению в коттедже {{cottage_name}} с {{deal_start}} по {{deal_end}}</td>
            <td style="padding: 8px; text-align: center;">1</td>
            <td style="padding: 8px; text-align: center;">усл</td>
            <td style="padding: 8px; text-align: right;">{{doc_amount}}</td>
            <td style="padding: 8px; text-align: right;">{{doc_amount}}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Итого:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>{{doc_amount}}</strong></td>
          </tr>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Без налога (НДС):</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>-</strong></td>
          </tr>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Всего к оплате:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>{{doc_amount}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p style="margin-bottom: 10px;">Всего наименований 1, на сумму {{doc_amount}} руб.</p>
      <p style="margin-bottom: 30px;"><strong>{{doc_amount_words}}</strong></p>
      
      <p style="margin-bottom: 40px; font-size: 12px;">Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <p><strong>ИСПОЛНИТЕЛЬ</strong></p>
            <p style="margin-top: 10px; font-size: 12px;">{{my_signatory_role}} {{my_name}}</p>
            <div style="margin-top: 40px;">
              <span>/ {{my_signatory_role}} /</span>
              <span style="margin-left: 20px;">________________</span>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top;">
            <p><strong>ЗАКАЗЧИК</strong></p>
            <p style="margin-top: 10px; font-size: 12px;">{{client_name}}</p>
            <div style="margin-top: 40px;">
              <span>________________</span>
              <span style="margin-left: 20px;">/ {{client_name}} /</span>
            </div>
          </td>
        </tr>
      </table>
    `
  }
};

Handlebars.registerHelper('incline', function(fio, targetCase) {
  try {
    const res = incline(fio, targetCase);
    return res || fio;
  } catch(e) { return fio; }
});

const VARIABLE_GROUPS = [
  {
    id: "client",
    label: "КОНТРАГЕНТ",
    icon: <User className="h-4 w-4 text-blue-500" />,
    variables: [
      { id: 'client_name', label: 'ФИО / Название' },
      { id: 'client_phone', label: 'Телефон' },
      { id: 'client_inn', label: 'ИНН' },
      { id: 'client_kpp', label: 'КПП' },
      { id: 'client_ogrn', label: 'ОГРН' },
      { id: 'client_address', label: 'Адрес регистрации' },
      { id: 'client_bank', label: 'Наименование банка' },
      { id: 'client_bik', label: 'БИК банка' },
      { id: 'client_account', label: 'Расчетный счет' },
      { id: 'client_corr', label: 'Корр. счет' },
      { id: 'client_passport', label: 'Паспортные данные' },
      { id: 'client_signatory', label: 'ФИО Подписанта' },
      { id: 'client_basis', label: 'Действует на основании' },
    ]
  },
  {
    id: "deal",
    label: "ДОКУМЕНТ / СДЕЛКА",
    icon: <FileCheck className="h-4 w-4 text-emerald-500" />,
    variables: [
      { id: 'doc_number', label: 'Номер документа' },
      { id: 'doc_date', label: 'Дата документа' },
      { id: 'doc_amount', label: 'Сумма общая' },
      { id: 'vat_amount', label: 'Сумма НДС' },
      { id: 'doc_amount_words', label: 'Сумма прописью' },
      { id: 'vat_amount_words', label: 'НДС прописью' },
      { id: 'doc_prepayment', label: 'Сумма предоплаты' },
      { id: 'deal_start', label: 'Дата начала' },
      { id: 'deal_end', label: 'Дата окончания' },
      { id: 'guest_count', label: 'Кол-во гостей' },
      { id: 'parent_invoice_number', label: 'Номер счета основания' },
    ]
  },
  {
    id: "company",
    label: "МОЯ КОМПАНИЯ",
    icon: <Building2 className="h-4 w-4 text-amber-500" />,
    variables: [
      { id: 'my_short_name', label: 'Краткое название' },
      { id: 'my_name', label: 'Полное название' },
      { id: 'my_inn', label: 'ИНН организации' },
      { id: 'my_kpp', label: 'КПП организации' },
      { id: 'my_ogrn', label: 'ОГРН организации' },
      { id: 'my_address', label: 'Юридический адрес' },
      { id: 'my_postal', label: 'Почтовый адрес' },
      { id: 'my_phone', label: 'Контактный телефон' },
      { id: 'my_signatory_role', label: 'Должность рук.' },
      { id: 'my_city', label: 'Город' },
    ]
  },
  {
    id: "object",
    label: "ОБЪЕКТЫ / УСЛУГИ",
    icon: <Home className="h-4 w-4 text-blue-400" />,
    variables: [
      { id: 'property_name', label: 'Название базы' },
      { id: 'cottage_name', label: 'Название дома' },
      { id: 'cottage_capacity', label: 'Вместимость дома' },
      { id: 'sauna_price', label: 'Стоимость бани' },
      { id: 'sauna_time', label: 'Время бани' },
    ]
  },
  {
    id: "logic",
    label: "ЛОГИКА И УСЛОВИЯ",
    icon: <Sparkles className="h-4 w-4 text-purple-400" />,
    variables: [
      { id: '#if sauna_included', label: 'Старт условия (Баня)' },
      { id: 'else', label: 'Иначе (Альтернатива)' },
      { id: '/if', label: 'Конец условия' },
    ]
  },
  {
    id: "signatures",
    label: "ПОДПИСИ СТОРОН",
    icon: <Sparkles className="h-4 w-4 text-rose-500" />,
    variables: [
      { id: 'signatures_table', label: 'Блок подписей (2 колонки)' },
      { id: 'my_sign_stamp', label: 'Место для печати' },
      { id: 'my_stamp', label: 'Ваша печать (картинка)' },
      { id: 'my_signature', label: 'Ваша подпись (картинка)' },
    ]
  }
];

export function TemplateBuilder({ onBack, templateId }: TemplateBuilderProps) {
  const [title, setTitle] = useState("Новый шаблон договора");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pageSettings, setPageSettings] = useState({
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 10,
    stampBase64: "",
    signatureBase64: ""
  });

  useEffect(() => {
    if (!templateId) return;
    setIsLoading(true);
    fetch(`${API_URL}/templates/${templateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTitle(data.data.title || "Без названия");
          const html = data.data.html_content || DEFAULT_CONTENT;
          setContent(html);
          setPageSettings(prev => ({ ...prev, ...data.data.settings }));
          if (editorInstance) {
            editorInstance.commands.setContent(html);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [templateId, editorInstance]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: templateId || undefined,
          title,
          html_content: content,
          settings: pageSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Шаблон успешно сохранен!");
        if (!templateId) onBack();
      } else {
        toast.error("Ошибка: " + data.error);
      }
    } catch (e) {
      toast.error("Сбой соединения: " + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      toast.error("Пожалуйста, выберите файл .docx");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
        if (editorInstance) editorInstance.commands.setContent(result.value);
        toast.success("Документ успешно импортирован!");
      } catch (error) {
        toast.error("Ошибка при чтении .docx файла");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const livePreviewHtml = useMemo(() => {
    try {
      // Универсальное регулярное выражение для обработки переменных Tiptap
      const templateString = content.replace(/<span\s+[^>]*data-type="variable"[^>]*>.*?<\/span>/g, (match) => {
        const idMatch = match.match(/data-id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        if (id === 'my_stamp' || id === 'my_signature') {
           const src = id === 'my_stamp' ? pageSettings.stampBase64 : pageSettings.signatureBase64;
           if (src) return `<img src="${src}" style="max-height: 60px; object-fit: contain; mix-blend-mode: multiply; vertical-align: middle;" />`;
        }
        return idMatch ? `{{${idMatch[1]}}}` : match;
      });
      
      const template = Handlebars.compile(templateString);
      return template(MOCK_DATA);
    } catch (e) {
      return "<div class='text-red-500 font-bold'>Ошибка рендера шаблона. Проверьте синтаксис.</div>";
    }
  }, [content, pageSettings.stampBase64, pageSettings.signatureBase64]);

  const insertVariable = (id: string, label: string) => {
    if (editorInstance) {
      if (id === 'signatures_table') {
        editorInstance.commands.insertContent(`
          <table style="width: 100%; border: none !important;">
            <tbody>
              <tr>
                <td style="width: 50%; border: none !important; padding: 10px 0;">
                  <strong>АРЕНДОДАТЕЛЬ:</strong><br><br>
                  {{my_signature}} {{my_stamp}}<br>
                  ________________ / {{my_signatory_role}} /
                </td>
                <td style="width: 50%; border: none !important; padding: 10px 0;">
                  <strong>АРЕНДАТОР:</strong><br><br>
                  ________________ / {{client_name}} /
                </td>
              </tr>
            </tbody>
          </table>
        `);
      } else if (id === 'my_sign_stamp') {
        editorInstance.commands.insertContent('<p style="text-align: right;">М.П. ________________</p>');
      } else {
        editorInstance.commands.chessInsertVariable({ id, label });
      }
      editorInstance.commands.focus();
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPageSettings(s => ({ ...s, stampBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPageSettings(s => ({ ...s, signatureBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* HEADER */}
      <header className="flex-none h-16 border-b border-border/40 bg-card/10 flex items-center justify-between px-4 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg hover:bg-muted transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="h-5 w-px bg-border/50 mx-1" />
          <div className="flex flex-col">
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="h-7 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0 w-[400px] shadow-none placeholder:text-muted-foreground/30"
              placeholder="Введите название шаблона..."
            />
            <span className="text-[9px] text-muted-foreground font-black tracking-widest uppercase opacity-50">Конструктор документов CHCH</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PRESETS */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-all font-sans px-4">
                <Wand2 className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Библиотека актов</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-zinc-900 border-white/5 shadow-2xl">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase px-2 py-1 tracking-widest">Выберите макет</p>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <Button 
                    key={key} 
                    variant="ghost" 
                    className="w-full justify-start text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 h-9 rounded-lg"
                    onClick={() => {
                       setContent(preset.html);
                       if (editorInstance) editorInstance.commands.setContent(preset.html);
                       toast.success(`Загружен макет: ${preset.title}`);
                    }}
                  >
                    {preset.title}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-5 w-px bg-border/50 mx-1" />
          {/* DOCX IMPORT */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="h-9 rounded-lg gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-sans px-4"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-tight">Импорт .docx</span>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleDocxUpload} 
            accept=".docx" 
            className="hidden" 
          />

          {/* PREVIEW MODAL */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all font-sans px-4">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Предпросмотр</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[1000px] h-[90vh] p-0 flex flex-col bg-[#0a0a0b] border-white/5 overflow-hidden shadow-2xl">
              <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900/50 shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 px-2">Режим предпросмотра (A4)</DialogTitle>
                </div>
              </DialogHeader>
              <ScrollArea className="flex-1 p-12 bg-[#050505]">
                <div className="flex flex-col items-center gap-8 pb-20 mt-4 leading-none">
                  <div 
                     className="bg-white rounded-[2px] w-[210mm] min-h-[297mm] p-[25mm] text-black shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] transition-transform overflow-hidden relative"
                  >
                    <div 
                      className="prose prose-sm prose-p:leading-tight prose-headings:font-bold max-w-none text-black"
                      dangerouslySetInnerHTML={{ __html: livePreviewHtml }} 
                    />
                    {pageSettings.stampBase64 && (
                      <div className="absolute right-12 bottom-12 opacity-80 mix-blend-multiply pointer-events-none">
                        <img src={pageSettings.stampBase64} alt="Stamp" className="w-[140px] transform-gpu rotate-[-5deg]" />
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/5 bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 shrink-0">
                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-lg h-10 px-8 text-slate-400 hover:text-white font-sans text-xs font-bold">ОТМЕНА</Button>
                <Button className="rounded-lg h-10 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black font-sans text-xs shadow-lg">СКАЧАТЬ PDF</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 text-muted-foreground border-white/5 hover:bg-white/5 px-4 transition-all">
                <Settings className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Настройки</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-zinc-950 border-white/10 text-white leading-none">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold uppercase tracking-widest">Параметры страницы</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ сверху (мм)</Label>
                     <Input type="number" value={pageSettings.marginTop} onChange={e => setPageSettings(s => ({...s, marginTop: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ снизу (мм)</Label>
                     <Input type="number" value={pageSettings.marginBottom} onChange={e => setPageSettings(s => ({...s, marginBottom: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ слева (мм)</Label>
                     <Input type="number" value={pageSettings.marginLeft} onChange={e => setPageSettings(s => ({...s, marginLeft: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ справа (мм)</Label>
                     <Input type="number" value={pageSettings.marginRight} onChange={e => setPageSettings(s => ({...s, marginRight: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black text-blue-400 uppercase flex items-center gap-2"><ImageIcon className="h-4 w-4" /> ПЕЧАТЬ И ПОДПИСЬ</Label>
                  <Input type="file" accept="image/*" onChange={handleStampUpload} className="text-xs bg-zinc-900 border-white/5" />
                  {pageSettings.stampBase64 && (
                    <div className="mt-2 p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center gap-3">
                      <img src={pageSettings.stampBase64} alt="Stamp" className="max-h-[100px] object-contain mix-blend-multiply transition-all grayscale contrast-[1.2]" />
                      <Button variant="ghost" size="sm" onClick={() => setPageSettings(s => ({...s, stampBase64: ""}))} className="w-full text-xs text-destructive hover:bg-destructive/10">УДАЛИТЬ ПЕЧАТЬ</Button>
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 leading-tight">Загрузите PNG с прозрачным фоном. Она будет добавлена на каждую страницу при генерации PDF.</p>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-2"><Sparkles className="h-4 w-4" /> ВАША ПОДПИСЬ</Label>
                  <Input type="file" accept="image/*" onChange={handleSignatureUpload} className="text-xs bg-zinc-900 border-white/5" />
                  {pageSettings.signatureBase64 && (
                    <div className="mt-2 p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center gap-3">
                      <img src={pageSettings.signatureBase64} alt="Signature" className="max-h-[80px] object-contain mix-blend-multiply transition-all grayscale contrast-[1.2]" />
                      <Button variant="ghost" size="sm" onClick={() => setPageSettings(s => ({...s, signatureBase64: ""}))} className="w-full text-xs text-destructive hover:bg-destructive/10">УДАЛИТЬ ПОДПИСЬ</Button>
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 leading-tight">Загрузите вашу рукописную подпись в формате PNG (желательно без фона).</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving} 
            className="h-9 rounded-lg gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black font-sans px-6 shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="text-xs">{isSaving ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ШАБЛОН"}</span>
          </Button>
        </div>
      </header>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COMPONENT: EDITOR */}
        <div className="flex-1 border-r border-border/40 flex flex-col bg-[#070708]">
          <TiptapEditor 
            content={content} 
            onChange={setContent} 
            onInit={setEditorInstance} 
            stampBase64={pageSettings.stampBase64}
            signatureBase64={pageSettings.signatureBase64}
          />
        </div>

        {/* RIGHT COMPONENT: VARIABLES */}
        <div className="w-[340px] shrink-0 border-l border-border/40 flex flex-col bg-[#0d0d0f] overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-5 bg-white/5 border-b border-white/5 backdrop-blur-sm">
              <h3 className="font-extrabold text-[10px] mb-4 flex items-center gap-2 text-yellow-500 tracking-[0.2em] uppercase">
                <FileText className="h-3.5 w-3.5" /> ПЕРЕМЕННЫЕ
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <Input
                  placeholder="Найти в библиотеке..."
                  className="pl-10 h-10 bg-zinc-950 border-white/5 text-xs focus:ring-yellow-500/50 placeholder:text-slate-700 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
              <Accordion type="multiple" defaultValue={["client"]} className="space-y-3 pb-24">
                {VARIABLE_GROUPS.map((group) => {
                  const filtered = group.variables.filter(v => 
                    v.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    v.id.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) return null;

                  return (
                    <AccordionItem key={group.id} value={group.id} className="border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl px-2 overflow-hidden shadow-sm">
                      <AccordionTrigger className="hover:no-underline py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-zinc-950 border border-white/5 text-slate-400 group-hover:text-yellow-500 transition-colors shadow-inner">
                            {group.icon}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {group.label}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-6 px-2">
                        <div className="flex flex-col gap-2">
                          {filtered.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => insertVariable(v.id, v.id)}
                              className="group cursor-pointer flex flex-col border border-white/5 bg-zinc-950/50 hover:bg-zinc-900 hover:border-yellow-500/30 p-3.5 rounded-xl transition-all active:scale-[0.97] shadow-sm"
                              title={v.id}
                            >
                              <span className="text-xs font-bold text-slate-200 group-hover:text-yellow-500 transition-colors">
                                {v.label}
                              </span>
                              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-slate-600 uppercase tracking-tighter transition-colors group-hover:text-yellow-500/50">
                                <span>{"{{"}</span>
                                <span>{v.id}</span>
                                <span>{"}}"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
