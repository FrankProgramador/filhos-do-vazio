'use client'

import { useState } from 'react'
import type { Atributos, GameTrait, Size, TraitRarity } from '@/app/lib/gameData'
import { MAX_RARE, MAX_REMARKABLE, MAX_TRACOS } from '@/app/lib/gameData'
import AttributesPanel from './AttributesPanel'
import ChosenTraitsPanel, { type ChosenTraitEntry } from './ChosenTraitsPanel'

const RARITY_LABELS: Record<TraitRarity, string> = {
  common: 'Comum',
  remarkable: 'Marcante',
  rare: 'Raro',
  personality: 'Personalidade',
}

const RARITY_BADGE_CLASS: Record<TraitRarity, string> = {
  common: 'ddb-badge ddb-badge-dim',
  remarkable: 'ddb-badge ddb-badge-gold',
  rare: 'badge badge--gold',
  personality: 'badge badge--success',
}

const RARITY_CAPS: Record<'common' | 'remarkable' | 'rare', number> = {
  common: MAX_TRACOS,
  remarkable: MAX_REMARKABLE,
  rare: MAX_RARE,
}

interface Props {
  size: Size
  traits: GameTrait[]
  atributos: Atributos
  attrTraits: Record<number, number>
  specialTraits: number[]
  subTraits: number[]
  totalTracos: number
  onRemoveAttr: (id: number) => void
  onToggleSpecial: (id: number) => void
  onToggleSub: (parentId: number, subId: number) => void
}

export default function Step5Special({
  size, traits, atributos, attrTraits, specialTraits, subTraits, totalTracos,
  onRemoveAttr, onToggleSpecial, onToggleSub,
}: Props) {
  const pool = traits.filter(t => t.tipo === 'especial' && t.prerequisite_trait_id === null)

  const tagsInPool = Array.from(new Map(pool.flatMap(t => t.tags).map(tag => [tag.id, tag])).values())
  const [activeTagId, setActiveTagId] = useState<number | null>(tagsInPool[0]?.id ?? null)
  const [rarityFilter, setRarityFilter] = useState<TraitRarity | 'all'>('all')

  const countByRarity = (rarity: TraitRarity) =>
    [...specialTraits, ...subTraits].filter(id => traits.find(t => t.id === id)?.rarity === rarity).length

  const visible = pool.filter(t =>
    (activeTagId === null || t.tags.some(tag => tag.id === activeTagId)) &&
    (rarityFilter === 'all' || t.rarity === rarityFilter)
  )

  const chosenAttrTraits = traits.filter(t => t.tipo === 'atributo' && (attrTraits[t.id] ?? 0) > 0)
  const chosenSpecialTraits = [...specialTraits, ...subTraits]
    .map(id => traits.find(t => t.id === id))
    .filter((t): t is GameTrait => !!t)

  const chosenItems: ChosenTraitEntry[] = [
    ...chosenAttrTraits.map(trait => ({
      id: trait.id,
      name: trait.name,
      badge: trait.prerequisite_trait_id ? 'Subtraço' : 'Traço',
      detail: trait.mechanical_effect,
      onRemove: () => onRemoveAttr(trait.id),
    })),
    ...chosenSpecialTraits.map(trait => ({
      id: trait.id,
      name: trait.name,
      badge: trait.prerequisite_trait_id ? 'Sub-traço' : RARITY_LABELS[trait.rarity],
      detail: trait.description,
      onRemove: () => (trait.prerequisite_trait_id
        ? onToggleSub(trait.prerequisite_trait_id, trait.id)
        : onToggleSpecial(trait.id)),
    })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AttributesPanel size={size} atributos={atributos} />
        <ChosenTraitsPanel
          items={chosenItems}
          emptyText="Nenhum traço escolhido ainda."
        />
      </div>

      <div className="flex items-start gap-4 justify-between flex-wrap">
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          color: 'rgba(var(--text-rgb),0.55)',
          lineHeight: 1.8,
          maxWidth: 520,
        }}>
          Traços especiais representam características físicas únicas do seu inseto.
          São escolhidos livremente, dentro dos limites por raridade. Sub-traços
          desbloqueados por traços selecionados contam para o limite da sua própria raridade.
        </p>
        <div className="flex gap-2 flex-wrap">
          {(['common', 'remarkable', 'rare'] as const).map(rarity => {
            const count = countByRarity(rarity)
            const cap = RARITY_CAPS[rarity]
            return (
              <div key={rarity} style={{
                textAlign: 'center',
                padding: '0.5rem 0.9rem',
                background: 'var(--card)',
                border: '1px solid rgba(var(--gold-rgb),0.12)',
                borderRadius: 7,
              }}>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  {RARITY_LABELS[rarity]}
                </span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', fontWeight: 700, color: count >= cap ? 'var(--error)' : 'var(--text)' }}>
                  {count}<span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{cap}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas de tipo + filtro de raridade */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {tagsInPool.map(tag => {
            const isActive = activeTagId === tag.id
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTagId(tag.id)}
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 6,
                  border: isActive ? '1px solid var(--gold)' : '1px solid rgba(var(--gold-rgb),0.15)',
                  background: isActive ? 'rgba(var(--gold-rgb),0.12)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {tag.icon} {tag.name}
              </button>
            )
          })}
        </div>

        <select
          value={rarityFilter}
          onChange={e => setRarityFilter(e.target.value as TraitRarity | 'all')}
          className="ddb-search"
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            padding: '0.45rem 0.75rem',
            borderRadius: 6,
            color: 'var(--text)',
          }}
        >
          <option value="all">Todas as raridades</option>
          <option value="common">Comum</option>
          <option value="remarkable">Marcante</option>
          <option value="rare">Raro</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {visible.map(trait => {
          const isSelected = specialTraits.includes(trait.id)
          const cap = RARITY_CAPS[trait.rarity as 'common' | 'remarkable' | 'rare']
          const rarityCount = countByRarity(trait.rarity)
          const wouldExceedTracos = !isSelected && totalTracos >= MAX_TRACOS
          const wouldExceedRarityCap = !isSelected && rarityCount >= cap
          const canToggle = isSelected || (!wouldExceedTracos && !wouldExceedRarityCap)
          const blockReason = !canToggle
            ? (wouldExceedRarityCap ? `Limite de traços ${RARITY_LABELS[trait.rarity].toLowerCase()}s atingido` : 'Limite de traços comuns atingido')
            : null

          const children = traits.filter(t => t.prerequisite_trait_id === trait.id)

          return (
            <div
              key={trait.id}
              className={`card ${isSelected ? 'card--selected' : ''}`}
              style={{
                background: isSelected ? undefined : 'var(--card)',
                borderRadius: 8,
                opacity: !canToggle ? 0.38 : 1,
                transition: 'all 0.2s',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => onToggleSpecial(trait.id)}
                disabled={!canToggle}
                className="text-left w-full"
                style={{ padding: '0.875rem 1rem', cursor: canToggle ? 'pointer' : 'not-allowed', background: 'transparent', border: 'none', display: 'block', width: '100%' }}
                title={blockReason ?? undefined}
              >
                <div className="flex items-start gap-3">
                  <div style={{
                    width: 18, height: 18, flexShrink: 0, marginTop: 2,
                    border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(var(--gold-rgb),0.3)',
                    borderRadius: 3,
                    background: isSelected ? 'rgba(var(--gold-rgb),0.18)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                  }}>
                    {isSelected && <span style={{ color: 'var(--gold)', fontSize: '0.65rem', lineHeight: 1 }}>✓</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', fontWeight: 600, color: isSelected ? 'var(--gold-light)' : 'var(--text)' }}>
                        {trait.name}
                      </span>
                      <span className={RARITY_BADGE_CLASS[trait.rarity]} style={{ fontSize: '0.46rem' }}>
                        {RARITY_LABELS[trait.rarity]}
                      </span>
                      {children.length > 0 && (
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.45rem' }}>
                          {children.length} sub-traço{children.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.48)', marginTop: '0.3rem', lineHeight: 1.6 }}>
                      {trait.description}
                    </p>
                    {blockReason && (
                      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {blockReason}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {isSelected && children.length > 0 && (
                <div style={{ margin: '0 1rem 0.875rem', padding: '0.75rem', background: 'rgba(var(--gold-rgb),0.04)', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 6 }}>
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    Sub-traços disponíveis
                  </p>

                  <div className="flex flex-col gap-2">
                    {children.map(sub => {
                      const isSubSelected = subTraits.includes(sub.id)
                      const subCap = RARITY_CAPS[sub.rarity as 'common' | 'remarkable' | 'rare']
                      const subRarityCount = countByRarity(sub.rarity)
                      const subWouldExceedTracos = !isSubSelected && totalTracos >= MAX_TRACOS
                      const subWouldExceedRarityCap = !isSubSelected && subRarityCount >= subCap
                      const canToggleSub = isSubSelected || (!subWouldExceedTracos && !subWouldExceedRarityCap)
                      const subBlockReason = !canToggleSub
                        ? (subWouldExceedRarityCap ? `Limite de traços ${RARITY_LABELS[sub.rarity].toLowerCase()}s atingido` : 'Limite de traços comuns atingido')
                        : null

                      return (
                        <button
                          key={sub.id}
                          onClick={e => { e.stopPropagation(); onToggleSub(trait.id, sub.id) }}
                          disabled={!canToggleSub}
                          className="text-left w-full"
                          title={subBlockReason ?? undefined}
                          style={{
                            padding: '0.6rem 0.75rem',
                            background: isSubSelected ? 'rgba(var(--gold-rgb),0.09)' : 'rgba(var(--gold-rgb),0.02)',
                            border: isSubSelected ? '1px solid rgba(var(--gold-rgb),0.22)' : '1px solid rgba(var(--gold-rgb),0.08)',
                            borderRadius: 5,
                            cursor: canToggleSub ? 'pointer' : 'not-allowed',
                            opacity: !canToggleSub ? 0.38 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <div style={{
                              width: 14, height: 14, flexShrink: 0, marginTop: 2,
                              border: isSubSelected ? '2px solid rgba(var(--gold-rgb),0.7)' : '1px solid rgba(var(--gold-rgb),0.25)',
                              borderRadius: 2,
                              background: isSubSelected ? 'rgba(var(--gold-rgb),0.2)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isSubSelected && <span style={{ color: 'var(--gold)', fontSize: '0.5rem', lineHeight: 1 }}>✓</span>}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', fontWeight: 600, color: isSubSelected ? 'var(--gold-light)' : 'var(--text)' }}>
                                {sub.name}
                              </span>
                              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.76rem', color: 'rgba(var(--text-rgb),0.4)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                                {sub.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
