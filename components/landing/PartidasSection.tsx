import Link from 'next/link'

export default function PartidasSection() {
  return (
    <section id="partidas" aria-labelledby="partidas-title" style={{ background: 'var(--hk-deep)', padding: '5rem 0' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="lnd-label" aria-hidden>Plataforma</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div>
            <h2
              id="partidas-title"
              className="mb-5"
              style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 700, color: 'var(--hk-pale)', lineHeight: 1.3 }}
            >
              ⚔️ Gerenciamento de Partidas
            </h2>
            <p className="mb-8" style={{ color: 'rgba(216,228,248,.55)', fontSize: '.95rem', lineHeight: 1.85, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
              Organize suas mesas, compartilhe fichas, acompanhe a campanha e desafie seus amigos.
              Ferramentas para jogadores e mestres em um só lugar — da criação do herói até o fim da jornada.
            </p>
            <Link href="#" className="hk-btn hk-btn-soul" style={{ fontSize: '.8rem', padding: '.85rem 2.2rem', borderRadius: 8 }}>
              Explorar Campanhas
            </Link>
          </div>

          {/* Visual */}
          <div
            className="flex items-center justify-center mx-auto"
            role="img"
            aria-label="Ícone de engrenagens e dados representando gerenciamento de campanhas"
            style={{
              aspectRatio: '1',
              maxWidth: 320,
              width: '100%',
              background: '#131728',
              border: '1px solid rgba(74,158,255,.14)',
              borderRadius: 14,
              fontSize: '5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 40%, rgba(74,158,255,.08) 0%, transparent 70%)',
              }}
              aria-hidden
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 2,
                background: 'linear-gradient(to right, transparent, rgba(74,158,255,.55), transparent)',
              }}
              aria-hidden
            />
            <span style={{ position: 'relative', zIndex: 1 }} aria-hidden>⚙️</span>
          </div>
        </div>
      </div>
    </section>
  )
}
