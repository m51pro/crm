import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { VariableExtension } from './VariableExtension'
import { 
  Bold, 
  Italic, 
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
  Underline as UnderlineIcon,
  Trash2,
  Minus,
  Rows,
  Columns as ColumnsIcon,
  Merge,
  Split,
  FileSignature
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onInit?: (editor: Editor) => void;
  stampBase64?: string;
  signatureBase64?: string;
}

export function TiptapEditor({ content, onChange, onInit, stampBase64, signatureBase64 }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ 
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true 
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      VariableExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      if (onInit) onInit(editor);
    }
  })

  // Реактивное обновление хранилища переменных при загрузке новых картинок
  React.useEffect(() => {
    if (editor && editor.storage.variable) {
      editor.storage.variable.stampBase64 = stampBase64;
      editor.storage.variable.signatureBase64 = signatureBase64;
      
      // Трюк для перерисовки NodeViews
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, stampBase64, signatureBase64])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] relative">
      {/* PROFESSIONAL DESIGNER STYLES */}
      <style>{`
        .ProseMirror {
          outline: none !important;
          border: none !important;
        }
        
        /* Видимые границы таблиц в редакторе (Серый пунктир как в Word) */
        .ProseMirror table {
          border-collapse: collapse !important;
          margin: 10px 0 !important;
          width: 100% !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .ProseMirror td, .ProseMirror th {
          border: 1px solid #e2e8f0 !important;
          padding: 8px !important;
          min-width: 1em !important;
          position: relative !important;
        }

        /* Ручки изменения размера колонок */
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

        /* Убираем границы в финальном PDF, если они не заданы явно (через CSS) */
        .prose table, .prose td, .prose th,
        #preview-area table, #preview-area td, #preview-area th {
          border: none !important;
        }
        
        /* Линия внутри документа */
        .ProseMirror hr {
          border: none !important;
          border-top: 1px solid #000 !important;
          margin: 10px 0 !important;
        }
      `}</style>

      <div className="sticky top-0 z-50 flex items-center gap-1 bg-background/95 backdrop-blur-md border-b border-border p-2 w-full transition-all overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-0.5 px-1.5">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0 rounded-lg"><Undo className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0 rounded-lg"><Redo className="h-3.5 w-3.5" /></Button>
        </div>
        <Separator orientation="vertical" className="h-6 bg-border/50" />
        <div className="flex items-center gap-0.5 px-1.5">
          <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0 rounded-lg data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><Bold className="h-3.5 w-3.5" /></Toggle>
          <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 p-0 rounded-lg data-[state=on]:bg-accent/10 data-[state=on]:text-accent"><UnderlineIcon className="h-3.5 w-3.5" /></Toggle>
        </div>
        <Separator orientation="vertical" className="h-6 bg-border/50" />
        <div className="flex items-center gap-0.5 px-1.5">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive({ textAlign: 'left' }) && "bg-accent/10 text-accent")}><AlignLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive({ textAlign: 'center' }) && "bg-accent/10 text-accent")}><AlignCenter className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("h-8 w-8 p-0 rounded-lg", editor.isActive({ textAlign: 'right' }) && "bg-accent/10 text-accent")}><AlignRight className="h-3.5 w-3.5" /></Button>
        </div>
        <Separator orientation="vertical" className="h-6 bg-border/50" />
        <div className="flex items-center gap-0.5 px-1.5 overflow-hidden">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run()} className="h-8 w-8 p-0 rounded-lg text-emerald-400 hover:bg-emerald-400/10" title="Блок подписей (1x2)"><FileSignature className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()} className="h-8 w-8 p-0 rounded-lg text-blue-400 hover:bg-blue-400/10" title="Вставить таблицу"><TableIcon className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" disabled={!editor.isActive('table')} onClick={() => editor.chain().focus().addRowAfter().run()} className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-20" title="Ряд вниз"><Rows className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" disabled={!editor.isActive('table')} onClick={() => editor.chain().focus().deleteTable().run()} className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive disabled:opacity-20" title="Удалить таблицу"><Trash2 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8 p-0 rounded-lg hover:bg-accent/10 hover:text-accent" title="Линия (на всю ширину блока)"><Minus className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 bg-card/5 custom-scrollbar">
        <div className="bg-white shadow-[0_15px_60px_-15px_rgba(0,0,0,0.5)] w-[210mm] min-h-[297mm] mx-auto p-[20mm] text-sm focus-within:ring-0 prose prose-sm max-w-none text-black transition-all">
          <EditorContent editor={editor} className="outline-none min-h-[297mm]" />
        </div>
      </div>
    </div>
  )
}
