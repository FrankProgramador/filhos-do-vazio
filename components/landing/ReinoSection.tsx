import Link from 'next/link'

const cards = [
  {
    icon: '📜',
    title: 'História',
    text: 'O Reino de Hallownest caiu há eras, mas seus ecos ainda moldam o destino dos insetos. Descubra a verdade por trás do Grande Selo e de um reino que acreditou ter derrotado a morte.',
    alt: 'Relevo antigo de um rei inseto e um selo quebrado com fissuras',
    href: '/historia',
    cta: 'Ler a História →',
  },
  {
    icon: '🏚️',
    title: 'Locais',
    text: 'Das cavernas esquecidas às cidadelas em ruínas, cada região guarda segredos e perigos. Antigas relíquias esperam por aqueles corajosos o suficiente para procurá-las.',
    alt: 'Ilustração de uma caverna com estalactites e insetos',
    href: '/locais',
    cta: 'Explorar Locais →',
  },
  {
    icon: '⚔️',
    title: 'Facções',
    text: 'Tribos nômades, guerreiros solitários e cultos antigos disputam o poder nas sombras. Cada aliança tem seu preço, cada traição, suas consequências.',
    alt: 'Silhuetas de três insetos com armas distintas',
    href: '/faccoes',
    cta: 'Ver Facções →',
  },
]

export default function ReinoSection() {
  return (
    <section id="reino" aria-labelledby="reino-title" style={{ background: 'var(--bg)', padding: '5rem 0' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="lnd-label" aria-hidden>Lore &amp; Mundo</p>
        <h2
          id="reino-title"
          className="text-center mb-4 section-heading-glow"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}
        >
          🌿 O Reino em Ruínas
        </h2>
        <p className="text-center mb-12" style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '.95rem', maxWidth: 560, margin: '0 auto 3rem' }}>
          Explore os fragmentos de Hallownest — um reino que caiu, mas nunca foi esquecido.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ icon, title, text, alt, href, cta }) => (
            <article key={title} className="lnd-card">
              <div className="lnd-card-img" role="img" aria-label={alt}>
                <span style={{ fontSize: '2.2rem', opacity: .5, position: 'relative', zIndex: 1 }} aria-hidden>{icon}</span>
                <span style={{ position: 'relative', zIndex: 1 }}>{title}</span>
              </div>
              <div className="p-6">
                <h3
                  className="mb-3"
                  style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '.06em' }}
                >
                  {title}
                </h3>
                <p style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '.9rem', lineHeight: 1.75, fontFamily: 'var(--font-im-fell)' }}>
                  {text}
                </p>
                {href && cta && (
                  <div className="mt-5">
                    <Link
                      href={href}
                      className="hk-btn hk-btn-soul"
                      style={{ fontSize: '.72rem', padding: '.65rem 1.4rem', borderRadius: 6 }}
                    >
                      {cta}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
