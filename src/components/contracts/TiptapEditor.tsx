import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
  CheckSquare,
  FileSignature,
  Indent,
  Outdent,
  Type,
  Plus,
  ArrowUp,
  ArrowDown,
  Columns,
  MinusCircle,
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

export function TiptapEditor({
  content,
  onChange,
  onInit,
  stampBase64,
  signatureBase64,
}: TiptapEditorProps) {
  const [gridSize, setGridSize] = React.useState({ rows: 3, cols: 3 });
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'indent-paragraph',
          },
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            paddingLeft: {
              default: 0,
              renderHTML: attributes => {
                if (!attributes.paddingLeft) return {}
                return { style: `padding-left: ${attributes.paddingLeft}px` }
              },
              parseHTML: element => parseInt(element.style.paddingLeft) || 0,
            },
            lineHeight: {
              default: 1.2,
              renderHTML: attributes => {
                if (!attributes.lineHeight) return {}
                return { style: `line-height: ${attributes.lineHeight}` }
              },
              parseHTML: element => element.style.lineHeight || 1.2,
            },
            class: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.class) return {}
                return { class: attributes.class }
              },
              parseHTML: element => element.getAttribute('class'),
            },
          }
        },
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      VariableExtension,
      BubbleMenuExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      if (onInit) onInit(editor);
    },
  });

  // Реактивное обновление хранилища переменных при загрузке новых картинок
  React.useEffect(() => {
    if (editor?.storage) {
      // Указываем точный тип для хранилища через unknown, чтобы порадовать TS
      const storage = (editor.storage as unknown) as Record<
        string,
        Record<string, string | undefined>
      >;

      if (storage.variable) {
        storage.variable.stampBase64 = stampBase64;
        storage.variable.signatureBase64 = signatureBase64;

        // Трюк для перерисовки NodeViews
        editor.view.dispatch(editor.state.tr);
      }
    }
  }, [editor, stampBase64, signatureBase64]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] relative">
      {/* PROFESSIONAL DESIGNER STYLES */}
      <style>{`
        /* Стили для имитации страниц A4 */
        .ProseMirror {
          outline: none !important;
          border: none !important;
          /* Создаем эффект разрыва страниц каждые 297мм */
          background-image: linear-gradient(to bottom, transparent 296mm, #e2e8f0 296mm, #e2e8f0 297mm);
          background-size: 100% 297mm;
          position: relative;
        }

        /* Исправление списков */
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 10px 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 10px 0 !important;
        }
        .ProseMirror li {
          display: list-item !important;
          margin-bottom: 5px !important;
        }

        /* Красная строка (абзацный отступ) */
        .ProseMirror p {
          margin-bottom: 0.5em;
        }
        
        .indent-first-line {
          text-indent: 1.25cm;
        }
        
        /* Делаем границы таблиц видимыми и четкими в редакторе */
        .ProseMirror table {
          border-collapse: collapse !important;
          margin: 10px 0 !important;
          width: 100% !important;
          /* Тёмно-серый цвет для контура всей таблицы */
          border: 1px solid #94a3b8 !important; 
        }
        
        .ProseMirror td, .ProseMirror th {
          /* Светло-серый цвет для внутренних ячеек */
          border: 1px solid #cbd5e1 !important;
          padding: 8px !important;
          min-width: 1em !important;
          position: relative !important;
        }

        /* Подсветка выделенной ячейки */
        .ProseMirror .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        /* Ручки изменения размера колонок (синие) */
        .ProseMirror .column-resize-handle {
          position: absolute !important;
          right: -2px !important;
          top: 0 !important;
          bottom: 0 !important;
          width: 4px !important;
          background-color: #3b82f6 !important;
          cursor: col-resize !important;
          z-index: 20 !important;
          pointer-events: auto !important;
        }

        .ProseMirror hr {
          border: none !important;
          border-top: 1px solid #000 !important;
          margin: 10px 0 !important;
        }
      `}</style>

      {/* ГЛАВНЫЙ ТУЛБАР (Увеличенный дизайн по центру) */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-4 bg-background/95 backdrop-blur-md border-b border-border p-4 w-full shadow-md transition-all">
        {/* Отмена / Повтор */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"
          >
            <Undo className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"
          >
            <Redo className="h-5 w-5" />
          </Button>
        </div>

        {/* Заголовки и Текст */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle
            size="sm"
            pressed={editor.isActive("paragraph")}
            onPressedChange={() => editor.chain().focus().setParagraph().run()}
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Обычный текст"
          >
            <Text className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Заголовок 1"
          >
            <Heading1 className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Заголовок 2"
          >
            <Heading2 className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Заголовок 3"
          >
            <Heading3 className="h-5 w-5" />
          </Toggle>
        </div>

        {/* Форматирование */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Жирный"
          >
            <Bold className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Курсив"
          >
            <Italic className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Подчеркнутый"
          >
            <UnderlineIcon className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Зачеркнутый"
          >
            <Strikethrough className="h-5 w-5" />
          </Toggle>
        </div>

        {/* Отступы и Красная строка */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentPadding = editor.getAttributes('paragraph').paddingLeft || 0;
              const nextPadding = Math.max(0, currentPadding - 20);
              editor.chain().focus().updateAttributes('paragraph', { paddingLeft: nextPadding }).run();
            }}
            className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"
            title="Уменьшить отступ"
          >
            <Outdent className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentPadding = editor.getAttributes('paragraph').paddingLeft || 0;
              const nextPadding = currentPadding + 20;
              editor.chain().focus().updateAttributes('paragraph', { paddingLeft: nextPadding }).run();
            }}
            className="h-10 w-10 p-0 rounded-xl hover:bg-background/80"
            title="Увеличить отступ"
          >
            <Indent className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-border/50 mx-1" />
          <Toggle
            size="sm"
            pressed={editor.isActive('paragraph', { class: 'indent-first-line' })}
            onPressedChange={() => {
              const isActive = editor.isActive('paragraph', { class: 'indent-first-line' });
              editor.chain().focus().updateAttributes('paragraph', { class: isActive ? null : 'indent-first-line' }).run();
            }}
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Красная строка"
          >
            <Type className="h-5 w-5" /> 
          </Toggle>
        </div>

        {/* Межстрочный интервал */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          {[1.0, 1.15, 1.5, 2.0].map((spacing) => (
            <Button
              key={spacing}
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().updateAttributes('paragraph', { lineHeight: spacing }).run()}
              className={cn(
                "h-10 px-2 rounded-xl text-[10px] font-bold transition-all",
                editor.getAttributes('paragraph').lineHeight === spacing 
                  ? "bg-accent/20 text-accent border border-accent/30" 
                  : "text-muted-foreground hover:bg-background/80"
              )}
            >
              {spacing}x
            </Button>
          ))}
        </div>

        {/* Выравнивание (скрывается на мобилках для экономии места) */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm hidden md:flex">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
          >
            <AlignLeft className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
          >
            <AlignCenter className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
          >
            <AlignRight className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("justify").run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
          >
            <AlignJustify className="h-5 w-5" />
          </Toggle>
        </div>

        {/* Списки и Цитаты */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Маркированный список"
          >
            <List className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Нумерованный список"
          >
            <ListOrdered className="h-5 w-5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            className="h-10 w-10 p-0 rounded-xl data-[state=on]:bg-accent/10 data-[state=on]:text-accent"
            title="Цитата"
          >
            <Quote className="h-5 w-5" />
          </Toggle>
        </div>

        {/* Таблицы и Линии */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-sm ml-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 1, cols: 2, withHeaderRow: false })
                .run()
            }
            className="h-10 w-10 p-0 rounded-xl text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-400 transition-colors"
            title="Блок подписей (1x2)"
          >
            <FileSignature className="h-5 w-5" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl text-sky-500 hover:bg-sky-500/15"
                title="Выбрать размер таблицы"
              >
                <TableIcon className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-zinc-950 border-white/10 shadow-2xl">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                  Размер: {gridSize.cols} x {gridSize.rows}
                </p>
                <div 
                  className="grid gap-1" 
                  style={{ gridTemplateColumns: `repeat(10, 1fr)` }}
                >
                  {[...Array(100)].map((_, i) => {
                    const r = Math.floor(i / 10) + 1;
                    const c = (i % 10) + 1;
                    const isActive = r <= gridSize.rows && c <= gridSize.cols;
                    
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setGridSize({ rows: r, cols: c })}
                        onClick={() => {
                          editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: false }).run();
                        }}
                        className={cn(
                          "w-5 h-5 border rounded-sm cursor-pointer transition-colors",
                          isActive ? "bg-sky-500 border-sky-400" : "bg-white/5 border-white/10 hover:border-white/30"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Инструменты редактирования таблицы (появляются только если курсор внутри таблицы) */}
          <div
            className={cn(
              "flex items-center gap-1 overflow-hidden transition-all duration-200",
              editor.isActive("table")
                ? "w-auto opacity-100 ml-1 border-l border-border/50 pl-1"
                : "w-0 opacity-0 pointer-events-none",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent"
              title="Добавить колонку"
            >
              <ColumnsIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent"
              title="Добавить строку"
            >
              <Rows className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1 bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
              className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent disabled:opacity-30"
              title="Объединить ячейки"
            >
              <Merge className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
              className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent disabled:opacity-30"
              title="Разделить ячейку"
            >
              <Split className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="h-10 w-10 p-0 rounded-xl text-red-400 hover:bg-red-400/10"
              title="Удалить таблицу"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-accent/10 hover:text-accent"
            title="Горизонтальная линия"
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 bg-card/5 custom-scrollbar">
        <div className="bg-white shadow-[0_15px_60px_-15px_rgba(0,0,0,0.5)] w-[210mm] min-h-[297mm] mx-auto p-[20mm] text-sm focus-within:ring-0 prose prose-sm max-w-none text-black transition-all">
          <ContextMenu>
            <ContextMenuTrigger className="block h-full">
              <EditorContent
                editor={editor}
                className="outline-none min-h-[297mm]"
              />
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-zinc-950/95 backdrop-blur-md border-white/10 text-white shadow-2xl">
              {editor.isActive("table") ? (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Работа с таблицей
                  </div>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent"
                  >
                    <ArrowUp className="h-4 w-4" /> Добавить строку выше
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent"
                  >
                    <ArrowDown className="h-4 w-4" /> Добавить строку ниже
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="gap-2 text-red-400 focus:bg-red-400/5 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" /> Удалить строку
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent"
                  >
                    <Columns className="h-4 w-4" /> Добавить колонку слева
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent"
                  >
                    <Columns className="h-4 w-4" /> Добавить колонку справа
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="gap-2 text-red-400 focus:bg-red-400/5 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" /> Удалить колонку
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().mergeCells().run()}
                    disabled={!editor.can().mergeCells()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent disabled:opacity-30"
                  >
                    <Merge className="h-4 w-4" /> Объединить ячейки
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().splitCell().run()}
                    disabled={!editor.can().splitCell()}
                    className="gap-2 focus:bg-accent/15 focus:text-accent disabled:opacity-30"
                  >
                    <Split className="h-4 w-4" /> Разделить ячейки
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem 
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="gap-2 text-red-500 font-bold focus:bg-red-500/10 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" /> Удалить таблицу
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="gap-2">
                    <Undo className="h-4 w-4" /> Назад
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="gap-2">
                    <Redo className="h-4 w-4" /> Вперед
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Форматирование
                  </div>
                  <ContextMenuItem onClick={() => editor.chain().focus().toggleBold().run()} className="gap-2 focus:bg-accent/15 focus:text-accent">
                    <Bold className="h-4 w-4" /> Жирный
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => editor.chain().focus().toggleItalic().run()} className="gap-2 focus:bg-accent/15 focus:text-accent">
                    <Italic className="h-4 w-4" /> Курсив
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </div>
  );
}
