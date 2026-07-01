import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Filhos do Vazio — Layout Teste',
  robots: { index: false, follow: false },
}

/*
  PALETA — fornecida + extensões
  #1f2937  → fundos de painel / cards (cinza-azulado escuro)
  #4b5563  → bordas / dividers / elementos médios
  #6b7280  → texto secundário / ícones inativos
  #d1fae5  → texto principal / menta-fantasma (perfeito pra HK)
  #fbbd23  → acento ouro-âmbar (limpo, cartoon, sem envelhecimento)

  Extensões necessárias:
  #0f1218  → bg raiz (mais escuro que #1f2937 pra criar profundidade)
  #0a0c14  → vazio absoluto (CTA, footer)
  #4A8FAA  → azul-alma de HK (mantido como acento secundário fresco)
  #06080E  → "tinta" dos contornos cartoon
*/

const C = {
  bg:        '#0f1218',
  bgPanel:   '#1f2937',  // paleta #1
  bgVoid:    '#0a0c14',
  mid:       '#4b5563',  // paleta #2 — bordas, divisores
  muted:     '#6b7280',  // paleta #3 — texto secundário
  mint:      '#d1fae5',  // paleta #4 — texto principal, menta-fantasma HK
  gold:      '#9161E8',  // roxo-violeta — um tom mais escuro/saturado
  soul:      '#4A8FAA',  // azul-alma HK — acento secundário
  soulLight: '#7ABFD4',  // versão clara para glows
  ink:       '#06080E',  // contorno cartoon (não preto puro)
}

const INK3 = `3px solid ${C.ink}`
const INK4 = `4px solid ${C.ink}`
const SH   = `4px 4px 0 ${C.ink}`
const SH6  = `6px 6px 0 ${C.ink}`
const SH8  = `8px 8px 0 ${C.ink}`

const GOLD_GLOW = `0 0 20px rgba(145,97,232,0.38), 0 0 52px rgba(145,97,232,0.13)`
const SOUL_GLOW = `0 0 20px rgba(74,143,170,0.32), 0 0 52px rgba(74,143,170,0.1)`

const css = `
  /* ── Tela ── */
  .c-page {
    background: ${C.bg};
    color: ${C.mint};
    /* pontilhado de teto de caverna */
    background-image:
      radial-gradient(circle, rgba(74,143,170,0.055) 1px, transparent 1px),
      radial-gradient(circle, rgba(251,189,35,0.03) 1px, transparent 1px);
    background-size: 36px 36px, 74px 74px;
    background-position: 0 0, 18px 18px;
  }

  /* ── NavBar ── */
  .c-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: ${C.bgPanel};
    border-bottom: ${INK4};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 56px;
  }
  .c-nav-logo {
    font-family: var(--font-cinzel-decorative), serif;
    font-weight: 900; font-size: 1.05rem; letter-spacing: .04em;
    color: ${C.mint}; text-decoration: none;
    display: flex; align-items: center; gap: .55rem;
  }
  .c-nav-logo span { color: ${C.gold}; }
  .c-nav-links {
    display: flex; align-items: center; gap: .25rem;
    list-style: none; margin: 0; padding: 0;
  }
  .c-nav-links a {
    font-family: var(--font-cinzel), serif;
    font-weight: 700; font-size: .78rem;
    letter-spacing: .08em; text-transform: uppercase;
    color: ${C.muted}; text-decoration: none;
    padding: .35rem .75rem; border-radius: 6px;
    transition: color .15s, background .15s;
  }
  .c-nav-links a:hover { color: ${C.mint}; background: rgba(255,255,255,.05); }
  .c-nav-cta {
    font-family: var(--font-cinzel), serif;
    font-weight: 900; font-size: .78rem;
    letter-spacing: .08em; text-transform: uppercase;
    color: ${C.ink} !important;
    background: ${C.gold} !important;
    border: ${INK3}; border-radius: 100px;
    padding: .35rem 1.1rem !important;
    box-shadow: 3px 3px 0 ${C.ink};
    transition: transform .12s, box-shadow .12s !important;
  }
  .c-nav-cta:hover {
    transform: scale(1.06); background: ${C.gold} !important;
    box-shadow: 5px 5px 0 ${C.ink} !important;
  }

  /* ── Botões ── */
  .btn-c {
    display: inline-flex; align-items: center; gap: .5rem;
    font-family: var(--font-cinzel), serif;
    font-weight: 900; font-size: 1.05rem;
    letter-spacing: .06em; text-transform: uppercase;
    text-decoration: none; white-space: nowrap; cursor: pointer;
    color: ${C.ink}; background: ${C.gold};
    border: ${INK4}; border-radius: 100px;
    padding: .85rem 2.4rem;
    box-shadow: ${SH8}, ${GOLD_GLOW};
    transition: transform .12s, box-shadow .12s;
  }
  .btn-c:hover { transform: scale(1.07) translateY(-3px); box-shadow: 10px 10px 0 ${C.ink}, ${GOLD_GLOW}; }
  .btn-c:active { transform: scale(.96); box-shadow: 3px 3px 0 ${C.ink}; }

  .btn-soul {
    color: ${C.ink}; background: ${C.soul};
    box-shadow: ${SH8}, ${SOUL_GLOW};
  }
  .btn-soul:hover { box-shadow: 10px 10px 0 ${C.ink}, ${SOUL_GLOW}; }

  .btn-amber {
    color: ${C.ink}; background: #fbbd23;
    box-shadow: ${SH8}, 0 0 18px rgba(251,189,35,0.3);
  }
  .btn-amber:hover { box-shadow: 10px 10px 0 ${C.ink}, 0 0 28px rgba(251,189,35,0.4); }

  /* ── Mascote flutua ── */
  @keyframes float {
    0%, 100% { transform: translateY(0)    rotate(-1.5deg); }
    45%       { transform: translateY(-16px) rotate(1.5deg); }
    75%       { transform: translateY(-7px)  rotate(-.5deg); }
  }
  .mascot-float { animation: float 3.2s ease-in-out infinite; }

  /* ── Pulso de alma ── */
  @keyframes soulPulse {
    0%, 100% { opacity: .45; transform: scale(1); }
    50%       { opacity: .85; transform: scale(1.05); }
  }
  .soul-pulse { animation: soulPulse 2.5s ease-in-out infinite; }

  /* ── Parallax de caverna — 3 planos de profundidade ── */
  @keyframes caveFar  { from { background-position: 0 0; }      to { background-position: -80px 0; }  }
  @keyframes caveMid  { from { background-position: 40px 20px; } to { background-position: -100px 20px; } }
  @keyframes caveNear { from { background-position: 15px 32px; } to { background-position: -45px 32px; } }

  /* Plano distante: partículas pequenas, devagar, quase invisíveis */
  .cave-far {
    background-image: radial-gradient(circle, rgba(145,97,232,0.12) 1px, transparent 1px);
    background-size: 80px 55px;
    animation: caveFar 9s linear infinite;
  }
  /* Plano médio: partículas azul-alma, velocidade moderada */
  .cave-mid {
    background-image: radial-gradient(circle, rgba(74,143,170,0.18) 1.5px, transparent 1.5px);
    background-size: 140px 80px;
    animation: caveMid 5.5s linear infinite;
  }
  /* Plano próximo: partículas menta, rápidas — passam voando */
  .cave-near {
    background-image: radial-gradient(circle, rgba(209,250,229,0.09) 2px, transparent 2px);
    background-size: 60px 44px;
    animation: caveNear 2.8s linear infinite;
  }

  /* ── Linhas de velocidade (motion streaks) ── */
  @keyframes streak {
    from { transform: translateX(110vw); }
    to   { transform: translateX(-110vw); }
  }

  /* ── Balão de fala ── */
  .bubble {
    position: relative;
    background: ${C.bgPanel}; color: ${C.mint};
    border: ${INK4}; border-radius: 18px;
    padding: 1.25rem 1.5rem; box-shadow: ${SH6};
  }
  .bubble::after {
    content: '';
    position: absolute; bottom: -20px; left: 28px;
    border: 12px solid transparent;
    border-top: 20px solid ${C.ink};
  }
  .bubble::before {
    content: '';
    position: absolute; bottom: -13px; left: 30px; z-index: 1;
    border: 10px solid transparent;
    border-top: 14px solid ${C.bgPanel};
  }

  /* ── Cards ── */
  .feat-card { transition: transform .2s, box-shadow .2s; }
  .feat-card:hover {
    transform: translateY(-5px) rotate(0deg) !important;
    box-shadow: 10px 10px 0 ${C.ink} !important;
  }

  /* ── Slide de entrada ── */
  @keyframes slideIn {
    from { transform: translateY(28px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .slide-in { animation: slideIn .6s ease both; }
  .d1 { animation-delay: .1s; }
  .d2 { animation-delay: .22s; }
  .d3 { animation-delay: .34s; }
`

/* ─── SUB-COMPONENTES ─────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: 'var(--font-cinzel), serif',
      fontSize: '0.72rem', fontWeight: 900,
      letterSpacing: '0.26em', textTransform: 'uppercase',
      color: C.gold,
      border: `2px solid ${C.gold}`,
      borderRadius: 6,
      padding: '0.22rem 0.9rem',
      boxShadow: `3px 3px 0 ${C.ink}`,
      background: `rgba(251,189,35,0.07)`,
    }}>
      {text}
    </div>
  )
}

function FeatCard({
  glyph, glyphNote, title, text, delay, rotation,
}: {
  glyph: string; glyphNote: string; title: string; text: string
  delay: string; rotation: string
}) {
  return (
    <div
      className={`feat-card slide-in`}
      style={{
        animationDelay: delay,
        background: C.bgPanel,
        border: `3px solid ${C.mid}`,
        borderRadius: 16,
        boxShadow: SH8,
        padding: '2rem 1.75rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        transform: `rotate(${rotation})`,
      }}
    >
      <div
        style={{
          width: 72, height: 72,
          border: `3px solid ${C.soul}`,
          borderRadius: '50%',
          background: `rgba(74,143,170,0.08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', boxShadow: SOUL_GLOW,
        }}
        title={`Arte: ${glyphNote}`}
      >
        {glyph}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-cinzel), serif',
        fontSize: '1.15rem', fontWeight: 900,
        color: C.gold,
        letterSpacing: '0.02em',
        textShadow: `2px 2px 0 ${C.ink}`,
      }}>
        {title}
      </h3>

      <p style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic',
        fontSize: '0.97rem', lineHeight: 1.72, color: C.muted,
      }}>
        {text}
      </p>
    </div>
  )
}

/* ─── PÁGINA ──────────────────────────────────────── */

export default function TestePage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ══ BARRA SUPERIOR ══════════════════════════════ */}
      <nav className="c-nav" aria-label="Navegação principal">
        <Link href="/" className="c-nav-logo">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke={C.gold} strokeWidth="2" />
            <ellipse cx="16" cy="16" rx="4" ry="6" fill="none" stroke={C.gold} strokeWidth="1.8" />
            <circle cx="16" cy="16" r="2" fill={C.gold} />
          </svg>
          Filhos <span>do Vazio</span>
        </Link>

        <ul className="c-nav-links">
          <li><a href="#reino">Mundo</a></li>
          <li><a href="/como-jogar">Como Jogar</a></li>
          <li><a href="/criar-personagem">Criar Personagem</a></li>
          <li><Link href="/entrar" className="c-nav-cta">Entrar</Link></li>
        </ul>
      </nav>

      <main className="c-page" style={{ minHeight: '100vh' }}>

        {/* ══ HERO ════════════════════════════════════════ */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          minHeight: 680, display: 'flex', alignItems: 'center',
        }}>
          {/* ── Parallax de caverna — fundo/meio/perto ── */}
          <div aria-hidden className="cave-far"  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div aria-hidden className="cave-mid"  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div aria-hidden className="cave-near" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {/* ── Linhas de velocidade ── */}
          {([
            { top: '14%', h: 1,   w: 180, op: 0.07, dur: '1.1s', del: '0s'   },
            { top: '28%', h: 1.5, w: 280, op: 0.05, dur: '1.8s', del: '0.4s' },
            { top: '42%', h: 1,   w: 120, op: 0.09, dur: '0.9s', del: '1.1s' },
            { top: '56%', h: 2,   w: 340, op: 0.04, dur: '2.2s', del: '0.2s' },
            { top: '68%', h: 1,   w: 200, op: 0.06, dur: '1.5s', del: '0.7s' },
            { top: '80%', h: 1.5, w: 150, op: 0.08, dur: '1.0s', del: '1.5s' },
            { top: '22%', h: 1,   w: 90,  op: 0.05, dur: '2.5s', del: '0.9s' },
            { top: '75%', h: 1,   w: 260, op: 0.04, dur: '1.3s', del: '1.8s' },
          ] as const).map(({ top, h, w, op, dur, del }, i) => (
            <div
              key={i} aria-hidden
              style={{
                position: 'absolute', top, left: 0,
                height: h, width: w,
                borderRadius: 2,
                background: i % 3 === 0
                  ? `rgba(145,97,232,${op})`
                  : i % 3 === 1
                  ? `rgba(74,143,170,${op})`
                  : `rgba(209,250,229,${op * 0.7})`,
                animation: `streak ${dur} linear ${del} infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Névoa de alma (sobre as partículas) */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 65% 55% at 28% 50%, rgba(74,143,170,0.07) 0%, transparent 68%)`,
            pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '8rem 2rem 5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '3.5rem', alignItems: 'center',
            position: 'relative', zIndex: 1, width: '100%',
          }}>

            {/* Mascote */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/*
                ┌────────────────────────────────────────────────────┐
                │  ARTE — A Sentinela (hero)                         │
                │                                                    │
                │  Estilo: Batman TAS × Hollow Knight                │
                │  Personagem: cavaleiro-inseto, capa esfarrapada,   │
                │  elmo com fenda luminosa (olhos = azul-alma        │
                │  #4A8FAA brilhando para fora).                     │
                │  Postura: contemplativa, espada cravada no chão.  │
                │  Paleta corpo: #1f2937 + #4b5563 (cel shading)    │
                │  Detalhes ouro: #fbbd23 em parafusos do elmo      │
                │  Glow dos olhos: #7ABFD4                          │
                │  Contorno: 4px #06080E                            │
                │  Tamanho: 320×400px, PNG sem fundo                │
                └────────────────────────────────────────────────────┘
              */}
              <div
                className="mascot-float"
                style={{
                  position: 'relative',
                  filter: `drop-shadow(0 0 24px rgba(74,143,170,0.4)) drop-shadow(0 8px 32px rgba(0,0,0,0.7))`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/bases/mascote.png"
                  alt="Mascote — Filhos do Vazio"
                  style={{
                    width: 320,
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    transform: 'scaleX(-1)',
                  }}
                />
              </div>
            </div>

            {/* Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionLabel text="RPG de Mesa" />

              <h1 style={{
                fontFamily: 'var(--font-cinzel-decorative), serif',
                fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
                fontWeight: 900, lineHeight: 0.98,
                color: C.mint,
                textShadow: `3px 3px 0 ${C.ink}`,
                letterSpacing: '-0.01em',
              }}>
                Filhos<br />
                <span style={{ color: C.gold, textShadow: `3px 3px 0 ${C.ink}, ${GOLD_GLOW}` }}>
                  do Vazio
                </span>
              </h1>

              {/* linha art-déco */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 2, background: C.soul, opacity: 0.55 }} />
                <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, rgba(74,143,170,0.45), transparent)` }} />
              </div>

              <p style={{
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                fontSize: '1.07rem', lineHeight: 1.82,
                color: C.muted, maxWidth: 360,
              }}>
                Um reino antigo que acreditou ter derrotado a morte.<br />
                Ele errou. As sombras, não.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                <Link href="/cadastro" className="btn-c">✦ Descender</Link>
                <Link href="/como-jogar" className="btn-c btn-amber">Como Jogar</Link>
              </div>
            </div>
          </div>

          {/* Corte diagonal */}
          <div aria-hidden style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
            background: C.bgPanel,
            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
          }} />
        </section>

        {/* ══ CARDS HQ — Mignola × BatmanTAS × 90s cartoon ══ */}
        {/*
          Paleta interna desta seção:
          bg card  #0B0C11   — noir profundo, quase preto com toque índigo
          âmbar    #D4841A   — luz de tocha, calor
          bio      #2FBFB8   — bioluminescente dos túneis de Kishar
          vermelho #7A1818   — perigo, poder corrompido
          texto    #DDD5C8   — sujo, envelhecido, não branco
        */}
        <section id="reino" style={{ background: '#0A0B10', padding: '4rem 2rem 5rem', borderTop: INK4 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Linha 1: O Mundo + O Reino */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

              {/* Card 1 — O Mundo */}
              <div style={{
                background: '#0B0C11',
                border: INK4, borderRadius: 8,
                boxShadow: `8px 8px 0 ${C.ink}`,
                overflow: 'hidden',
                transform: 'rotate(-1deg)',
                transition: 'transform .2s, box-shadow .2s',
              }}>
                {/*
                  ┌──────────────────────────────────────────────────────────────┐
                  │ ARTE — Card 1: O Mundo / Vista Aérea de Kishar              │
                  │                                                              │
                  │ Ângulo picado de cima, olhando para baixo sobre o dorso    │
                  │ de Kishar — ruas que seguem as dobras da carapaça como      │
                  │ veias negras sobre quitina. Prespectiva exagerada, estilo  │
                  │ Mignola: linhas grossas, sombras expressivas, mínimo de    │
                  │ detalhes mas máximo de impacto. Luz âmbar de tochas nas   │
                  │ janelas. Escala absurda — a curvatura do dorso no horizonte.│
                  │ Bw + âmbar (#D4841A). Sem gradiente suave. Panel único.   │
                  │ Dimensões: 16:9 landscape, ~560×315px.                      │
                  └──────────────────────────────────────────────────────────────┘
                */}
                <div style={{
                  aspectRatio: '16/9', background: '#0D0E14',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderBottom: `3px solid #1A1B22`,
                  position: 'relative', overflow: 'hidden',
                  padding: '1rem',
                }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(212,132,26,0.06), transparent 60%)' }} />
                  <div style={{ fontSize: '3rem', opacity: 0.18, marginBottom: '0.5rem' }} aria-hidden>🌑</div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(212,132,26,0.45)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
                    ARTE: vista aérea de Kishar — ruas como veias sobre quitina,<br />
                    perspectiva picada dramática, âmbar + preto, estilo Mignola
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#D4841A', textTransform: 'uppercase' }}>O Mundo</span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #D4841A, transparent)', opacity: 0.3 }} />
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: '#ACA49C' }}>
                    Uma criatura colossal. Ninguém sabe de onde veio. Ninguém sabe se está morta.
                    Os insetos construíram cidades nas dobras da sua carapaça e chamaram isso de lar.
                  </p>
                </div>
              </div>

              {/* Card 2 — O Reino */}
              <div style={{
                background: '#0B0C11',
                border: INK4, borderRadius: 8,
                boxShadow: `8px 8px 0 ${C.ink}`,
                overflow: 'hidden',
                transform: 'rotate(0.8deg)',
                transition: 'transform .2s, box-shadow .2s',
              }}>
                {/*
                  ┌──────────────────────────────────────────────────────────────┐
                  │ ARTE — Card 2: O Trono Vazio                               │
                  │                                                              │
                  │ O trono da Coroa de Kishar: maciço, feito de quitina       │
                  │ e metal enferrujado. Sombras longas se estendem da base.   │
                  │ Completamente vazio. Um único raio de luz âmbar vindo      │
                  │ de uma janela alta ilumina o assento — silêncio pesado.    │
                  │ Ângulo baixo olhando para o trono, perspectiva de poder.   │
                  │ Estilo Mignola: contraste extremo. BW + âmbar.             │
                  │ Dimensões: 16:9, ~560×315px.                               │
                  └──────────────────────────────────────────────────────────────┘
                */}
                <div style={{
                  aspectRatio: '16/9', background: '#0D0E14',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderBottom: `3px solid #1A1B22`,
                  position: 'relative', overflow: 'hidden',
                  padding: '1rem',
                }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(212,132,26,0.07), transparent 55%)' }} />
                  <div style={{ fontSize: '3rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>🏛️</div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(212,132,26,0.45)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
                    ARTE: trono vazio de quitina e metal, sombras longas,<br />
                    luz âmbar pela janela, ângulo baixo dramático, Mignola
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#D4841A', textTransform: 'uppercase' }}>O Reino</span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #D4841A, transparent)', opacity: 0.3 }} />
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: '#ACA49C' }}>
                    Sete estações sem rei. O último morreu sentado no jardim com os olhos abertos.
                    O conselho debate impostos enquanto os túneis pulsam lá embaixo.
                  </p>
                </div>
              </div>
            </div>

            {/* Linha 2: Os Túneis — card largo */}
            <div style={{
              background: '#080910',
              border: INK4, borderRadius: 8,
              boxShadow: `8px 8px 0 ${C.ink}`,
              overflow: 'hidden',
              display: 'grid', gridTemplateColumns: '1.6fr 1fr',
            }}>
              {/*
                ┌──────────────────────────────────────────────────────────────┐
                │ ARTE — Card 3: Os Túneis / Os Perfuradores                  │
                │                                                              │
                │ Cena split: dois Perfuradores iluminados por uma tocha em   │
                │ primeiro plano (costas para o leitor), olhando para uma     │
                │ câmara vasta e escura. Na escuridão ao fundo — apenas uma   │
                │ silhueta, forma indistinta mas claramente grande, se         │
                │ movendo. Bioluminescência azul-esverdeada nas paredes de    │
                │ quitina. Luz quente da tocha vs. frio azul da bio.          │
                │ Estilo Mignola: linhas grossas, atmosfera de horror.        │
                │ Escala: wide landscape, ~800×360px.                         │
                └──────────────────────────────────────────────────────────────┘
              */}
              <div style={{
                background: '#080910', borderRight: `3px solid #1A1B22`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 260, padding: '1.5rem', position: 'relative',
                overflow: 'hidden',
              }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 50%, rgba(47,191,184,0.07), transparent 50%), radial-gradient(ellipse at 85% 50%, rgba(212,132,26,0.05), transparent 40%)' }} />
                <div style={{ fontSize: '3.5rem', opacity: 0.12, marginBottom: '0.5rem' }} aria-hidden>🔦</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(47,191,184,0.5)', textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
                  ARTE: dois Perfuradores de costas olhando para câmara escura,<br />
                  silhueta ao fundo se movendo, bio azul-verde + tocha âmbar,<br />
                  atmosfera de horror Mignola — WIDE landscape
                </p>
              </div>
              <div style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#2FBFB8', textTransform: 'uppercase' }}>Os Túneis</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #2FBFB8, transparent)', opacity: 0.3 }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '1.05rem', fontWeight: 700, color: '#DDD5C8', lineHeight: 1.25, textShadow: `2px 2px 0 ${C.ink}` }}>
                  Algo ainda se move lá dentro.
                </h3>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: '#7A8A9A' }}>
                  Onde a quitina fica mais quente e os sons não têm explicação —
                  os Perfuradores aprenderam a não fazer perguntas.
                </p>
              </div>
            </div>

            {/* Linha 3: Você + O Sistema */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

              {/* Card 4 — Você */}
              <div style={{
                background: '#0B0C11',
                border: INK4, borderRadius: 8,
                boxShadow: `8px 8px 0 ${C.ink}`,
                overflow: 'hidden',
                transform: 'rotate(-0.5deg)',
                transition: 'transform .2s, box-shadow .2s',
              }}>
                {/*
                  ┌──────────────────────────────────────────────────────────────┐
                  │ ARTE — Card 4: Os Personagens                               │
                  │                                                              │
                  │ Quatro insetos lado a lado em poses distintas:              │
                  │ 1. Besouro pesado: grande, armadura de quitina, maça.       │
                  │ 2. Mariposa ágil: esguia, asas dobradas, adaga dupla.      │
                  │ 3. Formiga: mandíbulas como arma, postura de ataque.       │
                  │ 4. Louva-a-deus: braços-foice elevados, olhar intenso.     │
                  │ Cada um com personalidade visual marcante. Sem cute.        │
                  │ Guerreiros. Sobreviventes. Linhas grossas, expressivos.     │
                  │ Paleta: BW + detalhes âmbar em cada personagem.            │
                  │ Dimensões: 16:9, ~560×315px.                               │
                  └──────────────────────────────────────────────────────────────┘
                */}
                <div style={{
                  aspectRatio: '16/9', background: '#0D0E14',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderBottom: `3px solid #1A1B22`,
                  position: 'relative', overflow: 'hidden', padding: '1rem',
                }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(212,132,26,0.08), transparent 50%)' }} />
                  <div style={{ fontSize: '2.5rem', opacity: 0.15, letterSpacing: '-0.1em', marginBottom: '0.5rem' }} aria-hidden>🪲🦋🐜🦗</div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(212,132,26,0.45)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
                    ARTE: 4 insetos guerreiros lado a lado, poses distintas,<br />
                    personalidade visual única, sem cute — sobreviventes,<br />
                    Mignola, BW + âmbar, 16:9
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#D4841A', textTransform: 'uppercase' }}>Você</span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #D4841A, transparent)', opacity: 0.3 }} />
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: '#ACA49C' }}>
                    Pequeno e invisível. Grande e assustador.
                    Com ferrão, mandíbulas, ou só uma adaga velha e teimosia.
                  </p>
                </div>
              </div>

              {/* Card 5 — O Sistema */}
              <div style={{
                background: '#0B0C11',
                border: INK4, borderRadius: 8,
                boxShadow: `8px 8px 0 ${C.ink}`,
                overflow: 'hidden',
                transform: 'rotate(1.2deg)',
                transition: 'transform .2s, box-shadow .2s',
              }}>
                {/*
                  ┌──────────────────────────────────────────────────────────────┐
                  │ ARTE — Card 5: Os Fragmentos / Transformação                │
                  │                                                              │
                  │ Um inseto absorvendo um fragmento do Vazio:                 │
                  │ energia escura e roxa irradiando das mãos abertas,         │
                  │ expressão de dor e revelação simultâneas — olhos abertos   │
                  │ demais, corpo arqueado para trás. O fragmento à frente     │
                  │ como uma jóia de sombra. Linhas de energia se espalhando.  │
                  │ Estilo: splash page de quadrinho — dramático, único.       │
                  │ Paleta: preto + roxo escuro + âmbar nos olhos.             │
                  │ Dimensões: 16:9, ~560×315px.                               │
                  └──────────────────────────────────────────────────────────────┘
                */}
                <div style={{
                  aspectRatio: '16/9', background: '#0C0B14',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderBottom: `3px solid #1A1B22`,
                  position: 'relative', overflow: 'hidden', padding: '1rem',
                }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(111,90,174,0.12), transparent 55%)' }} />
                  <div style={{ fontSize: '3rem', opacity: 0.18, marginBottom: '0.5rem', filter: 'hue-rotate(260deg)' }} aria-hidden>💠</div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(139,114,226,0.55)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
                    ARTE: inseto absorvendo fragmento do Vazio, energia roxa<br />
                    irradiando, expressão de dor+revelação, splash page,<br />
                    preto + roxo escuro + âmbar nos olhos, dramático
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase' }}>O Sistema</span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)`, opacity: 0.3 }} />
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: '#ACA49C' }}>
                    Sem classes. Sem destino fixo. Traços definem quem você é.
                    O último fragmento exige que você enfrente a versão de si mesmo que poderia ter sido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA — Altar do Vazio ═══════════════════════════ */}
        <section style={{
          background: C.bgVoid,
          borderTop: INK4,
          padding: '6rem 2rem',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Luz do símbolo vindo de baixo */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 35% 50% at 50% 110%, rgba(145,97,232,0.18) 0%, transparent 60%)`,
          }} />
          {/* Arcos concêntricos */}
          {[260, 420, 600].map((s, i) => (
            <div key={i} aria-hidden style={{
              position: 'absolute', bottom: -(s * 0.45), left: '50%',
              transform: 'translateX(-50%)',
              width: s, height: s, borderRadius: '50%',
              border: `1px solid rgba(145,97,232,${0.1 - i * 0.025})`,
              background: 'transparent', pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            {/* Símbolo central com glow */}
            <div style={{
              fontSize: '3.5rem', lineHeight: 1,
              color: C.gold,
              filter: `drop-shadow(0 0 20px rgba(145,97,232,0.5)) drop-shadow(0 0 60px rgba(145,97,232,0.2))`,
              textShadow: `0 0 30px rgba(145,97,232,0.4)`,
            }} aria-hidden>
              ◈
            </div>

            <h2 style={{
              fontFamily: 'var(--font-cinzel-decorative), serif',
              fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
              color: C.mint, textShadow: `3px 3px 0 ${C.ink}`,
              lineHeight: 1.0, margin: 0,
            }}>
              O Vazio espera.
            </h2>

            {/* 3 botões */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '0.5rem' }}>
              <Link href="/criar-personagem" className="btn-c" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                boxShadow: `6px 6px 0 ${C.ink}, ${GOLD_GLOW}`,
              }}>
                Criar Personagem
              </Link>
              <Link href="/como-jogar" className="btn-c btn-amber" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                boxShadow: `6px 6px 0 ${C.ink}`,
              }}>
                Ler as Regras
              </Link>
              <Link href="/locais" className="btn-c" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                background: 'rgba(47,191,184,0.12)', borderColor: '#2FBFB8', color: '#2FBFB8',
                boxShadow: `6px 6px 0 ${C.ink}, 0 0 18px rgba(47,191,184,0.18)`,
              }}>
                Explorar o Lore
              </Link>
            </div>
          </div>
        </section>

        {/* ══ RODAPÉ ══════════════════════════════════════ */}
        <footer style={{
          background: C.bgPanel,
          borderTop: INK4, padding: '2rem',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '0.75rem',
        }}>
          {[['Início', '/'], ['Como Jogar', '/como-jogar'], ['Criar Personagem', '/criar-personagem'], ['Entrar', '/entrar']].map(([l, h]) => (
            <Link key={l} href={h} style={{
              background: C.bg, border: `2px solid ${C.mid}`,
              borderRadius: 6, padding: '0.32rem 1rem',
              fontFamily: 'var(--font-cinzel), serif', fontSize: '0.85rem',
              fontWeight: 700, color: C.muted, textDecoration: 'none',
              boxShadow: `2px 2px 0 ${C.ink}`,
            }}>
              {l}
            </Link>
          ))}
        </footer>

      </main>
    </>
  )
}
