import { mergeAttributes, Node, ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react'

export interface VariableOptions {
  HTMLAttributes: Record<string, unknown>
  stampBase64?: string
  signatureBase64?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chessVariable: {
      chessInsertVariable: (options: { id: string; label: string }) => ReturnType
      chessInsertBlock: (options: { html: string }) => ReturnType
    }
  }
}

const VariableComponent = (props: NodeViewProps) => {
  const { id, label } = props.node.attrs
  const storage = (props.editor.storage as any).variable || {}
  
  const isStamp = id === 'my_stamp'
  const isSignature = id === 'my_signature'
  const imageSrc = isStamp ? storage.stampBase64 : (isSignature ? storage.signatureBase64 : null)

  if (imageSrc) {
    return (
      <NodeViewWrapper
        as="span"
        className="inline-block align-middle select-none cursor-default relative"
        contentEditable={false}
        data-type="variable"
        data-id={id}
      >
        <img 
          src={imageSrc} 
          alt={label || id} 
          className="mix-blend-multiply pointer-events-none transition-all"
          style={{ 
            verticalAlign: 'middle',
            maxHeight: isStamp ? '120px' : '60px',
            /* Для печати добавляем смещение, чтобы она ложилась ПОВЕРХ текста */
            position: isStamp ? 'absolute' : 'relative',
            left: isStamp ? '-40px' : '0',
            top: isStamp ? '-60px' : '0',
            zIndex: isStamp ? 10 : 1,
            transform: isStamp ? 'rotate(-5deg)' : 'none',
            maxWidth: 'none'
          }}
        />
        {/* Заглушка, чтобы иконка переменной занимала немного места в строке */}
        {isStamp && <span className="inline-block w-8 h-4" />}
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center align-middle bg-amber-500/10 text-amber-600 font-mono text-[11px] px-1.5 py-0.5 rounded border border-amber-500/20 mx-1 select-none cursor-default"
      contentEditable={false}
      data-type="variable"
      data-id={id}
    >
      <span className="opacity-50 mr-0.5 font-bold">{'{{'}</span>
      <span className="font-bold">{label || id}</span>
      <span className="opacity-50 ml-0.5 font-bold">{'}}'}</span>
    </NodeViewWrapper>
  )
}

export const VariableExtension = Node.create<VariableOptions>({
  name: 'variable',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addStorage() {
    return {
      stampBase64: null,
      signatureBase64: null,
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'variable' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent)
  },

  addCommands() {
    return {
      chessInsertVariable:
        ({ id, label }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { id, label },
          })
        },
      chessInsertBlock:
        ({ html }) =>
        ({ commands }) => commands.insertContent(html),
    }
  },
})
