'use client'

import { useEffect, useRef } from 'react'
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
    image: '/locais.jpeg',
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
  const bannerRef = useRef<HTMLDivElement>(null)
  const imgRef    = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const banner = bannerRef.current
    const img    = imgRef.current
    if (!banner || !img) return

    const update = () => {
      const rect = banner.getBoundingClientRect()
      const vh   = window.innerHeight

      // overflow = quanto a seção já subiu além da base do viewport
      // 0 enquanto section.bottom >= vh (seção ainda entrando ou não entrou) → mostra topo
      // cresce conforme a seção sobe, até 100% quando sai pelo topo
      const overflow = Math.max(0, vh - rect.bottom)
      const pct = Math.min(100, (overflow / rect.height) * 130)
      img.style.objectPosition = `center ${pct}%`
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section id="reino" aria-labelledby="reino-title" style={{ background: 'var(--bg)', padding: '5rem 0' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-center mb-4" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}

        </div>
        <p className="lnd-label" aria-hidden>Conheça o mundo de filhos do vazio</p>
         <div className="flex justify-center mb-4" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/icons/kishar-icon.png"
            alt=""
            style={{ width: 50, height: 40, padding: '10px 10px 0px 10px', filter: 'drop-shadow(0 0 12px rgba(var(--gold-rgb),.55))' }}
          />
        <h2
          id="reino-title"
          className="text-center section-heading-glow"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}
        >
          Crosta Eterna
        </h2>
        </div>

        <style>{`
          .crosta-banner {
            position: relative; border-radius: 10px; overflow: hidden;
            margin-bottom: 3.5rem;
            box-shadow: inset 0 0 0 1px rgba(var(--gold-rgb),.12), 0 8px 40px rgba(0,0,0,.55);
          }
          .crosta-img {
            width: 100%; display: block;
            height: clamp(320px, 45vw, 520px);
            object-fit: cover;
            object-position: center 0%;
          }
          .comic-box {
            position: absolute;
            background: #F0E6C8; border: 2.5px solid #0D1018;
            padding: .55rem 1rem;
          }
          .comic-box p {
            font-family: var(--font-im-fell); font-style: italic;
            color: #0D1018; margin: 0; line-height: 1.55;
            font-size: clamp(0.72rem, 1.6vw, 1.2rem);
          }
          .comic-box-1 {
            top: 10%; left: 3%; max-width: min(55%, 630px);
            transform: skewX(-4deg); box-shadow: 4px 4px 0 #0D1018;
          }
          .comic-box-1 p { transform: skewX(4deg); }
          .comic-box-2 {
            top: 42%; right: 3%; max-width: min(38%, 260px);
            transform: skewX(3deg); box-shadow: -4px 4px 0 #0D1018;
          }
          .comic-box-2 p { transform: skewX(-3deg); }
          .comic-box-3 {
            bottom: 10%; left: 50%; max-width: min(65%, 480px);
            transform: translateX(-50%) skewX(-3deg); box-shadow: 4px 4px 0 #0D1018;
          }
          .comic-box-3 p { transform: skewX(3deg); }

          @media (max-width: 639px) {
            .crosta-img { height: clamp(280px, 75vw, 360px); }
            .comic-box p { font-size: 0.72rem; }
            .comic-box-1 { top: 4%; left: 2%; max-width: 84vw; }
            .comic-box-2 { top: auto; bottom: 38%; right: 2%; max-width: 56vw; }
            .comic-box-3 { bottom: 3%; max-width: 78vw; }
          }
        `}</style>

        {/* Banner panorâmico com parallax via scroll */}
        <div className="crosta-banner" ref={bannerRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            className="crosta-img"
            src="/img/crosta-eterna.png"
            alt="Vista panorâmica da Crosta Eterna — um reino construído sobre a carapaça de um colosso"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,12,18,.45) 0%, transparent 18%, transparent 82%, rgba(10,12,18,.45) 100%)', pointerEvents: 'none' }} aria-hidden />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, var(--bg) 100%)', pointerEvents: 'none' }} aria-hidden />

          <div className="comic-box comic-box-1">
            <p>A Crosta Eterna é um reino construído sobre a carapaça de um colosso ancestral.</p>
          </div>
          <div className="comic-box comic-box-2">
            <p>No topo repousa a capital. Vilarejos se agarram às placas de quitina como musgo sobre uma pedra.</p>
          </div>
          <div className="comic-box comic-box-3">
            <p>Sob seus pés, túneis escondem ruínas, criaturas e segredos que precedem a própria história.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ icon, title, text, alt, image, href, cta }) => (
            <article key={title} className="lnd-card">
              {image ? (
                <div className="lnd-card-img" style={{ padding: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="lnd-card-img" role="img" aria-label={alt}>
                  <span style={{ fontSize: '2.2rem', opacity: .5, position: 'relative', zIndex: 1 }} aria-hidden>{icon}</span>
                  <span style={{ position: 'relative', zIndex: 1 }}>{title}</span>
                </div>
              )}
              <div className="p-6">
                <h3
                  className="mb-3"
                  style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '.06em' }}
                >
                  {title}
                </h3>
                <p style={{ color: 'rgba(var(--text-rgb),.55)', fontSize: '1rem', lineHeight: 1.75, fontFamily: 'var(--font-im-fell)' }}>
                  {text}
                </p>
                {href && cta && (
                  <div className="mt-5">
                    <Link
                      href={href}
                      className="hk-btn hk-btn-soul"
                      style={{ fontSize: '.82rem', padding: '.65rem 1.4rem', borderRadius: 6 }}
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
