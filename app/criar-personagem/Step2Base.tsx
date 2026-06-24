import type { Size } from '@/app/lib/gameData'

const ATTR_LABELS: Array<[keyof Size, string]> = [
  ['poder', 'Poder'],
  ['saber', 'Saber'],
  ['casca', 'Casca'],
  ['graca', 'Graça'],
  ['coracao', 'Coração'],
  ['estamina', 'Estamina'],
  ['alma', 'Alma'],
  ['velocidade', 'Velocidade'],
  ['sustento_maximo', 'Sustento Necessário'],
]

const SIZE_TOOLTIPS: Record<string, string> = {
  pequeno: 'Você passa onde os outros não cabem e some antes de serem vistos. Frágil o suficiente para que subestimem — esperto o suficiente para usar isso.',
  medio: 'Sem vantagens óbvias, sem desvantagens óbvias. O que você é depende inteiramente do que escolhe ser. Versátil e equilibrado.',
  grande: 'Você chega antes de entrar. Inimigos hesitam, estranhos recuam, espaços apertados viram problema pessoal. Toda essa presença tem um custo — você é exatamente tão difícil de ignorar quanto de esconder.',
}

interface Props {
  sizes: Size[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function Step2Base({ sizes, selectedId, onSelect }: Props) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(var(--text-rgb),0.55)',
        marginBottom: '2rem',
        lineHeight: 1.8,
        maxWidth: 600,
      }}>
        Escolha o tamanho. Ele define seus atributos base, Corações e Sustento. É a
        fundação — tudo o mais modifica a partir daqui.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sizes.map(size => {
          const isSelected = selectedId === size.id
          return (
            <button
              key={size.id}
              onClick={() => onSelect(size.id)}
              className={`card text-left transition-all duration-200 ${isSelected ? 'card--selected' : ''}`}
              style={{
                background: 'var(--card)',
                borderRadius: 12,
                transform: isSelected ? 'translateY(-4px)' : 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <div style={{
                height: 2,
                background: isSelected
                  ? 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.8), transparent)'
                  : 'transparent',
              }} />

              <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/bases/${size.image ?? size.slug}.jpg`}
                  alt={`Ilustração do tamanho ${size.name}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 87%, var(--card))',
                }} />
              </div>

              <div style={{ padding: '1rem 1.25rem 1.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--gold)' : 'var(--text)',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  {size.name}
                  {SIZE_TOOLTIPS[size.slug] && (
                    <span
                      className="group"
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '1px solid rgba(var(--gold-rgb),0.4)',
                        color: 'var(--gold)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        cursor: 'help',
                      }}
                    >
                      i
                      <span
                        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150"
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 220,
                          background: 'var(--bg)',
                          border: '1px solid rgba(var(--gold-rgb),0.3)',
                          borderRadius: 8,
                          padding: '0.6rem 0.75rem',
                          fontFamily: 'var(--font-im-fell)',
                          fontStyle: 'italic',
                          fontSize: '0.72rem',
                          fontWeight: 400,
                          lineHeight: 1.5,
                          letterSpacing: 'normal',
                          textTransform: 'none',
                          color: 'var(--text)',
                          textAlign: 'left',
                          zIndex: 30,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          pointerEvents: 'none',
                        }}
                      >
                        {SIZE_TOOLTIPS[size.slug]}
                      </span>
                    </span>
                  )}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-im-fell)',
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  color: 'rgba(var(--text-rgb),0.5)',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                }}>
                  {size.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  {ATTR_LABELS.map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                      style={{
                        background: 'rgba(var(--gold-rgb),0.04)',
                        border: '1px solid rgba(var(--gold-rgb),0.09)',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                      }}
                    >
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
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isSelected ? 'var(--gold)' : 'var(--text)',
                      }}>
                        {String(size[key])}
                      </span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                  }}>
                    ✓ Selecionado
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
