import Link from 'next/link'

const particles = Array.from({ length: 28 }, (_, i) => ({
  size: 2 + (i % 4),
  isGold: i % 3 === 0,
  left: (i * 7 + 3) % 100,
  bottom: (i * 13) % 80,
  duration: 3 + (i % 6),
  delay: (i * 0.5) % 6,
}))

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Seção principal"
      style={{ paddingTop: 44, background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Banner ── */}
      <div
        className="relative flex justify-center items-center overflow-hidden"
        style={{ width: '100%', height: 400, background: 'var(--bg)' }}
      >
        {/* Partículas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {particles.map((p, i) => (
            <span
              key={i}
              className="particle absolute rounded-full"
              style={{
                width: p.size,
                height: p.size * 1.4,
                left: `${p.left}%`,
                bottom: p.bottom,
                background: p.isGold
                  ? `rgba(var(--gold-light-rgb),${0.6 + (i % 3) * 0.1})`
                  : `rgba(var(--void-glow-rgb),${0.5 + (i % 3) * 0.08})`,
                boxShadow: p.isGold
                  ? `0 0 ${p.size * 2}px ${p.size}px rgba(var(--gold-light-rgb),0.4)`
                  : `0 0 ${p.size * 2}px ${p.size}px rgba(var(--void-glow-rgb),0.35)`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Imagem com máscara de fade nas bordas */}
        <picture>
          <source media="(max-width: 768px)" srcSet="/banner2.jpeg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banner.jpeg"
            alt="Arte de capa: Filhos do Vazio — ilustração da minha filha"
            className="hero-img-mask"
          />
        </picture>
      </div>

      {/* ── Texto abaixo do banner ── */}
      <div className="flex flex-col items-center gap-4 text-center px-6 pt-10 pb-5 relative z-10">
        {/* Ornamento */}
        <div className="flex items-center gap-4" aria-hidden>
          <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
          <span style={{ color: 'var(--gold)', fontSize: '.95rem', opacity: .85, textShadow: '0 0 10px rgba(var(--gold-rgb),.7)' }}>◈</span>
          <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
        </div>

        <p
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: '.58rem', letterSpacing: '.38em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
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
          style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(.82rem, 1.5vw, .98rem)', color: 'rgba(var(--text-rgb),.72)', lineHeight: 1.85, maxWidth: 340 }}
        >
          Aventuras em um reino decadente de insetos.<br />
          Forje seu legado nas sombras de Hallownest.
        </p>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-wrap justify-center gap-4 px-6 pt-5 pb-10">
        <Link href="/criar-personagem" className="btn-hero">✦ Criar Herói</Link>
        <Link
          href="#reino"
          className="hk-btn hk-btn-soul"
          style={{ fontSize: '.8rem', padding: '.85rem 2.2rem', borderRadius: 8 }}
        >
          Explorar o Mundo
        </Link>
      </div>
    </section>
  )
}
