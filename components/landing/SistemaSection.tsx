import Link from 'next/link'

const rules = [
  {
    icon: '📖',
    title: 'Regras',
    text: 'Testes baseados em dados de seis faces. Sucessos em 5 ou 6. O Toque de Vaskrin, combate, alma e Fragmentos do Vazio — tudo em um só guia.',
    href: '/como-jogar',
    cta: 'Ler as Regras →',
  },
  {
    icon: '🦋',
    title: 'Traços',
    text: 'Comuns, marcantes, raros e de personalidade. Consulte o compêndio completo de traços com seus efeitos mecânicos e raridades.',
    href: '/como-jogar/tracos',
    cta: 'Ver Traços →',
  },
  {
    icon: '🎒',
    title: 'Itens',
    text: 'Armas, armaduras, ferramentas e consumíveis disponíveis para a criação de personagem. Busque e filtre por tipo.',
    href: '/como-jogar/itens',
    cta: 'Ver Itens →',
  },
]

export default function SistemaSection() {
  return (
    <section id="sistema" aria-labelledby="sistema-title" style={{ background: 'var(--bg)', padding: '5rem 0' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="lnd-label" aria-hidden>Mecânicas</p>
        <h2
          id="sistema-title"
          className="text-center mb-4 section-heading-glow"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}
        >
          📖 Como Jogar
        </h2>
        <p className="text-center mb-12" style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 3rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Elegante, rápido e baseado em dados de seis faces. Aprenda em minutos, domine em sessões.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map(({ icon, title, text, href, cta }) => (
            <div key={title} className="rules-card flex flex-col">
              <span style={{ fontSize: '2.2rem', marginBottom: '1rem', display: 'block' }} aria-hidden>{icon}</span>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '.75rem', letterSpacing: '.05em' }}>
                {title}
              </h3>
              <p style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '1rem', lineHeight: 1.8, fontFamily: 'var(--font-im-fell)', flex: 1 }}>
                {text}
              </p>
              <div className="mt-5">
                <Link href={href} className="hk-btn hk-btn-soul" style={{ fontSize: '.82rem', padding: '.65rem 1.4rem', borderRadius: 6 }}>
                  {cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
