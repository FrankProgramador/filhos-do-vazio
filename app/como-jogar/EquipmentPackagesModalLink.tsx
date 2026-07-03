'use client'

import { useState } from 'react'
import EquipmentPackagesModal from './EquipmentPackagesModal'

export default function EquipmentPackagesModalLink({ children }: { children?: React.ReactNode }) {
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
      <EquipmentPackagesModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
