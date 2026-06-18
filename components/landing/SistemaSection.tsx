const rules = [
  {
    icon: '🎲',
    title: '📜 Como Jogar',
    text: 'Testes baseados em dados de seis faces. Sucessos em 5 ou 6. Rerrolagens com atributos ×1.5. Simples e rápido — foco na narrativa, não nas regras.',
  },
  {
    icon: '⚔️',
    title: '⚔️ Combate',
    text: 'Ações custam Estamina. Ataques, esquivas, aparações e movimentação tática em grid. Gerencie sua Estamina a cada rodada para sobreviver.',
  },
  {
    icon: '✨',
    title: '✨ Magia',
    text: 'Use Alma para conjurar feitiços. Essência desbloqueia poderes de Sonho e Pesadelo. Foque para curar ou potencializar seus ataques.',
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
          📖 Sistema de Regras
        </h2>
        <p className="text-center mb-12" style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '.95rem', maxWidth: 560, margin: '0 auto 3rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Elegante, rápido e baseado em dados de seis faces. Aprenda em minutos, domine em sessões.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map(({ icon, title, text }) => (
            <div key={title} className="rules-card">
              <span style={{ fontSize: '2.2rem', marginBottom: '1rem', display: 'block' }} aria-hidden>{icon}</span>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '.75rem', letterSpacing: '.05em' }}>
                {title}
              </h3>
              <p style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '.88rem', lineHeight: 1.8, fontFamily: 'var(--font-im-fell)' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
