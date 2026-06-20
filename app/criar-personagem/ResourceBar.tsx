interface Props {
  label: string
  current: number
  max: number
  /** Quando true, "current" é o valor restante (maior = melhor); quando false, é o gasto (menor = melhor). */
  invert?: boolean
}

export default function ResourceBar({ label, current, max, invert = false }: Props) {
  const ratio = max > 0 ? current / max : 0
  const pct = Math.max(0, Math.min(100, ratio * 100))
  const dangerRatio = invert ? 1 - ratio : ratio
  const color = dangerRatio >= 0.9 ? 'var(--error)' : dangerRatio >= 0.7 ? 'var(--warning)' : 'var(--gold)'

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
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', fontWeight: 700, color }}>
          {current} / {max}
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
