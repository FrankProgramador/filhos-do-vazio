'use client'

import { useState } from 'react'

export type ChosenTraitEntry = {
  id: number
  name: string
  badge: string
  detail: string | null
  onRemove: () => void
}

interface Props {
  items: ChosenTraitEntry[]
  emptyText: string
}

export default function ChosenTraitsPanel({ items, emptyText }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <h3 style={{
        fontFamily: 'var(--font-cinzel)',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
      }}>
        Traços Escolhidos
      </h3>

      {items.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          fontSize: '0.82rem',
          color: 'rgba(var(--text-rgb),0.35)',
        }}>
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => {
            const isExpanded = expandedId === item.id
            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex flex-col gap-1"
                style={{
                  padding: '0.6rem 0.75rem',
                  background: 'var(--card)',
                  border: '1px solid rgba(var(--gold-rgb),0.15)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge--gold" style={{ fontSize: '0.46rem' }}>
                    {item.badge}
                  </span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.74rem', fontWeight: 600, color: 'var(--gold-light)', flex: 1 }}>
                    {item.name}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); item.onRemove() }}
                    aria-label={`Remover ${item.name}`}
                    style={{
                      width: 20, height: 20, flexShrink: 0,
                      borderRadius: '50%',
                      border: '1px solid rgba(var(--gold-rgb),0.3)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontSize: '0.65rem',
                      lineHeight: 1,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
                {isExpanded && item.detail && (
                  <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.detail}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
