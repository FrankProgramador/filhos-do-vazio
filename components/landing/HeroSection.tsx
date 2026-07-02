import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Seção principal"
      style={{ paddingTop: 44, background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Banner ── */}
      <div
        className="relative flex overflow-hidden"
        style={{ width: '100%', height: 460, background: 'var(--bg)' }}
      >
        {/* Parallax caverna */}
        <div className="pl-wrap" aria-hidden>
          <div className="pl-track pl-sky">
            {Array.from({ length: 6 }, (_, i) => (
              <img key={i} src="/img/bases/parallax/Sky.png" alt="" />
            ))}
          </div>
          <div className="pl-track pl-down">
            {Array.from({ length: 6 }, (_, i) => (
              <img key={i} src="/img/bases/parallax/DownLayer.png" alt="" />
            ))}
          </div>
          <div className="pl-track pl-mid">
            {Array.from({ length: 6 }, (_, i) => (
              <img key={i} src="/img/bases/parallax/MiddleLayer.png" alt="" />
            ))}
          </div>
          <div className="pl-track pl-top">
            {Array.from({ length: 6 }, (_, i) => (
              <img key={i} src="/img/bases/parallax/TopLayer.png" alt="" />
            ))}
          </div>
          <div className="pl-light" />
        </div>

        {/* Conteúdo: desenho à esquerda, texto à direita */}
        <div
          className="relative z-10 grid md:grid-cols-[1fr_1.3fr] gap-8 w-full max-w-300 mx-auto px-6"
          style={{ height: '100%', gridTemplateRows: '100%' }}
        >
          {/* Mascote flutuante */}
          <div className="flex items-center justify-center md:justify-start h-full">
            <div
              className="mascot-float"
              style={{
                filter: 'drop-shadow(0 0 28px rgba(138,204,197,0.22)) drop-shadow(0 8px 32px rgba(0,0,0,0.6))',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/bases/mascote.png"
                alt="Mascote — Filhos do Vazio"
                style={{ height: 320, width: 'auto', display: 'block', transform: 'scaleX(-1)' }}
              />
            </div>
          </div>

          {/* Texto e CTAs */}
          <div
            className="flex flex-col items-center justify-center gap-4 text-center h-full"
            style={{
              background: 'rgba(0,0,0,0.8)',
              clipPath: 'polygon(0% 0%, calc(100% - 60px) 0%, 100% 100%, 60px 100%)',
              margin: 0,
              padding: '2rem 3.5rem',
            }}
          >
            {/* Ornamento */}
            <div className="flex items-center gap-4" aria-hidden>
              <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
              <span style={{ color: 'var(--gold)', fontSize: '.95rem', opacity: .85, textShadow: '0 0 10px rgba(var(--gold-rgb),.7)' }}>◈</span>
              <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
            </div>

            <p
              style={{ fontFamily: 'var(--font-cinzel)', fontSize: '.68rem', letterSpacing: '.38em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Um RPG de mesa inspirado em Hollow Knight
            </p>

            <h1
              className="gold-glow"
              style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text)' }}
            >
              Filhos<br />do Vazio
            </h1>

            <p
              style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(.95rem, 1.7vw, 1.1rem)', color: 'rgba(var(--text-rgb),.72)', lineHeight: 1.85, maxWidth: 360 }}
            >
              Aventuras em um reino decadente de insetos.<br />
              Forje seu legado nas sombras de Hallownest.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/cadastro" className="btn-hero">✦ Criar Conta</Link>
              <Link
                href="#reino"
                className="hk-btn hk-btn-soul"
                style={{ fontSize: '.9rem', padding: '.85rem 2.2rem', borderRadius: 8 }}
              >
                Explorar o Mundo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
