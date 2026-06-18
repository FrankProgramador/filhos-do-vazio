import type { Base, TracoAtributo, Atributos } from '@/app/lib/mockData'
import { MAX_TRACOS } from '@/app/lib/mockData'

const PRIMARY_ATTRS: Array<[keyof Atributos, string]> = [
  ['poder', 'Poder'],
  ['saber', 'Saber'],
  ['casca', 'Casca'],
  ['graca', 'Graça'],
]

const SECONDARY_ATTRS: Array<[keyof Atributos, string]> = [
  ['coracao',    'Coração'],
  ['estamina',   'Estamina'],
  ['alma',       'Alma'],
  ['velocidade', 'Velocidade'],
]

const SOCIAL_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['fofo',        'Fofo',        '🌸'],
  ['assustador',  'Assustador',  '💀'],
]

interface Props {
  base: Base
  tracosAtributo: TracoAtributo[]
  attrTraits: Record<string, number>
  atributos: Atributos
  fomeGasta: number
  fomeMax: number
  totalTracos: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

function fmtAttr(v: number) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

function FomeBar({ fomeGasta, fomeMax }: { fomeGasta: number; fomeMax: number }) {
  const pct = Math.max(0, Math.min(100, (fomeGasta / fomeMax) * 100))
  const color = pct >= 90 ? 'var(--error)' : pct >= 70 ? 'var(--warning)' : 'var(--gold)'
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.6rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Fome
        </span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', fontWeight: 700, color }}>
          {fomeGasta} / {fomeMax}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(var(--gold-rgb),0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.3s ease, background 0.3s ease',
        }} />
      </div>
    </div>
  )
}

export default function Step2Attributes({
  base, tracosAtributo, attrTraits, atributos, fomeGasta, fomeMax, totalTracos, onAdd, onRemove,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Status bar */}
      <div className="flex items-center gap-4" style={{
        padding: '1rem 1.25rem',
        background: 'var(--card)',
        border: '1px solid rgba(var(--gold-rgb),0.1)',
        borderRadius: 8,
      }}>
        <FomeBar fomeGasta={fomeGasta} fomeMax={fomeMax} />
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
            Atributos — {base.nome}
          </h3>

          {/* Primários */}
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
                    {fmtAttr(atributos[key] as number)}
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

          {/* Sociais — atualizados por traços */}
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
                    {fmtAttr(atributos[key] as number)}
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

          {/* Secundários */}
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
                    {atributos[key]}
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

          {tracosAtributo.map(traco => {
            const count = attrTraits[traco.id] ?? 0
            const isNegative = traco.custoFome < 0
            const canAdd =
              count < traco.maxVezes &&
              totalTracos < MAX_TRACOS &&
              (isNegative || fomeGasta + traco.custoFome <= fomeMax)
            const canRemove = count > 0

            return (
              <div
                key={traco.id}
                className={`card ${count > 0 ? 'card--selected' : ''}`}
                style={{
                  padding: '0.875rem 1rem',
                  background: count > 0 ? undefined : 'var(--card)',
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://placehold.co/48x48/1B1D21/B8924A?text=Em+Breve"
                    alt={`${traco.nome} — thumbnail disponível em breve`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 4,
                      objectFit: 'cover',
                      border: '1px solid rgba(var(--gold-rgb),0.12)',
                      flexShrink: 0,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: count > 0 ? 'var(--gold-light)' : 'var(--text)',
                      }}>
                        {traco.nome}
                      </span>
                      <span className={`badge ${isNegative ? 'badge--success' : 'badge--gold'}`} style={{ fontSize: '0.5rem' }}>
                        {isNegative ? '' : '+'}{traco.custoFome} Fome
                      </span>
                      {traco.maxVezes > 1 && (
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.48rem' }}>
                          máx {traco.maxVezes}×
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-im-fell)',
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: 'rgba(var(--text-rgb),0.42)',
                      marginTop: '0.25rem',
                    }}>
                      {traco.efeito}
                    </p>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRemove(traco.id)}
                      disabled={!canRemove}
                      className="counter-btn counter-btn--dec"
                      style={{
                        width: 26, height: 26,
                        color: 'var(--gold-light)',
                        fontSize: '1rem',
                        lineHeight: 1,
                        cursor: canRemove ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      fontFamily: 'var(--font-cinzel)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: count > 0 ? 'var(--gold-light)' : 'var(--text-muted)',
                      minWidth: 16,
                      textAlign: 'center',
                    }}>
                      {count}
                    </span>
                    <button
                      onClick={() => onAdd(traco.id)}
                      disabled={!canAdd}
                      className="counter-btn counter-btn--inc"
                      style={{
                        width: 26, height: 26,
                        color: 'var(--gold)',
                        fontSize: '1rem',
                        lineHeight: 1,
                        cursor: canAdd ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          <p style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            fontSize: '0.78rem',
            color: 'rgba(var(--text-rgb),0.3)',
            marginTop: '0.25rem',
          }}>
            Traços negativos (Frágil, Fraco) devolvem Fome — combináveis com traços positivos.
          </p>
        </div>
      </div>
    </div>
  )
}
