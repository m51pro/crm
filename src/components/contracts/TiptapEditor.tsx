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
  Type,
  Heading1,
  Heading2,
  TableProperties,
  Underline as UnderlineIcon
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
}

export function TiptapEditor({ content, onChange, onInit }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
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

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] relative border-r border-border/40">
      {/* FLOATING CAPSULE TOOLBAR */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 bg-background/80 backdrop-blur-md border border-border/50 p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-accent/30">
        
        {/* TEXT STYLE */}
        <div className="flex items-center gap-0.5 px-1.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Жирный (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Курсив (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Подчеркнутый (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/50" />

        {/* HEADINGS */}
        <div className="flex items-center gap-0.5 px-1.5">
           <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Заголовок 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Заголовок 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/50" />

        {/* ALIGNMENT */}
        <div className="flex items-center gap-0.5 px-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn("h-8 w-8 p-0 rounded-full", editor.isActive({ textAlign: 'left' }) && "bg-accent/10 text-accent")}
            title="По левому краю"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn("h-8 w-8 p-0 rounded-full", editor.isActive({ textAlign: 'center' }) && "bg-accent/10 text-accent")}
            title="По центру"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn("h-8 w-8 p-0 rounded-full", editor.isActive({ textAlign: 'right' }) && "bg-accent/10 text-accent")}
            title="По правому краю"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/50" />

        {/* LISTS */}
        <div className="flex items-center gap-0.5 px-1.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Маркированный список"
          >
            <List className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent/10 data-[state=on]:text-accent hover:bg-muted"
            title="Нумерованный список"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/50" />

        {/* TABLE & UTILS */}
        <div className="flex items-center gap-0.5 px-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10"
            title="Вставить таблицу"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>
          <div className="w-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-muted"
            title="Отменить"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-muted"
            title="Повторить"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* EDITOR CONTENT */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-card/5 pt-20">
         <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[210mm] min-h-[297mm] mx-auto p-[25mm] text-sm focus-within:ring-0 rounded-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-accent text-black transition-all">
            <EditorContent editor={editor} className="outline-none h-full min-h-[297mm]" />
         </div>
      </div>
    </div>
  )
}
