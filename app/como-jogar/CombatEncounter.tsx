'use client'

import { useState } from 'react'
import CombatSimulator, { type CombatantConfig } from './CombatSimulator'

export default function CombatEncounter({
  player, enemies, initialDistance = 0, label = 'Iniciar Combate',
}: {
  player: CombatantConfig
  enemies: CombatantConfig[]
  initialDistance?: number
  label?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="no-print" style={{ textAlign: 'center', margin: '1.75rem 0' }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hk-btn hk-btn-soul"
        style={{ fontSize: '0.95rem', padding: '0.8rem 1.9rem', borderRadius: 8 }}
      >
        ⚔️ {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={() => setOpen(false)}
            aria-hidden
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
          />
          <div
            style={{
              position: 'relative', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.25)',
              borderRadius: 12, width: '95vw', height: '95vh', overflowY: 'auto',
              boxShadow: '0 30px 70px -20px rgba(0,0,0,0.7)', padding: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
            <CombatSimulator player={player} enemies={enemies} initialDistance={initialDistance} />
          </div>
        </div>
      )}
    </div>
  )
}
