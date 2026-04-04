import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { VariableExtension } from "./VariableExtension";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Table as TableIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Text,
  Trash2,
  Minus,
  Rows,
  Columns as ColumnsIcon,
  Merge,
  Split,
  FileSignature,
  Indent,
  Outdent,
  Type,
  ArrowUp,
  ArrowDown,
  Columns,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import React from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onInit?: (editor: Editor) => void;
  stampBase64?: string;
  signatureBase64?: string;
}

// Правильное создание расширения с защитой от NaN
const CustomStyleExtension = Extension.create({
  name: "customStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          paddingLeft: {
            default: 0,
            renderHTML: (attributes) => {
              if (!attributes.paddingLeft) return {};
              return { style: `padding-left: ${attributes.paddingLeft}px` };
            },
            parseHTML: (element) => {
              const val = parseInt(element.style.paddingLeft, 10);
              return isNaN(val) ? 0 : val;
            },
          },
          lineHeight: {
            default: 1.2,
            renderHTML: (attributes) => {
              if (attributes.lineHeight === 1.2) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
            parseHTML: (element) => {
              const val = parseFloat(element.style.lineHeight);
              return isNaN(val) ? 1.2 : val;
            },
          },
          firstLineIndent: {
            default: false,
            renderHTML: (attributes) => {
              if (!attributes.firstLineIndent) return {};
              return { class: "indent-first-line" };
            },
            parseHTML: (element) => element.classList.contains("indent-first-line"),
          },
        },
      },
    ];
  },
});

export function TiptapEditor({
  content,
  onChange,
  onInit,
  stampBase64,
  signatureBase64,
}: TiptapEditorProps) {
  const [gridSize, setGridSize] = React.useState({ rows: 3, cols: 3 });
  const [fontTheme, setFontTheme] = React.useState("theme-1");
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { class: 'indent-paragraph' } },
      }),
      CustomStyleExtension,
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      VariableExtension,
      BubbleMenuExtension,
    ],
    content,
    editorProps: {
      // ОБРАБОТЧИК DRAG & DROP
      handleDrop: (view, event) => {
        const data = event.dataTransfer?.getData('application/x-tiptap-variable');
        if (data) {
          try {
            const { id, label } = JSON.parse(data);
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              // Создаем узел переменной и вставляем по координатам курсора мыши
              const node = view.state.schema.nodes.variable.create({ id, label });
              const tr = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(tr);
              return true;
            }
          } catch (e) {
            console.error('Failed to parse dropped variable data', e);
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      if (onInit) onInit(editor);
    },
  });

  // Синхронизация контента извне (без зацикливания)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  React.useEffect(() => {
    if (editor?.storage) {
      const storage = editor.storage as { variable?: { stampBase64?: string; signatureBase64?: string } };
      if (storage.variable) {
        storage.variable.stampBase64 = stampBase64;
        storage.variable.signatureBase64 = signatureBase64;
        editor.view.dispatch(editor.state.tr);
      }
    }
  }, [editor, stampBase64, signatureBase64]);

  if (!editor) return null;

  // Хелперы для применения стилей к активному блоку (абзац, заголовок или цитата)
  const updateBlockStyle = (attrs: Record<string, unknown>) => {
    if (editor.isActive("heading")) {
      editor.chain().focus().updateAttributes("heading", attrs).run();
    } else if (editor.isActive("blockquote")) {
      editor.chain().focus().updateAttributes("blockquote", attrs).run();
    } else {
      editor.chain().focus().updateAttributes("paragraph", attrs).run();
    }
  };

  const getBlockAttrs = () => {
    if (editor.isActive("heading")) return editor.getAttributes("heading");
    if (editor.isActive("blockquote")) return editor.getAttributes("blockquote");
    return editor.getAttributes("paragraph");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] relative">
      <style>{`
        /* ВИЗУАЛЬНАЯ ПАГИНАЦИЯ (РАЗДЕЛЕНИЕ НА ЛИСТЫ А4) */
        .ProseMirror {
          outline: none !important;
          border: none !important;
          background-color: white !important;
          /* Рисуем темные пробелы (разрывы) между страницами каждые 297мм */
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0mm,
            transparent 296mm,
            #18181b 296mm, /* Тонкая рамка страницы */
            #09090b 297mm, /* Темный фон разрыва */
            #09090b 311mm, /* Ширина разрыва 14мм */
            #18181b 312mm  /* Тонкая рамка следующей страницы */
          ) !important;
          background-size: 100% 312mm !important;
          padding-bottom: 20mm !important;
          position: relative;
        }

        /* Темы шрифтов */
        .theme-1 { --font-heading: 'Inter', sans-serif; --font-body: 'Roboto', sans-serif; }
        .theme-2 { --font-heading: 'Helvetica', 'Arial', sans-serif; --font-body: 'Georgia', serif; }
        .theme-3 { --font-heading: 'Oswald', sans-serif; --font-body: 'Lora', serif; }

        .font-wrapper .ProseMirror { font-family: var(--font-body) !important; }
        .font-wrapper .ProseMirror h1, 
        .font-wrapper .ProseMirror h2, 
        .font-wrapper .ProseMirror h3 { font-family: var(--font-heading) !important; }
        
        .ProseMirror h1 { font-size: 24px !important; font-weight: 800 !important; margin-top: 1em !important; margin-bottom: 0.5em !important; }
        .ProseMirror h2 { font-size: 20px !important; font-weight: 700 !important; margin-top: 1em !important; margin-bottom: 0.5em !important; }
        .ProseMirror h3 { font-size: 16px !important; font-weight: 600 !important; margin-top: 1em !important; margin-bottom: 0.5em !important; }
        .ProseMirror blockquote { border-left: 3px solid #cbd5e1 !important; padding-left: 1rem !important; font-style: italic !important; color: #475569 !important; margin: 1em 0 !important; }

        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 10px 0 !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 10px 0 !important; }
        .ProseMirror li { display: list-item !important; margin-bottom: 5px !important; }
        .ProseMirror p { margin-bottom: 0.5em; }
        .indent-first-line { text-indent: 1.25cm; }
        .ProseMirror table { border-collapse: collapse !important; margin: 10px 0 !important; width: 100% !important; border: 1px solid #94a3b8 !important; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #cbd5e1 !important; padding: 8px !important; min-width: 1em !important; position: relative !important; }
        .ProseMirror .selectedCell:after { background: rgba(200, 200, 255, 0.4); content: ""; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; position: absolute; z-index: 2; }
      `}</style>

      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-2 bg-background/90 backdrop-blur-md border-b border-border/60 p-3 w-full shadow-sm transition-all">
        {/* Отмена / Повтор */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"><Undo className="h-5 w-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"><Redo className="h-5 w-5" /></Button>
        </div>

        {/* Заголовки и Текст */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle size="sm" pressed={editor.isActive("paragraph")} onPressedChange={() => editor.chain().focus().setParagraph().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Обычный текст"><Text className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Заголовок 1"><Heading1 className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Заголовок 2"><Heading2 className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Заголовок 3"><Heading3 className="h-5 w-5" /></Toggle>
        </div>

        {/* Выбор шрифтовой пары */}
        <div className="flex items-center bg-muted/40 rounded-2xl border border-border/50 shadow-sm px-1 h-10">
          <Select value={fontTheme} onValueChange={setFontTheme}>
            <SelectTrigger className="h-8 w-[190px] bg-transparent border-0 focus:ring-0 focus:ring-offset-0 shadow-none">
              <SelectValue placeholder="Шрифты" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white shadow-2xl">
              <SelectItem value="theme-1">
                <div className="flex flex-col text-left">
                  <span style={{ fontFamily: 'Inter' }} className="text-[10px] text-muted-foreground uppercase font-bold">Inter</span>
                  <span style={{ fontFamily: 'Roboto' }} className="text-sm">Roboto (Текст)</span>
                </div>
              </SelectItem>
              <SelectItem value="theme-2">
                <div className="flex flex-col text-left">
                  <span style={{ fontFamily: 'Helvetica' }} className="text-[10px] text-muted-foreground uppercase font-bold">Helvetica</span>
                  <span style={{ fontFamily: 'Georgia' }} className="text-sm">Georgia (Текст)</span>
                </div>
              </SelectItem>
              <SelectItem value="theme-3">
                <div className="flex flex-col text-left">
                  <span style={{ fontFamily: 'Oswald' }} className="text-[10px] text-muted-foreground uppercase font-bold">Oswald</span>
                  <span style={{ fontFamily: 'Lora' }} className="text-sm">Lora (Текст)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Форматирование */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Жирный"><Bold className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Курсив"><Italic className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Подчеркнутый"><UnderlineIcon className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Зачеркнутый"><Strikethrough className="h-5 w-5" /></Toggle>
        </div>

        {/* Отступы и Красная строка */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => { const currentPadding = getBlockAttrs().paddingLeft || 0; updateBlockStyle({ paddingLeft: Math.max(0, currentPadding - 20) }); }} className="h-10 w-10 p-0 rounded-xl hover:bg-background/80" title="Уменьшить отступ"><Outdent className="h-5 w-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => { const currentPadding = getBlockAttrs().paddingLeft || 0; updateBlockStyle({ paddingLeft: currentPadding + 20 }); }} className="h-10 w-10 p-0 rounded-xl hover:bg-background/80" title="Увеличить отступ"><Indent className="h-5 w-5" /></Button>
          <div className="w-px h-6 bg-border/50 mx-1" />
          <Toggle size="sm" pressed={editor.isActive({ firstLineIndent: true })} onPressedChange={() => { const isActive = editor.isActive({ firstLineIndent: true }); updateBlockStyle({ firstLineIndent: !isActive }); }} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Красная строка"><Type className="h-5 w-5" /></Toggle>
        </div>

        {/* Межстрочный интервал */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          {[1.0, 1.15, 1.5, 2.0].map((spacing) => {
            const currentSpacing = getBlockAttrs().lineHeight || 1.2;
            const isActive = currentSpacing === spacing;
            return (
              <Button key={spacing} variant="ghost" size="sm" onClick={() => updateBlockStyle({ lineHeight: spacing })} className={cn("h-10 px-2 rounded-xl text-[10px] font-bold transition-all", isActive ? "bg-accent/20 text-accent border border-accent/30" : "text-muted-foreground hover:bg-background/80")}>
                {spacing}x
              </Button>
            );
          })}
        </div>

        {/* Выравнивание (скрывается на мобилках) */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm hidden md:flex">
          <Toggle size="sm" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><AlignLeft className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><AlignCenter className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><AlignRight className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive({ textAlign: "justify" })} onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><AlignJustify className="h-5 w-5" /></Toggle>
        </div>

        {/* Списки и Цитаты */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Маркированный список"><List className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Нумерованный список"><ListOrdered className="h-5 w-5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent" title="Цитата"><Quote className="h-5 w-5" /></Toggle>
        </div>

        {/* Таблицы и Линии */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm ml-0">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run()} className="h-10 w-10 p-0 rounded-xl text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-400 transition-colors" title="Блок подписей (1x2)"><FileSignature className="h-5 w-5" /></Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-sky-500 hover:bg-sky-500/15" title="Выбрать размер таблицы"><TableIcon className="h-5 w-5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-zinc-950 border-white/10 shadow-2xl">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Размер: {gridSize.cols} x {gridSize.rows}</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(10, 1fr)` }}>
                  {[...Array(100)].map((_, i) => {
                    const r = Math.floor(i / 10) + 1;
                    const c = (i % 10) + 1;
                    const isActive = r <= gridSize.rows && c <= gridSize.cols;
                    return <div key={i} onMouseEnter={() => setGridSize({ rows: r, cols: c })} onClick={() => { editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: false }).run(); }} className={cn("w-5 h-5 border rounded-sm cursor-pointer transition-colors", isActive ? "bg-sky-500 border-sky-400" : "bg-white/5 border-white/10 hover:border-white/30")} />
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className={cn("flex items-center gap-1 overflow-hidden transition-all duration-200", editor.isActive("table") ? "w-auto opacity-100 ml-1 border-l border-border/50 pl-1" : "w-0 opacity-0 pointer-events-none")}>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent" title="Добавить колонку"><ColumnsIcon className="h-5 w-5" /></Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent" title="Добавить строку"><Rows className="h-5 w-5" /></Button>
            <Separator orientation="vertical" className="h-6 mx-1 bg-border/50" />
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent disabled:opacity-30" title="Объединить ячейки"><Merge className="h-5 w-5" /></Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()} className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent disabled:opacity-30" title="Разделить ячейку"><Split className="h-5 w-5" /></Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteTable().run()} className="h-10 w-10 p-0 rounded-xl text-red-400 hover:bg-red-400/10" title="Удалить таблицу"><Trash2 className="h-5 w-5" /></Button>
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent" title="Горизонтальная линия"><Minus className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 bg-card/5 custom-scrollbar">
        <div className="bg-white shadow-[0_15px_60px_-15px_rgba(0,0,0,0.5)] w-[210mm] min-h-[297mm] mx-auto p-[20mm] text-sm focus-within:ring-0 prose prose-sm max-w-none text-black transition-all">
          <ContextMenu>
            <ContextMenuTrigger className="block h-full">
              <div className={cn("font-wrapper h-full", fontTheme)}>
                <EditorContent editor={editor} className="outline-none min-h-[297mm]" />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-zinc-950/95 backdrop-blur-md border-white/10 text-white shadow-2xl">
              {editor.isActive("table") ? (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Работа с таблицей</div>
                  <ContextMenuItem onClick={() => editor.chain().focus().addRowBefore().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><ArrowUp className="h-4 w-4" /> Добавить строку выше</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><ArrowDown className="h-4 w-4" /> Добавить строку ниже</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().deleteRow().run()} className="gap-2 text-red-400 focus:bg-red-400/5 focus:text-red-400"><Trash2 className="h-4 w-4" /> Удалить строку</ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><Columns className="h-4 w-4" /> Добавить колонку слева</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><Columns className="h-4 w-4" /> Добавить колонку справа</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} className="gap-2 text-red-400 focus:bg-red-400/5 focus:text-red-400"><Trash2 className="h-4 w-4" /> Удалить колонку</ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} className="gap-2 focus:bg-accent/15 focus:text-accent disabled:opacity-30"><Merge className="h-4 w-4" /> Объединить ячейки</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()} className="gap-2 focus:bg-accent/15 focus:text-accent disabled:opacity-30"><Split className="h-4 w-4" /> Разделить ячейки</ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="gap-2 text-red-500 font-bold focus:bg-red-500/10 focus:text-red-500"><Trash2 className="h-4 w-4" /> Удалить таблицу</ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="gap-2"><Undo className="h-4 w-4" /> Назад</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="gap-2"><Redo className="h-4 w-4" /> Вперед</ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Форматирование</div>
                  <ContextMenuItem onClick={() => editor.chain().focus().toggleBold().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><Bold className="h-4 w-4" /> Жирный</ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().toggleItalic().run()} className="gap-2 focus:bg-accent/15 focus:text-accent"><Italic className="h-4 w-4" /> Курсив</ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </div>
  );
}
