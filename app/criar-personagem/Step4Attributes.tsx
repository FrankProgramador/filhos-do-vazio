import type { Atributos, GameTrait, Size } from '@/app/lib/gameData'
import { MAX_TRACOS } from '@/app/lib/gameData'

// Traços de atributo (point-buy) são identificados por slug — mecânica preservada
// como estava antes da unificação do model de Traço por raridade.
const ATTR_TRAIT_SLUGS = [
  'poderoso', 'gracioso', 'duradouro', 'perspicaz', 'fragil', 'fraco',
  'lindo', 'assustador-traco', 'lento', 'agil', 'saudavel', 'enfermo',
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
  const attrTraitList = traits.filter(t => ATTR_TRAIT_SLUGS.includes(t.slug))

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

          {attrTraitList.map(trait => {
            const count = attrTraits[trait.id] ?? 0
            const canAdd = count < trait.max_selections && totalTracos < MAX_TRACOS
            const canRemove = count > 0
            const disabledReason = !canAdd && !canRemove
              ? (count >= trait.max_selections ? `Limite de ${trait.max_selections}x atingido` : 'Limite de traços atingido')
              : null

            return (
              <div
                key={trait.id}
                className={`card ${count > 0 ? 'card--selected' : ''}`}
                style={{
                  padding: '0.875rem 1rem',
                  background: count > 0 ? undefined : 'var(--card)',
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://placehold.co/48x48/1B1D21/B8924A?text=Em+Breve"
                    alt={`${trait.name} — thumbnail disponível em breve`}
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
                        {trait.name}
                      </span>
                      {trait.max_selections > 1 && (
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.48rem' }}>
                          máx {trait.max_selections}×
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
                      {trait.mechanical_effect}
                    </p>
                    {disabledReason && (
                      <p style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.55rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.3rem',
                      }} title={disabledReason}>
                        {disabledReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRemove(trait.id)}
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
                      onClick={() => onAdd(trait.id)}
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
            Traços negativos (Frágil, Fraco) reduzem um atributo, mas podem ser combinados com traços positivos.
          </p>
        </div>
      </div>
    </div>
  )
}
