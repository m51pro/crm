import { mergeAttributes, Node, ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react'

export interface VariableOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (options: { id: string; label: string }) => ReturnType
    }
  }
}

const VariableComponent = (props: NodeViewProps) => {
  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center align-middle bg-accent/20 text-accent font-mono text-[11px] px-1.5 py-0.5 rounded border border-accent/30 mx-1 select-none cursor-default"
      contentEditable={false}
      data-type="variable"
      data-id={props.node.attrs.id}
    >
      <span className="opacity-50 mr-0.5 font-bold">{'{{'}</span>
      <span className="font-bold">{props.node.attrs.label || props.node.attrs.id}</span>
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
      insertVariable:
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
