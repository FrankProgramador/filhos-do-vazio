'use client'

import type { ReactNode } from 'react'

// Primitivas pequenas compartilhadas entre `CharacterSheetCard.tsx`, `ActionBar.tsx`
// e `PartyStatusBar.tsx` — vivem num arquivo à parte pra evitar import circular entre
// os três (cada um usa uma ou ambas, nenhum "dono" natural entre eles).

// Marcadores simples (círculo cheio/vazio) — usado pro Sustento, Estágio da Fome,
// Deslocamento (CharacterSheetCard) e pelo `VitalLine` do PartyStatusBar. Sem
// `onToggle` vira só leitura (ex: Deslocamento, ou o status de outro membro visto
// por um espectador que não é o dono do personagem).
export function PipRow({ current, max, onToggle, size = '0.8rem', filledChar = '●', emptyChar = '○' }: {
  current: number; max: number; onToggle?: (next: number) => void; size?: string; filledChar?: string; emptyChar?: string
}) {
  return (
    <div className="flex items-center gap-1" style={{ flexWrap: 'nowrap' }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < current
        const color = filled ? 'var(--gold)' : 'rgba(var(--text-rgb),0.25)'
        const char = filled ? filledChar : emptyChar
        if (!onToggle) {
          return <span key={i} style={{ fontSize: size, color, lineHeight: 1 }}>{char}</span>
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle(i + 1 === current ? i : i + 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: size, color }}
          >
            {char}
          </button>
        )
      })}
    </div>
  )
}

export function HoverTip({ children, title, detail }: { children: ReactNode; title: string; detail?: string | null }) {
  return (
    <span className="hover-tip" tabIndex={0}>
      {children}
      <span className="hover-tip-bubble">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', display: 'block', marginBottom: detail ? '0.3rem' : 0 }}>
          {title}
        </span>
        {detail && (
          <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
            {detail}
          </span>
        )}
      </span>
    </span>
  )
}
