'use client'

import { useState } from 'react'
import type { Atributos, GameTrait, Size } from '@/app/lib/gameData'
import { MAX_TRACOS } from '@/app/lib/gameData'

// Traços de atributo (point-buy) agrupados pelo atributo que afetam — cada grupo
// vira uma aba no painel da direita, igual ao agrupamento por categoria do passo 5.
const ATTR_GROUPS: Array<{ key: keyof Atributos; label: string; slugs: string[] }> = [
  { key: 'poder', label: 'Poder', slugs: ['poderoso', 'bruto', 'encouracado'] },
  { key: 'graca', label: 'Graça', slugs: ['gracioso', 'fragil', 'escorregadio', 'refinado'] },
  { key: 'casca', label: 'Casca', slugs: ['duradouro', 'lento', 'obtuso'] },
  { key: 'saber', label: 'Saber', slugs: ['perspicaz', 'estudioso', 'ansioso'] },
  { key: 'fofo', label: 'Fofo', slugs: ['lindo', 'fraco', 'ingenuo', 'medroso'] },
  { key: 'assustador', label: 'Assustador', slugs: ['ameacador', 'intimidante', 'cicatrizado'] },
  { key: 'velocidade', label: 'Deslocamento', slugs: ['agil', 'leviano', 'nervoso'] },
  { key: 'coracao', label: 'Corações', slugs: ['saudavel'] },
]

const PRIMARY_ATTRS: Array<[keyof Atributos, string]> = [
  ['poder', 'Poder'],
  ['saber', 'Saber'],
  ['casca', 'Casca'],
  ['graca', 'Graça'],
]

const SECONDARY_ATTRS: Array<[keyof Atributos, string]> = [
  ['coracao', 'Coração'],
  ['estamina', 'Estamina'],
  ['alma', 'Alma'],
  ['velocidade', 'Velocidade'],
]

const SOCIAL_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['fofo', 'Fofo', '🌸'],
  ['assustador', 'Assustador', '💀'],
]

interface Props {
  size: Size
  traits: GameTrait[]
  attrTraits: Record<number, number>
  atributos: Atributos
  totalTracos: number
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

function fmtAttr(v: number) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

export default function Step4Attributes({
  size, traits, attrTraits, atributos, totalTracos, onAdd, onRemove,
}: Props) {
  const [activeGroup, setActiveGroup] = useState<keyof Atributos>(ATTR_GROUPS[0].key)
  const visible = traits.filter(t => ATTR_GROUPS.find(g => g.key === activeGroup)!.slugs.includes(t.slug))

  return (
    <div className="flex flex-col gap-8">
      {/* Status bar */}
      <div className="flex items-center justify-between" style={{
        padding: '1rem 1.25rem',
        background: 'var(--card)',
        border: '1px solid rgba(var(--gold-rgb),0.1)',
        borderRadius: 8,
      }}>
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'rgba(var(--text-rgb),0.5)',
          margin: 0,
        }}>
          Traços de atributo são livres — o custo de cada um já está embutido no próprio
          atributo que ele altera (ex: Fraco já dá -1 Poder).
        </p>
        <div style={{
          flexShrink: 0,
          textAlign: 'center',
          paddingLeft: '1rem',
          borderLeft: '1px solid rgba(var(--gold-rgb),0.1)',
        }}>
          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.55rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '0.2rem',
          }}>
            Traços
          </span>
          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: totalTracos >= MAX_TRACOS ? 'var(--error)' : 'var(--text)',
          }}>
            {totalTracos}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {MAX_TRACOS}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Attributes */}
        <div className="flex flex-col gap-4">
          <h3 style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}>
            Atributos — {size.name}
          </h3>

          <div>
            <p style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}>
              Primários
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRIMARY_ATTRS.map(([key, label]) => (
                <div key={key} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(var(--gold-rgb),0.15)',
                  borderRadius: 6,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1,
                  }}>
                    {fmtAttr(atributos[key])}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginTop: '0.35rem',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}>
              Sociais
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_ATTRS.map(([key, label, icon]) => (
                <div key={key} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(var(--gold-rgb),0.1)',
                  borderRadius: 6,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1,
                  }}>
                    {fmtAttr(atributos[key])}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginTop: '0.35rem',
                  }}>
                    {icon} {label}
                  </div>
                </div>
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.7rem',
              color: 'rgba(var(--text-rgb),0.28)',
              marginTop: '0.4rem',
              lineHeight: 1.5,
            }}>
              Traços como Lindo (+Fofo) e Assustador (+Assustador) alteram estes valores.
            </p>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}>
              Secundários
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {SECONDARY_ATTRS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between" style={{
                  padding: '0.4rem 0.65rem',
                  background: 'rgba(var(--gold-rgb),0.04)',
                  border: '1px solid rgba(var(--gold-rgb),0.08)',
                  borderRadius: 4,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.48rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'rgba(var(--text-rgb),0.6)',
                  }}>
                    {fmtAttr(atributos[key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Trait list */}
        <div className="flex flex-col gap-3">
          <h3 style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}>
            Traços de Atributo
          </h3>

          {/* Abas por atributo */}
          <div className="flex items-center gap-2 flex-wrap">
            {ATTR_GROUPS.map(group => {
              const isActive = activeGroup === group.key
              return (
                <button
                  key={group.key}
                  onClick={() => setActiveGroup(group.key)}
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
                  {group.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            {visible.map(trait => {
              const count = attrTraits[trait.id] ?? 0
              const isSelected = count > 0
              const canToggle = isSelected || totalTracos < MAX_TRACOS
              const blockReason = !canToggle ? 'Limite de traços atingido' : null

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
                    onClick={() => (isSelected ? onRemove(trait.id) : onAdd(trait.id))}
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

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://placehold.co/48x48/1B1D21/B8924A?text=Em+Breve"
                        alt={`${trait.name} — thumbnail disponível em breve`}
                        style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', border: '1px solid rgba(var(--gold-rgb),0.12)', flexShrink: 0 }}
                      />

                      <div className="flex-1 min-w-0">
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', fontWeight: 600, color: isSelected ? 'var(--gold-light)' : 'var(--text)' }}>
                          {trait.name}
                        </span>
                        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.48)', marginTop: '0.3rem', lineHeight: 1.6 }}>
                          {trait.mechanical_effect}
                        </p>
                        {blockReason && (
                          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {blockReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          <p style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            fontSize: '0.78rem',
            color: 'rgba(var(--text-rgb),0.3)',
            marginTop: '0.25rem',
          }}>
            Cada traço de atributo é um pico único — escolha um por atributo ou combine vários.
          </p>
        </div>
      </div>
    </div>
  )
}
