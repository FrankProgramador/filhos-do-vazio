'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import type { JSONContent } from '@tiptap/react'
import { useAuth } from '@/app/lib/auth-context'
import { apiUpload } from '@/app/lib/api'
import type { TipTapDoc } from '@/app/lib/bookData'

const toolbarButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cinzel)',
  fontSize: '0.65rem',
  padding: '0.35rem 0.6rem',
  borderRadius: 6,
  border: '1px solid rgba(var(--gold-rgb),0.18)',
  background: 'var(--bg-secondary)',
  color: 'var(--text)',
  cursor: 'pointer',
}

const activeStyle: React.CSSProperties = {
  ...toolbarButtonStyle,
  background: 'rgba(var(--gold-rgb),0.22)',
  color: 'var(--gold)',
  borderColor: 'var(--gold)',
}

export default function TipTapEditor({ content, onChange }: { content: TipTapDoc; onChange: (doc: TipTapDoc) => void }) {
  const { token } = useAuth()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
    ],
    content: (content ?? { type: 'doc', content: [{ type: 'paragraph' }] }) as JSONContent,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TipTapDoc),
  })

  if (!editor) return null

  async function uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    const { url } = await apiUpload<{ url: string }>('/api/uploads/imagem', formData, token)
    editor?.chain().focus().setImage({ src: url }).run()
  }

  function pickImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) uploadImage(file)
    }
    input.click()
  }

  function setLink() {
    const url = window.prompt('URL do link:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div style={{ border: '1px solid rgba(var(--gold-rgb),0.15)', borderRadius: 8 }}>
      <div className="flex flex-wrap items-center gap-1.5" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.12)' }}>
        <button type="button" style={editor.isActive('bold') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={editor.isActive('italic') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            type="button"
            style={editor.isActive('heading', { level }) ? activeStyle : toolbarButtonStyle}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run()}
          >
            H{level}
          </button>
        ))}
        <button type="button" style={editor.isActive('bulletList') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
        <button type="button" style={editor.isActive('orderedList') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</button>
        <button type="button" style={editor.isActive('blockquote') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ Citação</button>
        <button type="button" style={toolbarButtonStyle} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Tabela</button>
        <button type="button" style={toolbarButtonStyle} onClick={pickImage}>Imagem</button>
        <button type="button" style={editor.isActive('link') ? activeStyle : toolbarButtonStyle} onClick={setLink}>Link</button>
        <button type="button" style={editor.isActive({ textAlign: 'left' }) ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().setTextAlign('left').run()}>Esq.</button>
        <button type="button" style={editor.isActive({ textAlign: 'center' }) ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().setTextAlign('center').run()}>Centro</button>
        <button type="button" style={editor.isActive({ textAlign: 'right' }) ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().setTextAlign('right').run()}>Dir.</button>
        <button type="button" style={editor.isActive('highlight') ? activeStyle : toolbarButtonStyle} onClick={() => editor.chain().focus().toggleHighlight().run()}>Marcador</button>
        <button type="button" style={toolbarButtonStyle} onClick={() => editor.chain().focus().undo().run()}>↶ Desfazer</button>
        <button type="button" style={toolbarButtonStyle} onClick={() => editor.chain().focus().redo().run()}>↷ Refazer</button>
      </div>
      <div style={{ padding: '0.85rem', minHeight: 240 }} className="tiptap-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
