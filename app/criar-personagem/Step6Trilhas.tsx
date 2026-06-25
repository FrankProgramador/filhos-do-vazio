import type { Trilha } from '@/app/lib/gameData'

interface Props {
  trilhas: Trilha[]
  selectedId: number | null
  onSelect: (id: number) => void
}

const TIPO_CONFIG = {
  marcial: {
    color: 'rgba(var(--gold-rgb),0.9)',
    border: 'rgba(var(--gold-rgb),0.32)',
    bg: 'rgba(var(--gold-rgb),0.06)',
    glow: 'rgba(var(--gold-rgb),0.12)',
  },
  mistico: {
    color: 'rgba(var(--void-light-rgb),0.95)',
    border: 'rgba(var(--void-light-rgb),0.32)',
    bg: 'rgba(var(--void-light-rgb),0.06)',
    glow: 'rgba(var(--void-light-rgb),0.12)',
  },
}

function TrailCard({ trilha, isSelected, onSelect }: { trilha: Trilha; isSelected: boolean; onSelect: () => void }) {
  const cfg = TIPO_CONFIG[trilha.tipo]
  return (
    <button
      onClick={onSelect}
      className="text-left w-full transition-all duration-200"
      style={{
        padding: '1rem 1.125rem',
        background: isSelected ? cfg.bg : 'var(--card)',
        border: isSelected ? `2px solid ${cfg.border}` : '1px solid rgba(var(--gold-rgb),0.09)',
        borderRadius: 10,
        cursor: 'pointer',
        boxShadow: isSelected ? `0 0 20px ${cfg.glow}` : 'none',
        transform: isSelected ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isSelected ? cfg.color : 'var(--text)',
              transition: 'color 0.2s',
            }}>
              {trilha.nome}
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: 'rgba(var(--text-rgb),0.48)',
            lineHeight: 1.65,
          }}>
            {trilha.beneficios}
          </p>

          {trilha.abilities[0] && (
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(var(--gold-rgb),0.08)' }}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Nível 1</span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', fontWeight: 600, color: isSelected ? cfg.color : 'var(--text)' }}>
                  {trilha.abilities[0].name}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.42)', lineHeight: 1.55 }}>
                {trilha.abilities[0].description}
              </p>
            </div>
          )}
        </div>

        {isSelected && <span style={{ color: cfg.color, fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>✓</span>}
      </div>
    </button>
  )
}

export default function Step5Trilhas({ trilhas, selectedId, onSelect }: Props) {
  const marciais = trilhas.filter(t => t.tipo === 'marcial')
  const misticos = trilhas.filter(t => t.tipo === 'mistico')

  return (
    <div className="flex flex-col gap-6">
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(var(--text-rgb),0.55)',
        lineHeight: 1.8,
        maxWidth: 560,
      }}>
        A trilha define o caminho do seu personagem:{' '}
        <strong style={{ fontStyle: 'normal', color: 'var(--gold)' }}>Marcial</strong> para armas
        e combate físico, ou{' '}
        <strong style={{ fontStyle: 'normal', color: 'var(--void-glow)' }}>Místico</strong> para magia
        e essência.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="flex items-center gap-2 mb-3" style={{
            fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--gold)',
          }}>
            ⚔️ Marcial
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(var(--gold-rgb),0.28), transparent)' }} />
          </h3>
          <div className="flex flex-col gap-3">
            {marciais.map(t => (
              <TrailCard key={t.id} trilha={t} isSelected={selectedId === t.id} onSelect={() => onSelect(t.id)} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 mb-3" style={{
            fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--void-glow)',
          }}>
            ✨ Místico
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(var(--void-light-rgb),0.28), transparent)' }} />
          </h3>
          <div className="flex flex-col gap-3">
            {misticos.map(t => (
              <TrailCard key={t.id} trilha={t} isSelected={selectedId === t.id} onSelect={() => onSelect(t.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
