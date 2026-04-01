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
    }
  }
}

const VariableComponent = (props: NodeViewProps) => {
  const { id, label } = props.node.attrs
  const options = props.extension.options as VariableOptions
  
  const isStamp = id === 'my_stamp'
  const isSignature = id === 'my_signature'
  const imageSrc = isStamp ? options.stampBase64 : (isSignature ? options.signatureBase64 : null)

  if (imageSrc) {
    return (
      <NodeViewWrapper
        as="span"
        className="inline-block align-middle select-none cursor-default relative group"
        contentEditable={false}
        data-type="variable"
        data-id={id}
      >
        <img 
          src={imageSrc} 
          alt={label || id} 
          className={`max-h-[60px] object-contain mix-blend-multiply pointer-events-none transition-all ${isStamp ? 'w-[80px]' : 'w-[120px]'}`} 
          style={{ verticalAlign: 'middle' }}
        />
        <div className="absolute -top-4 left-0 bg-amber-500 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label || id}
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center align-middle bg-amber-500/20 text-amber-500 font-mono text-[11px] px-1.5 py-0.5 rounded-md border border-amber-500/30 mx-1 select-none cursor-default"
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
  name: 'chessVariable',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

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
            attrs: {
              id,
              label,
            },
          })
        },
    }
  },
})
