import type { Base } from '@/app/lib/mockData'

const BASE_ICONS: Record<string, string> = {
  pequeno: '🦗',
  medio:   '🪲',
  grande:  '🦂',
}

const ATTR_LABELS: Array<[keyof Base['atributos'], string]> = [
  ['poder',      'Poder'],
  ['saber',      'Saber'],
  ['casca',      'Casca'],
  ['graca',      'Graça'],
  ['coracao',    'Coração'],
  ['estamina',   'Estamina'],
  ['alma',       'Alma'],
  ['velocidade', 'Velocidade'],
  ['fomeMaxima', 'Fome Máx.'],
]

interface Props {
  bases: Base[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function Step1Base({ bases, selectedId, onSelect }: Props) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(216,228,248,0.55)',
        marginBottom: '2rem',
        lineHeight: 1.8,
        maxWidth: 600,
      }}>
        A base define o tamanho e as capacidades naturais do seu inseto. Ela estabelece os
        atributos iniciais e o orçamento de Fome disponível para personalização.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {bases.map(base => {
          const isSelected = selectedId === base.id
          return (
            <button
              key={base.id}
              onClick={() => onSelect(base.id)}
              className="text-left overflow-hidden transition-all duration-200"
              style={{
                background: 'var(--hk-deep)',
                border: isSelected
                  ? '2px solid rgba(212,168,67,0.65)'
                  : '1px solid rgba(74,158,255,0.14)',
                borderRadius: 12,
                boxShadow: isSelected ? '0 0 28px rgba(212,168,67,0.12)' : 'none',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <div style={{
                height: 2,
                background: isSelected
                  ? 'linear-gradient(to right, transparent, rgba(212,168,67,0.8), transparent)'
                  : 'transparent',
              }} />

              <div style={{ position: 'relative', aspectRatio: '2/1', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={base.thumbPlaceholder}
                  alt={`${base.nome} — thumbnail disponível em breve`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 40%, var(--hk-deep))',
                }} />
                <span style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '2rem' }} aria-hidden>
                  {BASE_ICONS[base.id] ?? '🐛'}
                </span>
              </div>

              <div style={{ padding: '1rem 1.25rem 1.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--hk-gold)' : 'var(--hk-pale)',
                  marginBottom: '0.4rem',
                }}>
                  {base.nome}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-im-fell)',
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  color: 'rgba(216,228,248,0.5)',
                  marginBottom: '1rem',
                  lineHeight: 1.6,
                }}>
                  {base.descricao}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  {ATTR_LABELS.map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                      style={{
                        background: 'rgba(74,158,255,0.04)',
                        border: '1px solid rgba(74,158,255,0.09)',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.48rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--hk-dim)',
                      }}>
                        {label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isSelected ? 'var(--hk-gold)' : 'var(--hk-soul-pale)',
                      }}>
                        {base.atributos[key]}
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
                    color: 'var(--hk-gold)',
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
