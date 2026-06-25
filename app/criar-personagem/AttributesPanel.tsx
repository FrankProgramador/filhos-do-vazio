import type { Atributos, Size } from '@/app/lib/gameData'

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

function fmtAttr(v: number) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

interface Props {
  size: Size
  atributos: Atributos
}

export default function AttributesPanel({ size, atributos }: Props) {
  return (
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
  )
}
