'use client'

import { useEffect } from 'react'
import { useDiceTextures } from '@/app/lib/dice/useDiceTextures'

export default function TexturePickerModal({ value, onSelect, onClose }: { value: string; onSelect: (texture: string) => void; onClose: () => void }) {
  const { textures, loading } = useDiceTextures()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escolher textura"
      style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div onClick={onClose} aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }} />
      <div
        style={{
          position: 'relative', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.25)',
          borderRadius: 10, maxWidth: 640, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.15)' }}>
          <h3 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.1rem', color: 'var(--gold)', margin: 0 }}>Escolher textura</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}>
            ×
          </button>
        </div>
        <div style={{ padding: '1.1rem 1.25rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '0.6rem' }}>
          {loading && (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              Carregando texturas...
            </p>
          )}
          {textures.map(({ name, file }) => (
            <button
              key={name}
              type="button"
              onClick={() => { onSelect(name); onClose() }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                background: name === value ? 'rgba(var(--gold-rgb),0.15)' : 'transparent',
                border: name === value ? '1px solid rgba(var(--gold-rgb),0.6)' : '1px solid transparent',
                borderRadius: 8, padding: '0.4rem', cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  background: file ? '#1c1d21' : '#666',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {file && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/dice-box/textures/${file}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </span>
              <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', wordBreak: 'break-word' }}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
