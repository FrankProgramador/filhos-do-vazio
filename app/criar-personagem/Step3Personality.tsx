import { useMemo, useState } from 'react'
import type { GameTrait } from '@/app/lib/gameData'
import { REQUIRED_PERSONALITY } from '@/app/lib/gameData'

const FILTER_TAG_ORDER = ['protecao', 'obsessao', 'cautela', 'impulso', 'troca']

interface Props {
  traits: GameTrait[]
  personalityTraits: number[]
  onToggle: (id: number) => void
}

export default function Step3Personality({ traits, personalityTraits, onToggle }: Props) {
  const [activeTagIds, setActiveTagIds] = useState<number[]>([])

  const pool = traits.filter(t => t.tipo === 'personalidade')
  const done = personalityTraits.length >= REQUIRED_PERSONALITY

  const filterTags = useMemo(() => {
    const byId = new Map<number, GameTrait['tags'][number]>()
    for (const trait of pool) {
      for (const tag of trait.tags) {
        if (FILTER_TAG_ORDER.includes(tag.slug)) byId.set(tag.id, tag)
      }
    }
    return [...byId.values()].sort((a, b) => FILTER_TAG_ORDER.indexOf(a.slug) - FILTER_TAG_ORDER.indexOf(b.slug))
  }, [pool])

  function toggleFilterTag(tagId: number) {
    setActiveTagIds(ids => ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId])
  }

  const visiblePool = activeTagIds.length === 0
    ? pool
    : pool.filter(trait => trait.tags.some(tag => activeTagIds.includes(tag.id)))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          color: 'rgba(var(--text-rgb),0.55)',
          lineHeight: 1.8,
          maxWidth: 600,
        }}>
          Antes de qualquer outro traço, escolha exatamente {REQUIRED_PERSONALITY} traços de
          personalidade. Eles não têm custo — mas trazem uma{' '}
          <strong style={{ fontStyle: 'normal', color: 'var(--gold)' }}>obrigação de interpretação</strong>{' '}
          que seu personagem deve viver em jogo.
        </p>
        <span className={`badge ${done ? 'badge--success' : 'badge--gold'}`} style={{ fontSize: '0.6rem', flexShrink: 0 }}>
          {personalityTraits.length} / {REQUIRED_PERSONALITY} escolhidos
        </span>
      </div>

      {filterTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleFilterTag(tag.id)}
              className={activeTagIds.includes(tag.id) ? 'ddb-badge ddb-badge-gold' : 'ddb-badge ddb-badge-dim'}
              style={{ border: 'none', cursor: 'pointer' }}
              title={tag.description ?? undefined}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visiblePool.map(trait => {
          const isSelected = personalityTraits.includes(trait.id)
          const blocked = !isSelected && done
          return (
            <button
              key={trait.id}
              onClick={() => onToggle(trait.id)}
              disabled={blocked}
              className={`text-left w-full transition-all duration-200 ${isSelected ? 'card--selected' : ''}`}
              style={{
                padding: '1rem 1.125rem',
                background: isSelected ? undefined : 'var(--card)',
                border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(var(--gold-rgb),0.12)',
                borderRadius: 10,
                cursor: blocked ? 'not-allowed' : 'pointer',
                opacity: blocked ? 0.4 : 1,
                boxShadow: isSelected ? '0 0 20px rgba(var(--gold-rgb),0.15)' : 'none',
              }}
              title={blocked ? `Você já escolheu ${REQUIRED_PERSONALITY} traços de personalidade. Remova um para trocar.` : undefined}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--gold)' : 'var(--text)' }}>
                  {trait.name}
                </span>
                {isSelected && <span style={{ color: 'var(--gold)' }}>✓</span>}
              </div>
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                {trait.description}
              </p>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.25rem' }}>
                <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Mecânica:</strong> {trait.mechanical_effect}
              </p>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Obrigação:</strong> {trait.roleplay_obligation}
              </p>
            </button>
          )
        })}
      </div>

      {!done && (
        <div className="alert alert--warning" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.06em' }}>
          Escolha {REQUIRED_PERSONALITY - personalityTraits.length} traço(s) de personalidade para continuar.
        </div>
      )}
    </div>
  )
}
