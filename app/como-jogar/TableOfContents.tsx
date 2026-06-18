'use client'

type Section = { id: string; label: string }

export default function TableOfContents({ sections }: { sections: Section[] }) {
  return (
    <nav aria-label="Índice do conteúdo">
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem',
        }}
      >
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              style={{
                display: 'block',
                padding: '0.3rem 0.5rem',
                fontSize: '0.8rem',
                color: 'var(--hk-dim)',
                textDecoration: 'none',
                borderRadius: 4,
                lineHeight: 1.4,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = 'var(--hk-soul-pale)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(74,158,255,0.06)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = 'var(--hk-dim)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
