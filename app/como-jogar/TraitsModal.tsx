'use client'

import { useEffect, useState } from 'react'
import { fetchTraits, type GameTrait, type TraitRarity } from '@/app/lib/gameData'

const RARITY_LABELS: Record<TraitRarity, string> = {
  common: 'Comum', remarkable: 'Marcante', rare: 'Raro', personality: 'Personalidade',
}

export default function TraitsModal({
  open, onClose, mode, title,
}: {
  open: boolean
  onClose: () => void
  mode: 'personality' | 'attributes'
  title: string
}) {
  const [traits, setTraits] = useState<GameTrait[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchTraits().then(setTraits).finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const filtered = traits.filter(t => (mode === 'personality' ? t.rarity === 'personality' : t.rarity !== 'personality'))

  return (
    <div
      className="no-print"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
      />
      <div
        style={{
          position: 'relative', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.25)',
          borderRadius: 10, maxWidth: 720, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.15)' }}>
          <h3 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.3rem', color: 'var(--gold)', margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Carregando traços...</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nenhum traço encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(t => (
                <div key={t.id} className="card" style={{ padding: '0.85rem 1rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{t.name}</span>
                    <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.6rem' }}>{RARITY_LABELS[t.rarity]}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.92rem', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.6 }}>
                    {t.description}
                  </p>
                  {t.mechanical_effect && (
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', color: 'var(--gold-light)', marginTop: '0.4rem' }}>
                      {t.mechanical_effect}
                    </p>
                  )}
                  {t.roleplay_obligation && (
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Obrigação:</strong> {t.roleplay_obligation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
