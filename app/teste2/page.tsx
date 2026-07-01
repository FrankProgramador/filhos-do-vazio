import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Filhos do Vazio — Teste 2',
  robots: { index: false, follow: false },
}

/*
  Layout: IDÊNTICO ao /teste (parallax caverna, hard shadows, cards rotacionados,
          speech bubbles, arcos concêntricos no CTA)

  Paleta: especificação "dark fantasy HK"
  #151922  bg raiz
  #1E2632  painéis / nav / footer
  #252F3D  cards
  #3E4B5F  bordas / divisores
  #E6E8DE  texto principal
  #9FA9B8  texto secundário
  #8B72E2  vazio / magia (principal acento)
  #6F5AAE  vazio escuro (fundos com acento)
  #C89B47  ouro antigo (ações importantes APENAS)
  #9B6F33  ouro escuro (bordas douradas)
  #8ACCC5  alma / soul energy
*/

const C = {
  bg:        '#151922',
  bgPanel:   '#1E2632',
  bgCard:    '#252F3D',
  bgVoid:    '#0E1018',   // fundo do CTA — mais escuro que o bg raiz
  border:    '#3E4B5F',
  text:      '#E6E8DE',   // texto principal — marfim envelhecido
  muted:     '#9FA9B8',   // texto secundário
  void:      '#C89B47',   // ouro — agora acento principal
  voidDark:  '#9B6F33',   // ouro escuro — fundos com acento
  gold:      '#8B72E2',   // roxo/vazio — ações sagradas
  goldDark:  '#6F5AAE',   // roxo escuro — bordas
  soul:      '#8ACCC5',   // alma — energia vital
  ink:       '#0D1018',   // contorno cartoon (índigo quase-preto)
}

const INK3 = `3px solid ${C.ink}`
const INK4 = `4px solid ${C.ink}`

const SH6  = `6px 6px 0 ${C.ink}`
const SH8  = `8px 8px 0 ${C.ink}`

const VOID_GLOW = `0 0 20px rgba(200,155,71,0.32), 0 0 50px rgba(200,155,71,0.1)`
const SOUL_GLOW = `0 0 18px rgba(138,204,197,0.28), 0 0 48px rgba(138,204,197,0.08)`
const GOLD_GLOW = `0 0 16px rgba(139,114,226,0.25)`

const css = `
  /* ── Base ── */
  .t2-page {
    background: ${C.bg};
    color: ${C.text};
    background-image:
      radial-gradient(circle, rgba(138,204,197,0.045) 1px, transparent 1px),
      radial-gradient(circle, rgba(200,155,71,0.09) 1px, transparent 1px);
    background-size: 36px 36px, 72px 72px;
    background-position: 0 0, 18px 18px;
  }

  /* ── NavBar ── */
  .t2-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: ${C.bgPanel};
    border-bottom: ${INK4};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 56px;
  }
  .t2-nav-logo {
    font-family: var(--font-cinzel-decorative), serif;
    font-weight: 700; font-size: 1rem; letter-spacing: .04em;
    color: ${C.text}; text-decoration: none;
    display: flex; align-items: center; gap: .55rem;
  }
  .t2-nav-logo span { color: ${C.gold}; }
  .t2-nav-links {
    display: flex; align-items: center; gap: .25rem;
    list-style: none; margin: 0; padding: 0;
  }
  .t2-nav-links a {
    font-family: var(--font-cinzel), serif;
    font-weight: 400; font-size: .72rem;
    letter-spacing: .1em; text-transform: uppercase;
    color: ${C.muted}; text-decoration: none;
    padding: .35rem .75rem; border-radius: 4px;
    transition: color .2s, background .2s;
  }
  .t2-nav-links a:hover { color: ${C.text}; background: rgba(62,75,95,0.4); }
  .t2-nav-cta {
    font-family: var(--font-cinzel), serif !important;
    font-weight: 400; font-size: .72rem !important;
    letter-spacing: .12em !important; text-transform: uppercase !important;
    color: ${C.gold} !important;
    border: 1.5px solid ${C.goldDark} !important;
    border-radius: 4px !important;
    padding: .32rem 1rem !important;
    box-shadow: 3px 3px 0 ${C.ink};
    transition: color .2s, border-color .2s, box-shadow .15s !important;
    text-decoration: none !important;
  }
  .t2-nav-cta:hover {
    color: ${C.text} !important;
    border-color: ${C.gold} !important;
    box-shadow: 4px 4px 0 ${C.ink} !important;
  }

  /* ── Botão principal — ouro, só para ações sagradas ── */
  .btn-t2 {
    display: inline-flex; align-items: center; gap: .5rem;
    font-family: var(--font-cinzel), serif;
    font-weight: 700; font-size: 0.82rem;
    letter-spacing: .14em; text-transform: uppercase;
    text-decoration: none; white-space: nowrap; cursor: pointer;
    color: ${C.ink};
    background: ${C.gold};
    border: ${INK4};
    border-radius: 6px;
    padding: .85rem 2.4rem;
    box-shadow: ${SH8}, ${GOLD_GLOW};
    transition: transform .12s, box-shadow .12s;
  }
  .btn-t2:hover { transform: scale(1.07) translateY(-3px); box-shadow: 10px 10px 0 ${C.ink}, ${GOLD_GLOW}; }
  .btn-t2:active { transform: scale(.96); box-shadow: 3px 3px 0 ${C.ink}; }

  /* ── Botão secundário — vazio/alma ── */
  .btn-void {
    color: ${C.text};
    background: rgba(200,155,71,0.15);
    border-color: ${C.voidDark};
    box-shadow: ${SH8}, ${VOID_GLOW};
  }
  .btn-void:hover { box-shadow: 10px 10px 0 ${C.ink}, ${VOID_GLOW}; }

  /* ── Mascote flutua ── */
  @keyframes float {
    0%, 100% { transform: translateY(0)    rotate(-1.5deg); }
    45%       { transform: translateY(-16px) rotate(1.5deg); }
    75%       { transform: translateY(-7px)  rotate(-.5deg); }
  }
  .mascot-float { animation: float 3.2s ease-in-out infinite; }

  /* ── Parallax caverna — 3 planos ── */
  @keyframes caveFar  { from { background-position: 0 0; }       to { background-position: -80px 0; }   }
  @keyframes caveMid  { from { background-position: 40px 20px; } to { background-position: -100px 20px; } }
  @keyframes caveNear { from { background-position: 15px 32px; } to { background-position: -45px 32px; } }

  .cave-far {
    /* metade da densidade original (160×110 em vez de 80×55)
       + dots roxos e dourados espalhados em posições diferentes */
    background-image:
      radial-gradient(circle, rgba(200,155,71,0.28)  1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(111,90,174,0.38)  1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(200,155,71,0.20)  1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(111,90,174,0.28)  1.5px, transparent 1.5px);
    background-size:
      160px 110px,
      240px 175px,
      200px 150px,
      300px 220px;
    background-position:
      0 0,
      90px 50px,
      50px 90px,
      160px 30px;
    animation: caveFar 9s linear infinite;
  }
  .cave-mid {
    background-image: radial-gradient(circle, rgba(138,204,197,0.32) 2px, transparent 2px);
    background-size: 140px 80px;
    animation: caveMid 5.5s linear infinite;
  }
  .cave-near {
    background-image: radial-gradient(circle, rgba(230,232,222,0.18) 2.5px, transparent 2.5px);
    background-size: 60px 44px;
    animation: caveNear 2.8s linear infinite;
  }

  /* ── Linhas de velocidade ── */
  @keyframes streak {
    from { transform: translateX(110vw); }
    to   { transform: translateX(-110vw); }
  }

  /* ── Balão de fala ── */
  .t2-bubble {
    position: relative;
    background: ${C.bgCard}; color: ${C.muted};
    border: 2px solid ${C.border};
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
    box-shadow: ${SH6};
  }
  .t2-bubble::after {
    content: '';
    position: absolute; bottom: -20px; left: 28px;
    border: 12px solid transparent;
    border-top: 20px solid ${C.ink};
  }
  .t2-bubble::before {
    content: '';
    position: absolute; bottom: -13px; left: 30px; z-index: 1;
    border: 10px solid transparent;
    border-top: 14px solid ${C.bgCard};
  }

  /* ── Cards ── */
  .t2-card { transition: transform .2s, box-shadow .2s; }
  .t2-card:hover {
    transform: translateY(-5px) rotate(0deg) !important;
    box-shadow: 10px 10px 0 ${C.ink} !important;
  }

  /* ── Card gravado — recuado na superfície ── */
  .carved-card {
    background: ${C.bg};
    border: 1px solid rgba(62,75,95,0.4);
    /* topo levemente mais claro (aresta iluminada do entalhe) */
    border-top-color: rgba(62,75,95,0.65);
    border-radius: 6px;
    /* sombra interna: aprofunda o entalhe */
    box-shadow:
      inset 0 4px 20px rgba(0,0,0,0.55),
      inset 0 0 0 1px rgba(10,12,24,0.5);
    overflow: hidden;
    transition: box-shadow .25s, border-color .25s;
  }
  .carved-card:hover {
    border-color: rgba(62,75,95,0.65);
    border-top-color: rgba(200,155,71,0.35);
    box-shadow:
      inset 0 4px 24px rgba(0,0,0,0.6),
      inset 0 0 0 1px rgba(10,12,24,0.6),
      0 0 20px rgba(139,114,226,0.06);
  }
  /* Placeholder de ilustração — o ponto mais fundo do entalhe */
  .carved-illus {
    background: ${C.bgVoid};
    border-bottom: 1px solid rgba(62,75,95,0.3);
    box-shadow: inset 0 4px 16px rgba(0,0,0,0.7);
  }

  /* ── Slide de entrada ── */
  @keyframes slideIn {
    from { transform: translateY(28px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .t2-slide { animation: slideIn .6s ease both; }
  .d1 { animation-delay: .1s; }
  .d2 { animation-delay: .22s; }
  .d3 { animation-delay: .34s; }
`

/* ─── COMPONENTES ────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      fontFamily: 'var(--font-cinzel), serif',
      fontSize: '0.66rem', fontWeight: 400,
      letterSpacing: '0.3em', textTransform: 'uppercase',
      color: C.void,
      border: `1.5px solid rgba(139,114,226,0.4)`,
      borderRadius: 4,
      padding: '0.2rem 0.85rem',
      boxShadow: `3px 3px 0 ${C.ink}`,
      background: `rgba(200,155,71,0.07)`,
    }}>
      {text}
    </div>
  )
}


/* ─── PÁGINA ─────────────────────────────────────── */

export default function Teste2Page() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ══ NAV ══════════════════════════════════════════ */}
      <nav className="t2-nav" aria-label="Navegação principal">
        <Link href="/" className="t2-nav-logo">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke={C.gold} strokeWidth="1.5" strokeOpacity="0.8" />
            <ellipse cx="16" cy="16" rx="4" ry="6" fill="none" stroke={C.gold} strokeWidth="1.2" strokeOpacity="0.6" />
            <circle cx="16" cy="16" r="2" fill={C.gold} fillOpacity="0.9" />
          </svg>
          Filhos <span>do Vazio</span>
        </Link>

        <ul className="t2-nav-links">
          <li><a href="#reino">Mundo</a></li>
          <li><a href="/como-jogar">Registros</a></li>
          <li><a href="/criar-personagem">Personagem</a></li>
          <li><Link href="/entrar" className="t2-nav-cta">◈ Adentrar</Link></li>
        </ul>
      </nav>

      <main className="t2-page" style={{ minHeight: '100vh' }}>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          minHeight: 680, display: 'flex', alignItems: 'center',
        }}>
          {/* Parallax caverna */}
          <div aria-hidden className="cave-far"  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div aria-hidden className="cave-mid"  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div aria-hidden className="cave-near" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {/* Linhas de velocidade */}
          {([
            { top: '14%', h: 1.5, w: 200, op: 0.22, dur: '1.1s', del: '0s'   },
            { top: '28%', h: 2,   w: 300, op: 0.16, dur: '1.8s', del: '0.4s' },
            { top: '42%', h: 1.5, w: 140, op: 0.26, dur: '0.9s', del: '1.1s' },
            { top: '56%', h: 2.5, w: 360, op: 0.13, dur: '2.2s', del: '0.2s' },
            { top: '68%', h: 1.5, w: 220, op: 0.19, dur: '1.5s', del: '0.7s' },
            { top: '80%', h: 2,   w: 170, op: 0.22, dur: '1.0s', del: '1.5s' },
            { top: '22%', h: 1,   w: 100, op: 0.15, dur: '2.5s', del: '0.9s' },
            { top: '75%', h: 1,   w: 280, op: 0.12, dur: '1.3s', del: '1.8s' },
          ] as const).map(({ top, h, w, op, dur, del }, i) => (
            <div key={i} aria-hidden style={{
              position: 'absolute', top, left: 0,
              height: h, width: w, borderRadius: 2,
              background: i % 3 === 0
                ? `rgba(200,155,71,${op})`
                : i % 3 === 1
                ? `rgba(138,204,197,${op})`
                : `rgba(111,90,174,${op * 0.6})`,
              animation: `streak ${dur} linear ${del} infinite`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Névoa de alma */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 65% 55% at 28% 50%, rgba(138,204,197,0.06) 0%, transparent 68%)`,
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
              <div
                className="mascot-float"
                style={{
                  filter: `drop-shadow(0 0 28px rgba(138,204,197,0.22)) drop-shadow(0 8px 32px rgba(0,0,0,0.6))`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/bases/mascote.png"
                  alt="Mascote — Filhos do Vazio"
                  style={{ width: 300, height: 'auto', display: 'block', transform: 'scaleX(-1)' }}
                />
              </div>
            </div>

            {/* Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionLabel text="Um RPG de mesa inspirado em Hollow Knight" />

              <h1 className="t2-slide d1" style={{ lineHeight: 1, margin: 0 }}>
                {/* "Filhos do" — menor, quase branco, discreto */}
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-cinzel), serif',
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
                  fontWeight: 400,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: `rgba(230,232,222,0.55)`,
                  textShadow: `2px 2px 0 ${C.ink}`,
                  marginBottom: '0.2em',
                }}>
                  Filhos <span style={{ opacity: 0.5 }}>do</span>
                </span>
                {/* "Vazio" — palavra principal, roxo, grande */}
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-cinzel-decorative), serif',
                  fontSize: 'clamp(3rem, 6.5vw, 5rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  color: C.gold,
                  textShadow: `4px 4px 0 ${C.ink}, ${GOLD_GLOW}`,
                  lineHeight: 0.9,
                }}>
                  Vazio
                </span>
              </h1>

              {/* Linha gravada */}
              <div className="t2-slide d1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 1, background: C.soul, opacity: 0.5 }} />
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, rgba(138,204,197,0.4), transparent)` }} />
              </div>

              <p className="t2-slide d2" style={{
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                fontSize: '1.07rem', lineHeight: 1.85,
                color: C.muted, maxWidth: 360,
              }}>
                Aventuras em um reino decadente de insetos.<br />
                Forje seu legado nas sombras de Hallownest.
              </p>

              <div className="t2-slide d3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                <Link href="/cadastro" className="btn-t2">◈ Criar Conta</Link>
                <Link href="#reino" className="btn-t2 btn-void">Explorar o Mundo</Link>
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

        {/* ══ REINO — O Reino em Ruínas ═════════════════════ */}
        <section id="reino" style={{ background: C.bgPanel, padding: '4rem 2rem 5rem' }}>
          {/* cabeçalho da seção */}
          <div style={{ maxWidth: 1100, margin: '0 auto 3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <SectionLabel text="Lore & Mundo" />
            <h2 style={{
              fontFamily: 'var(--font-cinzel), serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400,
              color: C.text, textShadow: `3px 3px 0 ${C.ink}`, lineHeight: 1.1,
              letterSpacing: '0.04em',
            }}>
              🌿 O Reino em Ruínas
            </h2>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: C.muted, maxWidth: 520, lineHeight: 1.75 }}>
              Explore os fragmentos de Hallownest — um reino que caiu, mas nunca foi esquecido.
            </p>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Card — História */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(-1deg)', animationDelay: '0s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(200,155,71,0.07), transparent 55%)` }} />
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>📜</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: `rgba(200,155,71,0.4)`, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                  Arte: relevo antigo de um rei inseto e<br />um selo quebrado com fissuras
                </p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.void, textTransform: 'uppercase' }}>História</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.void}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  O Reino de Hallownest caiu há eras, mas seus ecos ainda moldam o destino dos insetos. Descubra a verdade por trás do Grande Selo.
                </p>
                <Link href="/historia" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.void, textDecoration: 'none', opacity: 0.8, transition: 'opacity .2s' }}>
                  Ler a História →
                </Link>
              </div>
            </div>

            {/* Card — Locais */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(0.5deg)', animationDelay: '0.12s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', padding: 0, position: 'relative', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/locais.jpeg" alt="Locais de Hallownest" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }} />
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(14,16,24,0.5) 100%)' }} />
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.void, textTransform: 'uppercase' }}>Locais</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.void}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  Das cavernas esquecidas às cidadelas em ruínas, cada região guarda segredos. Antigas relíquias esperam pelos corajosos.
                </p>
                <Link href="/locais" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.void, textDecoration: 'none', opacity: 0.8, transition: 'opacity .2s' }}>
                  Explorar Locais →
                </Link>
              </div>
            </div>

            {/* Card — Facções */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(-0.5deg)', animationDelay: '0.24s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, rgba(111,90,174,0.08), transparent 55%)` }} />
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>⚔️</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: `rgba(139,114,226,0.45)`, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                  Arte: silhuetas de três insetos com<br />armas distintas, sombras expressivas
                </p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase' }}>Facções</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  Tribos nômades, guerreiros solitários e cultos antigos disputam o poder nas sombras. Cada aliança tem seu preço.
                </p>
                <Link href="/faccoes" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, textDecoration: 'none', opacity: 0.8 }}>
                  Ver Facções →
                </Link>
              </div>
            </div>

          </div>

          {/* Corte diagonal — inverte direção pra variar */}
          <div aria-hidden style={{
            marginTop: '4rem', height: 56, width: '100%',
            background: C.bg,
            clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
          }} />
        </section>

        {/* ══ SISTEMA — Como Jogar ═══════════════════════════ */}
        <section style={{ background: C.bg, padding: '4rem 2rem 5rem' }}>

          <div style={{ maxWidth: 1100, margin: '0 auto 3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <SectionLabel text="Mecânicas" />
            <h2 style={{
              fontFamily: 'var(--font-cinzel), serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400,
              color: C.text, textShadow: `3px 3px 0 ${C.ink}`, lineHeight: 1.1,
              letterSpacing: '0.04em',
            }}>
              📖 Como Jogar
            </h2>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: C.muted, maxWidth: 520, lineHeight: 1.75 }}>
              Elegante, rápido e baseado em dados de seis faces. Aprenda em minutos, domine em sessões.
            </p>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Card — Regras */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(0.8deg)', animationDelay: '0s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(200,155,71,0.07), transparent 55%)` }} />
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>📖</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: `rgba(200,155,71,0.4)`, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                  Arte: página de livro antigo com runas e<br />diagramas de combate
                </p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.void, textTransform: 'uppercase' }}>Regras</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.void}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  Testes em dados d6. Sucessos em 5 ou 6. Combate, alma e Fragmentos do Vazio — tudo em um só guia.
                </p>
                <Link href="/como-jogar" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.void, textDecoration: 'none', opacity: 0.8 }}>
                  Ler as Regras →
                </Link>
              </div>
            </div>

            {/* Card — Traços */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(-0.6deg)', animationDelay: '0.12s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(138,204,197,0.07), transparent 55%)` }} />
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>🦋</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: `rgba(138,204,197,0.4)`, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                  Arte: grades de traços com ícones de<br />inseto em estilo de compêndio
                </p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.soul, textTransform: 'uppercase' }}>Traços</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.soul}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  Comuns, marcantes, raros e de personalidade. Compêndio completo de traços com seus efeitos mecânicos e raridades.
                </p>
                <Link href="/como-jogar/tracos" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.soul, textDecoration: 'none', opacity: 0.8 }}>
                  Ver Traços →
                </Link>
              </div>
            </div>

            {/* Card — Itens */}
            <div className="carved-card t2-card t2-slide" style={{ overflow: 'hidden', transform: 'rotate(0.4deg)', animationDelay: '0.24s' }}>
              <div className="carved-illus" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(111,90,174,0.08), transparent 55%)` }} />
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem' }} aria-hidden>🎒</div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: `rgba(139,114,226,0.45)`, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                  Arte: vitrine de armas e armaduras<br />de inseto, estilo inventário de RPG
                </p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase' }}>Itens</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)`, opacity: 0.35 }} />
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7, color: C.muted }}>
                  Armas, armaduras, ferramentas e consumíveis disponíveis para a criação de personagem. Busque e filtre por tipo.
                </p>
                <Link href="/como-jogar/itens" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, textDecoration: 'none', opacity: 0.8 }}>
                  Ver Itens →
                </Link>
              </div>
            </div>

          </div>

          {/* Corte diagonal */}
          <div aria-hidden style={{
            marginTop: '4rem', height: 56, width: '100%',
            background: C.bgVoid,
            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
          }} />
        </section>


        {/* ══ CTA — Altar do Vazio ═════════════════════════ */}
        <section style={{
          background: C.bgVoid,
          borderTop: INK4,
          padding: '6rem 2rem',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Luz ascendente do símbolo */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 35% 50% at 50% 110%, rgba(139,114,226,0.2) 0%, transparent 60%)`,
          }} />
          {/* Arcos concêntricos */}
          {[260, 420, 600].map((s, i) => (
            <div key={i} aria-hidden style={{
              position: 'absolute', bottom: -(s * 0.45), left: '50%',
              transform: 'translateX(-50%)',
              width: s, height: s, borderRadius: '50%',
              border: `1px solid rgba(139,114,226,${0.1 - i * 0.025})`,
              background: 'transparent', pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            {/* Símbolo com glow roxo */}
            <div style={{
              fontSize: '3.5rem', lineHeight: 1,
              color: C.void,
              filter: `drop-shadow(0 0 20px rgba(139,114,226,0.55)) drop-shadow(0 0 60px rgba(139,114,226,0.2))`,
            }} aria-hidden>
              ◈
            </div>

            <h2 style={{
              fontFamily: 'var(--font-cinzel-decorative), serif',
              fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 400,
              color: C.text, textShadow: `3px 3px 0 ${C.ink}`,
              lineHeight: 1.0, margin: 0,
            }}>
              O Vazio espera.
            </h2>

            {/* 3 botões */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '0.5rem' }}>
              <Link href="/criar-personagem" className="btn-t2" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                boxShadow: `6px 6px 0 ${C.ink}, ${GOLD_GLOW}`,
              }}>
                Criar Personagem
              </Link>
              <Link href="/como-jogar" className="btn-t2 btn-void" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                boxShadow: `6px 6px 0 ${C.ink}, ${VOID_GLOW}`,
              }}>
                Ler as Regras
              </Link>
              <Link href="/locais" className="btn-t2" style={{
                fontSize: '0.82rem', padding: '0.85rem 1.8rem',
                background: `rgba(138,204,197,0.1)`, borderColor: C.soul, color: C.soul,
                boxShadow: `6px 6px 0 ${C.ink}, ${SOUL_GLOW}`,
              }}>
                Explorar o Lore
              </Link>
            </div>
          </div>
        </section>

        {/* ══ RODAPÉ ══════════════════════════════════════ */}
        <footer style={{
          background: C.bgPanel,
          borderTop: `2px solid ${C.border}`,
          padding: '2rem',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '0.75rem',
        }}>
          {[['Início', '/'], ['Registros', '/como-jogar'], ['Personagem', '/criar-personagem'], ['Adentrar', '/entrar']].map(([l, h]) => (
            <Link key={l} href={h} style={{
              background: C.bg,
              border: `1.5px solid ${C.border}`,
              borderRadius: 4, padding: '0.3rem 0.9rem',
              fontFamily: 'var(--font-cinzel), serif',
              fontSize: '0.7rem', fontWeight: 400,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.muted, textDecoration: 'none',
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
