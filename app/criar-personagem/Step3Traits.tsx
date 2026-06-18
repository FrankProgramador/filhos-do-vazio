import type { TracoEspecial } from '@/app/lib/mockData'
import { MAX_TRACOS } from '@/app/lib/mockData'

interface Props {
  tracosEspeciais: TracoEspecial[]
  selectedIds: string[]
  selectedSubIds: string[]
  fomeGasta: number
  fomeMax: number
  totalTracos: number
  onToggle: (id: string) => void
  onToggleSub: (parentId: string, subId: string) => void
}

export default function Step3Traits({
  tracosEspeciais, selectedIds, selectedSubIds,
  fomeGasta, fomeMax, totalTracos,
  onToggle, onToggleSub,
}: Props) {
  const grouped = tracosEspeciais.reduce<Record<string, TracoEspecial[]>>((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = []
    acc[t.categoria].push(t)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 justify-between flex-wrap">
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          color: 'rgba(var(--text-rgb),0.55)',
          lineHeight: 1.8,
          maxWidth: 520,
        }}>
          Traços especiais representam características físicas únicas do seu inseto.
          Cada um consome Fome do seu orçamento. Sub-traços desbloqueados por traços selecionados
          não contam para o limite de {MAX_TRACOS} traços, mas custam Fome.
        </p>
        <div style={{
          flexShrink: 0,
          textAlign: 'center',
          padding: '0.6rem 1.2rem',
          background: 'var(--card)',
          border: '1px solid rgba(var(--gold-rgb),0.12)',
          borderRadius: 7,
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

      {Object.entries(grouped).map(([categoria, tracos]) => (
        <div key={categoria}>
          <h3 style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(var(--gold-rgb),0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {categoria}
          </h3>

          <div className="flex flex-col gap-2">
            {tracos.map(traco => {
              const isSelected = selectedIds.includes(traco.id)
              const wouldExceedFome = !isSelected && fomeGasta + traco.custoFome > fomeMax
              const wouldExceedTracos = !isSelected && totalTracos >= MAX_TRACOS
              const canToggle = isSelected || (!wouldExceedFome && !wouldExceedTracos)

              return (
                <div
                  key={traco.id}
                  className={`card ${isSelected ? 'card--selected' : ''}`}
                  style={{
                    background: isSelected ? undefined : 'var(--card)',
                    borderRadius: 8,
                    opacity: !canToggle ? 0.38 : 1,
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                  }}
                >
                  {/* Main trait row — clickable */}
                  <button
                    onClick={() => onToggle(traco.id)}
                    disabled={!canToggle}
                    className="text-left w-full"
                    style={{
                      padding: '0.875rem 1rem',
                      cursor: canToggle ? 'pointer' : 'not-allowed',
                      background: 'transparent',
                      border: 'none',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox visual */}
                      <div style={{
                        width: 18,
                        height: 18,
                        flexShrink: 0,
                        marginTop: 2,
                        border: isSelected
                          ? '2px solid var(--gold)'
                          : '1px solid rgba(var(--gold-rgb),0.3)',
                        borderRadius: 3,
                        background: isSelected ? 'rgba(var(--gold-rgb),0.18)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && (
                          <span style={{ color: 'var(--gold)', fontSize: '0.65rem', lineHeight: 1 }}>✓</span>
                        )}
                      </div>

                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={traco.thumbPlaceholder}
                        alt={`${traco.nome} — thumbnail disponível em breve`}
                        style={{
                          width: 48,
                          height: 48,
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
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--gold-light)' : 'var(--text)',
                          }}>
                            {traco.nome}
                          </span>
                          <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '0.48rem' }}>
                            +{traco.custoFome} Fome
                          </span>
                          {traco.subTracos && traco.subTracos.length > 0 && (
                            <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.45rem' }}>
                              {traco.subTracos.length} sub-traço{traco.subTracos.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-im-fell)',
                          fontStyle: 'italic',
                          fontSize: '0.82rem',
                          color: 'rgba(var(--text-rgb),0.48)',
                          marginTop: '0.3rem',
                          lineHeight: 1.6,
                        }}>
                          {traco.descricao}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Sub-traits — expandem quando o pai está selecionado */}
                  {isSelected && traco.subTracos && traco.subTracos.length > 0 && (
                    <div style={{
                      margin: '0 1rem 0.875rem',
                      padding: '0.75rem',
                      background: 'rgba(var(--gold-rgb),0.04)',
                      border: '1px solid rgba(var(--gold-rgb),0.1)',
                      borderRadius: 6,
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.48rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        marginBottom: '0.6rem',
                      }}>
                        Sub-traços disponíveis
                      </p>

                      <div className="flex flex-col gap-2">
                        {traco.subTracos.map(sub => {
                          const isSubSelected = selectedSubIds.includes(sub.id)
                          const canSelectSub = isSubSelected || (fomeGasta + sub.custoFome <= fomeMax)

                          return (
                            <button
                              key={sub.id}
                              onClick={e => { e.stopPropagation(); onToggleSub(traco.id, sub.id) }}
                              disabled={!canSelectSub}
                              className="text-left w-full"
                              style={{
                                padding: '0.6rem 0.75rem',
                                background: isSubSelected ? 'rgba(var(--gold-rgb),0.09)' : 'rgba(var(--gold-rgb),0.02)',
                                border: isSubSelected
                                  ? '1px solid rgba(var(--gold-rgb),0.22)'
                                  : '1px solid rgba(var(--gold-rgb),0.08)',
                                borderRadius: 5,
                                cursor: canSelectSub ? 'pointer' : 'not-allowed',
                                opacity: !canSelectSub ? 0.38 : 1,
                                transition: 'all 0.15s',
                              }}
                            >
                              <div className="flex items-start gap-2.5">
                                {/* Checkbox */}
                                <div style={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  marginTop: 2,
                                  border: isSubSelected
                                    ? '2px solid rgba(var(--gold-rgb),0.7)'
                                    : '1px solid rgba(var(--gold-rgb),0.25)',
                                  borderRadius: 2,
                                  background: isSubSelected ? 'rgba(var(--gold-rgb),0.2)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  {isSubSelected && (
                                    <span style={{ color: 'var(--gold)', fontSize: '0.5rem', lineHeight: 1 }}>✓</span>
                                  )}
                                </div>

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="https://placehold.co/36x36/1B1D21/B8924A?text=Em+Breve"
                                  alt={`${sub.nome} — thumbnail disponível em breve`}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 3,
                                    objectFit: 'cover',
                                    border: '1px solid rgba(var(--gold-rgb),0.1)',
                                    flexShrink: 0,
                                  }}
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span style={{
                                      fontFamily: 'var(--font-cinzel)',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      color: isSubSelected ? 'var(--gold-light)' : 'var(--text)',
                                    }}>
                                      {sub.nome}
                                    </span>
                                    <span className="badge badge--gold" style={{ fontSize: '0.44rem' }}>
                                      +{sub.custoFome} Fome
                                    </span>
                                  </div>
                                  <p style={{
                                    fontFamily: 'var(--font-im-fell)',
                                    fontStyle: 'italic',
                                    fontSize: '0.76rem',
                                    color: 'rgba(var(--text-rgb),0.4)',
                                    marginTop: '0.2rem',
                                    lineHeight: 1.5,
                                  }}>
                                    {sub.descricao}
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
      ))}

      {totalTracos >= MAX_TRACOS && (
        <div className="alert alert--error" style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
        }}>
          Limite de {MAX_TRACOS} traços atingido. Remova um traço para adicionar outro.
          Sub-traços não contam para este limite.
        </div>
      )}
    </div>
  )
}
