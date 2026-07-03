'use client'

import { useState } from 'react'
import TraitsModal from './TraitsModal'

export default function TraitsModalLink({
  mode, title, children,
}: {
  mode: 'personality' | 'attributes'
  title: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print"
        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--gold-light)', textDecoration: 'underline', cursor: 'pointer' }}
      >
        {children ?? 'clicando aqui'}
      </button>
      <TraitsModal open={open} onClose={() => setOpen(false)} mode={mode} title={title} />
    </>
  )
}
