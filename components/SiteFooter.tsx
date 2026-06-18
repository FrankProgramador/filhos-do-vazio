import Link from 'next/link'

const SoulIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(var(--gold-rgb),0.45)" strokeWidth="1.2" />
    <ellipse cx="16" cy="16" rx="4" ry="6" fill="none" stroke="rgba(var(--gold-rgb),0.6)" strokeWidth="1.2" />
    <circle cx="16" cy="16" r="2" fill="rgba(var(--gold-rgb),0.8)" />
  </svg>
)

const footerLinks = [
  { href: '/', label: '← Início' },
  { href: '#',             label: 'Sobre o Projeto' },
  { href: '#',             label: 'Contato' },
  { href: '#',             label: 'Política de Privacidade' },
]

export default function SiteFooter() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid rgba(var(--gold-rgb),0.1)',
        padding: '3rem 0 2rem',
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        <div
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-cinzel-decorative)',
            fontSize: '0.85rem',
            color: 'var(--text)',
            textShadow: '0 0 10px rgba(var(--gold-rgb),0.35)',
          }}
        >
          <SoulIcon />
          Filhos do Vazio
        </div>

        <div
          style={{
            width: 80,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.3), transparent)',
          }}
        />

        <nav className="flex flex-wrap justify-center items-center gap-1" aria-label="Links do rodapé">
          {footerLinks.map(({ href, label }, i) => (
            <span key={label} className="flex items-center gap-1">
              <Link
                href={href}
                className="ddb-nav-link"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {label}
              </Link>
              {i < footerLinks.length - 1 && (
                <span style={{ color: 'rgba(var(--gold-rgb),0.3)' }} aria-hidden>·</span>
              )}
            </span>
          ))}
        </nav>

        <p style={{ fontSize: '0.75rem', color: 'rgba(var(--text-muted-rgb),0.5)', lineHeight: 1.6, maxWidth: 540 }}>
          © 2026 Filhos do Vazio – Projeto de fãs não oficial inspirado em Hollow Knight (Team Cherry).<br />
          Todos os elementos de Hollow Knight são propriedade da Team Cherry.
        </p>
      </div>
    </footer>
  )
}
