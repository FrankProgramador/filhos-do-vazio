import type { Trilha, Atributos } from '@/app/lib/mockData'

interface Props {
  trilhas: Trilha[]
  selectedId: string | null
  onSelect: (id: string) => void
  atributos: Atributos
}

const TIPO_CONFIG = {
  marcial: {
    color: 'rgba(212,168,67,0.9)',
    border: 'rgba(212,168,67,0.32)',
    bg: 'rgba(212,168,67,0.06)',
    glow: 'rgba(212,168,67,0.12)',
  },
  mistico: {
    color: 'rgba(74,158,255,0.95)',
    border: 'rgba(74,158,255,0.32)',
    bg: 'rgba(74,158,255,0.06)',
    glow: 'rgba(74,158,255,0.12)',
  },
}

function TrailCard({
  trilha,
  isSelected,
  onSelect,
}: {
  trilha: Trilha
  isSelected: boolean
  onSelect: () => void
}) {
  const cfg = TIPO_CONFIG[trilha.tipo]
  return (
    <button
      onClick={onSelect}
      className="text-left w-full transition-all duration-200"
      style={{
        padding: '1rem 1.125rem',
        background: isSelected ? cfg.bg : 'var(--hk-deep)',
        border: isSelected ? `2px solid ${cfg.border}` : '1px solid rgba(74,158,255,0.09)',
        borderRadius: 10,
        cursor: 'pointer',
        boxShadow: isSelected ? `0 0 20px ${cfg.glow}` : 'none',
        transform: isSelected ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trilha.thumbPlaceholder}
          alt={`${trilha.nome} — thumbnail disponível em breve`}
          style={{
            width: 72,
            height: 54,
            borderRadius: 5,
            objectFit: 'cover',
            border: `1px solid ${isSelected ? cfg.border : 'rgba(74,158,255,0.1)'}`,
            flexShrink: 0,
            transition: 'border-color 0.2s',
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isSelected ? cfg.color : 'var(--hk-pale)',
              transition: 'color 0.2s',
            }}>
              {trilha.nome}
            </span>
            <span className="ddb-badge" style={{
              fontSize: '0.48rem',
              color: cfg.color,
              borderColor: cfg.border,
              background: cfg.bg,
            }}>
              +{trilha.aumento} {trilha.barraAumentada}
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: 'rgba(216,228,248,0.48)',
            lineHeight: 1.65,
          }}>
            {trilha.beneficios}
          </p>
        </div>

        {isSelected && (
          <span style={{ color: cfg.color, fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>✓</span>
        )}
      </div>
    </button>
  )
}

export default function Step4Trilhas({ trilhas, selectedId, onSelect, atributos }: Props) {
  const marciais = trilhas.filter(t => t.tipo === 'marcial')
  const misticos = trilhas.filter(t => t.tipo === 'mistico')
  const selected = trilhas.find(t => t.id === selectedId)

  return (
    <div className="flex flex-col gap-6">
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(216,228,248,0.55)',
        lineHeight: 1.8,
        maxWidth: 560,
      }}>
        A trilha define o caminho do seu personagem:{' '}
        <strong style={{ fontStyle: 'normal', color: 'var(--hk-gold)' }}>Marcial</strong> para armas
        e combate físico, ou{' '}
        <strong style={{ fontStyle: 'normal', color: 'var(--hk-soul)' }}>Místico</strong> para magia
        e essência.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marcial column */}
        <div>
          <h3 className="flex items-center gap-2 mb-3" style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--hk-gold)',
          }}>
            ⚔️ Marcial
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(212,168,67,0.28), transparent)' }} />
          </h3>
          <div className="flex flex-col gap-3">
            {marciais.map(t => (
              <TrailCard
                key={t.id}
                trilha={t}
                isSelected={selectedId === t.id}
                onSelect={() => onSelect(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Místico column */}
        <div>
          <h3 className="flex items-center gap-2 mb-3" style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--hk-soul)',
          }}>
            ✨ Místico
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(74,158,255,0.28), transparent)' }} />
          </h3>
          <div className="flex flex-col gap-3">
            {misticos.map(t => (
              <TrailCard
                key={t.id}
                trilha={t}
                isSelected={selectedId === t.id}
                onSelect={() => onSelect(t.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trail effect preview */}
      {selected && (() => {
        const cfg = TIPO_CONFIG[selected.tipo]
        const baseBar = selected.barraAumentada === 'Estamina' ? atributos.estamina : atributos.alma
        return (
          <div style={{
            padding: '1rem 1.25rem',
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 8,
          }}>
            <p style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'rgba(216,228,248,0.62)',
              lineHeight: 1.7,
              margin: 0,
            }}>
              Com a trilha{' '}
              <strong style={{ fontStyle: 'normal', color: cfg.color }}>{selected.nome}</strong>,
              sua barra de{' '}
              <strong style={{ fontStyle: 'normal', color: cfg.color }}>{selected.barraAumentada}</strong>{' '}
              sobe de {baseBar} para{' '}
              <strong style={{ fontStyle: 'normal', color: cfg.color }}>{baseBar + selected.aumento}</strong>.
            </p>
          </div>
        )
      })()}
    </div>
  )
}
