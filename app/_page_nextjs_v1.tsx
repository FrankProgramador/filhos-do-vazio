import Link from "next/link";

/* ── Hidden SVG filter bank (paper grain + ink) ──────────── */
const SvgFilters = () => (
  <svg width="0" height="0" className="absolute" aria-hidden>
    <defs>
      {/* soft-light blends texture onto dark AND light surfaces */}
      <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise"/>
        <feColorMatrix type="saturate" values="0" in="noise" result="grey"/>
        <feComponentTransfer in="grey" result="grey2">
          <feFuncA type="linear" slope="0.18"/>
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="grey2" mode="soft-light" result="blend"/>
        <feComposite in="blend" in2="SourceGraphic" operator="in"/>
      </filter>
      <filter id="ink-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="0.04 0.06" numOctaves="3" seed="8" result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>
);

/* ── SVG atoms ─────────────────────────────────────────── */

const SoulIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <ellipse cx="16" cy="16" rx="6" ry="8" fill="rgba(18,85,168,0.15)" stroke="rgba(18,85,168,0.6)" strokeWidth="1.5"/>
    <path d="M16 4 C16 4, 12 10, 16 14 C20 10, 16 4, 16 4Z" fill="rgba(18,85,168,0.45)"/>
    <circle cx="16" cy="16" r="2" fill="rgba(13,70,144,0.9)"/>
  </svg>
);

const GhostMask = ({ size = 80, opacity = "0.2" }: { size?: number; opacity?: string }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ opacity }}>
    <ellipse cx="40" cy="38" rx="22" ry="26" fill="rgba(60,38,12,0.08)" stroke="rgba(60,38,12,0.35)" strokeWidth="1.5"/>
    <ellipse cx="32" cy="34" rx="4" ry="6" fill="rgba(30,18,6,0.85)"/>
    <ellipse cx="48" cy="34" rx="4" ry="6" fill="rgba(30,18,6,0.85)"/>
    <path d="M28 52 Q40 60 52 52" stroke="rgba(60,38,12,0.25)" strokeWidth="1.5" fill="none"/>
    <path d="M38 10 L40 2 L42 10" stroke="rgba(140,96,16,0.55)" strokeWidth="1.5" fill="none"/>
    <circle cx="40" cy="2" r="2" fill="rgba(140,96,16,0.55)"/>
  </svg>
);

const OrnamentLeft = () => (
  <svg width="60" height="16" viewBox="0 0 60 16" fill="none" className="opacity-60">
    <path d="M0 8 H50" stroke="#d4a843" strokeWidth="1"/>
    <polygon points="50,4 60,8 50,12" fill="#d4a843"/>
    <circle cx="10" cy="8" r="2" fill="#d4a843"/>
  </svg>
);

const OrnamentRight = () => (
  <svg width="60" height="16" viewBox="0 0 60 16" fill="none" className="opacity-60">
    <path d="M60 8 H10" stroke="#d4a843" strokeWidth="1"/>
    <polygon points="10,4 0,8 10,12" fill="#d4a843"/>
    <circle cx="50" cy="8" r="2" fill="#d4a843"/>
  </svg>
);

/* Quill pen icon */
const IconQuill = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.6 }}>
    <path d="M17 2 C14 1, 8 5, 4 16 L6 16 C8 10, 12 6, 17 2Z" fill="rgba(212,168,67,0.7)"/>
    <path d="M4 16 Q5 13 7 12 Q5 14 5 18" stroke="rgba(212,168,67,0.5)" strokeWidth="1" fill="none"/>
    <path d="M5 18 Q6 16 8 15" stroke="rgba(50,30,10,0.8)" strokeWidth="1.2" fill="none"/>
  </svg>
);

/* Wax seal with void symbol */
const WaxSeal = () => (
  <div className="wax-seal" style={{ width: 62, height: 62 }}>
    <svg width="38" height="38" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="9" stroke="rgba(255,180,160,0.45)" strokeWidth="1.2"/>
      <path d="M15 6 L16.5 13 L15 15 L13.5 13 Z" fill="rgba(255,200,180,0.65)"/>
      <circle cx="15" cy="15" r="2.5" fill="rgba(255,220,200,0.55)"/>
      <path d="M10 22 Q15 18 20 22" stroke="rgba(255,180,160,0.4)" strokeWidth="1" fill="none"/>
      <circle cx="15" cy="15" r="9" stroke="rgba(255,100,100,0.15)" strokeWidth="3"/>
    </svg>
  </div>
);

/* Torn paper edge SVG */
const TornEdge = ({ flip = false }: { flip?: boolean }) => (
  <div className="torn-edge" style={{ transform: flip ? "rotate(180deg)" : undefined }}>
    <svg viewBox="0 0 1440 28" preserveAspectRatio="none" width="100%" height="28">
      {/* warm amber-dark fill — clearly distinct from cold blue background */}
      <path
        d="M0,14 C30,4 55,22 90,11 C125,0 155,19 195,9 C235,0 265,21 305,13 C345,5 375,24 415,14 C455,4 490,22 530,11 C570,0 600,20 640,10 C680,0 715,19 755,9 C795,0 825,22 865,12 C905,2 940,21 980,11 C1020,1 1050,20 1090,10 C1130,0 1165,18 1205,8 C1245,0 1280,21 1320,13 C1360,5 1400,22 1440,14 L1440,28 L0,28 Z"
        fill="rgba(11, 13, 24, 0.97)"
      />
      {/* gold ink edge — visible seam */}
      <path
        d="M0,14 C30,4 55,22 90,11 C125,0 155,19 195,9 C235,0 265,21 305,13 C345,5 375,24 415,14 C455,4 490,22 530,11 C570,0 600,20 640,10 C680,0 715,19 755,9 C795,0 825,22 865,12 C905,2 940,21 980,11 C1020,1 1050,20 1090,10 C1130,0 1165,18 1205,8 C1245,0 1280,21 1320,13 C1360,5 1400,22 1440,14"
        stroke="rgba(74,158,255,0.3)" strokeWidth="1.2" fill="none"
      />
    </svg>
  </div>
);

/* Ink blot decoration */
const InkBlot = ({ style }: { style?: React.CSSProperties }) => (
  <div className="ink-spot" style={{ width: 80, height: 55, ...style }}
    aria-hidden />
);

/* action card icons */
const IconScroll = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="5" y="4" width="18" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".4"/>
    <path d="M9 9 H19 M9 13 H19 M9 17 H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="22" cy="22" r="4" fill="rgba(212,168,67,0.2)" stroke="#d4a843" strokeWidth="1.2"/>
    <path d="M22 20 V22 L23.5 23" stroke="#d4a843" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const IconSword = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 22 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 8 L22 6 L22 11 L17 11 Z" fill="currentColor" opacity=".5"/>
    <path d="M6 22 L9 21 L7 19 Z" fill="currentColor" opacity=".4"/>
    <path d="M11 17 L8 20" stroke="#d4a843" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconMap = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M4 7 L10 5 L18 8 L24 6 L24 21 L18 23 L10 20 L4 22 Z" stroke="currentColor" strokeWidth="1.4" fill="none" opacity=".4"/>
    <path d="M10 5 L10 20 M18 8 L18 23" stroke="currentColor" strokeWidth="1" opacity=".3"/>
    <circle cx="14" cy="13" r="2" fill="rgba(74,158,255,0.5)" stroke="rgba(74,158,255,0.8)" strokeWidth="1"/>
  </svg>
);

const IconBook = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M5 6 Q14 3 23 6 L23 22 Q14 19 5 22 Z" stroke="currentColor" strokeWidth="1.4" fill="none" opacity=".4"/>
    <path d="M14 4 L14 22" stroke="currentColor" strokeWidth="1" opacity=".3"/>
    <path d="M9 10 Q13 9 17 10" stroke="#d4a843" strokeWidth="1" strokeLinecap="round" opacity=".7"/>
    <path d="M9 14 Q13 13 17 14" stroke="#d4a843" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
  </svg>
);

/* ── Static data (skeleton) ──────────────────────────────── */

const quickActions = [
  {
    href: "/fichas/nova",
    icon: <IconSword />,
    label: "Criar Personagem",
    desc: "Forje um novo campeão nas profundezas do Abismo.",
    accent: "gold",
  },
  {
    href: "/fichas",
    icon: <IconScroll />,
    label: "Minhas Fichas",
    desc: "Acesse e gerencie todos os seus personagens.",
    accent: "soul",
  },
  {
    href: "/campanhas",
    icon: <IconMap />,
    label: "Campanhas",
    desc: "Junte-se a uma sessão ou inicie sua própria jornada.",
    accent: "soul",
  },
  {
    href: "/compendio",
    icon: <IconBook />,
    label: "Compêndio",
    desc: "Consulte regras, bestiário e lore de Hallownest.",
    accent: "soul",
  },
];

const placeholderChars = [
  { name: "Zote, o Poderoso",  class: "Cavaleiro",  level: 4,  status: "Ativo"    },
  { name: "Quirrel",           class: "Explorador", level: 7,  status: "Em viagem" },
  { name: "Elderbug",          class: "Sábio",      level: 2,  status: "Inativo"  },
];

const feedItems = [
  { icon: "✦", text: "Nova expansão: \"Os Sonhadores\" disponível." },
  { icon: "◈", text: "Sessão #12 agendada para sexta-feira." },
  { icon: "✦", text: "Compêndio atualizado com criaturas do Abismo." },
  { icon: "◈", text: "Elderbug subiu para nível 2 após a última sessão." },
];

const worldImages = [
  { label: "O Reino Infectado", hint: "Hallownest"   },
  { label: "O Cavaleiro do Vazio", hint: "The Knight" },
  { label: "A Cidade dos Prantos", hint: "City of Tears" },
];

/* ── Page ────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #08090f 0%, #0b0d18 45%, #0f1222 100%)" }}
    >
      {/* SVG filter bank */}
      <SvgFilters />

      {/* Ambient soul glow */}
      <div className="pointer-events-none fixed inset-0" style={{
        background: "radial-gradient(ellipse 70% 35% at 50% 10%, rgba(74,158,255,0.05) 0%, transparent 70%)",
      }} />

      {/* Particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {[...Array(36)].map((_, i) => {
          const size  = 2 + (i % 4);
          const isGold = i % 3 === 0;
          const color = isGold
            ? `rgba(212, 168, 67, ${0.55 + (i % 3) * 0.1})`
            : i % 5 === 0
              ? `rgba(74, 158, 255, ${0.5 + (i % 3) * 0.08})`
              : `rgba(160, 206, 255, ${0.35 + (i % 4) * 0.06})`;
          return (
            <span key={i} className="particle absolute rounded-full" style={{
              width:  `${size}px`,
              height: `${size * 1.4}px`,
              left:   `${(i * 6 + 2) % 100}%`,
              bottom: `${(i * 11) % 60}px`,
              background: color,
              boxShadow: isGold
                ? `0 0 ${size * 2}px ${size}px rgba(212,168,67,0.4)`
                : `0 0 ${size * 2}px ${size}px rgba(74,158,255,0.35)`,
              animationDuration: `${3 + (i % 6)}s`,
              animationDelay:    `${(i * 0.45) % 5}s`,
            }} />
          );
        })}
      </div>

      {/* ══ TOPBAR ════════════════════════════════════════════ */}
      <header className="ddb-topbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
            <SoulIcon />
            <span style={{ fontFamily: "var(--font-cinzel-decorative)", fontSize: "0.85rem", color: "var(--hk-ghost)" }}
              className="soul-glow hidden sm:inline">
              Filhos do Vazio
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            <Link href="/fichas"     className="ddb-nav-link">Fichas</Link>
            <Link href="/campanhas"  className="ddb-nav-link">Campanhas</Link>
            <Link href="/compendio"  className="ddb-nav-link">Compêndio</Link>
            <Link href="/sessoes"    className="ddb-nav-link">Sessões</Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <svg className="absolute left-2.5 opacity-40" width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="var(--hk-gold)" strokeWidth="1.5"/>
              <path d="M11 11 L14 14" stroke="var(--hk-gold)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="ddb-search pl-8 pr-3 py-1.5 w-44"
              type="text"
              placeholder="Buscar..."
              readOnly
            />
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login"       className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs">Entrar</Link>
            <Link href="/cadastro"    className="hk-btn hk-btn-gold px-4 py-1.5 rounded text-xs hidden sm:inline-flex">Criar Conta</Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Banner image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banner.jpeg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 25%" }}
          />
          {/* Light vignette — only enough to keep text readable */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(8,9,15,0.15) 0%, rgba(8,9,15,0.35) 55%, rgba(8,9,15,0.82) 100%)",
          }} />
        </div>

        {/* Content sits above the banner */}
        <div className="relative flex flex-col items-center text-center px-6 pt-16 pb-8">
          <div className="flex items-center gap-5 mb-5">
            <OrnamentLeft />
            <GhostMask size={56} opacity="0.55" />
            <OrnamentRight />
          </div>

          <p className="text-xs tracking-[0.4em] uppercase mb-3"
            style={{ color: "var(--hk-dim)", fontFamily: "var(--font-cinzel)" }}>
            Um reino de segredos e trevas
          </p>

          <h1 className="soul-glow font-black leading-none mb-4"
            style={{ fontFamily: "var(--font-cinzel-decorative)", color: "var(--hk-ghost)", fontSize: "clamp(2.8rem,8vw,5.5rem)", filter: "url(#ink-rough)" }}>
            Filhos do Vazio
          </h1>

          <p className="max-w-md text-base leading-relaxed italic mb-6"
            style={{ fontFamily: "var(--font-im-fell)", color: "rgba(216,228,248,0.75)" }}>
            Nas profundezas de Hallownest, onde a Infecção corrói cada alma,
            os filhos do Abismo emergem para gravar sua lenda.
          </p>

          {/* Wax seal + CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-8">
            <Link href="/fichas/nova"  className="hk-btn hk-btn-gold px-9 py-3 rounded text-sm">✦ Criar Personagem</Link>
            <WaxSeal />
            <Link href="/campanhas"    className="hk-btn hk-btn-soul px-9 py-3 rounded text-sm">Ver Campanhas</Link>
          </div>
        </div>
      </section>

      {/* ── Torn edge divider ─── */}
      <TornEdge />

      {/* ══ MAIN CONTENT ══════════════════════════════════════ */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-10">

        {/* Quick actions grid */}
        <section>
          <h2 className="ddb-section-title"><IconQuill /> Acesso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(({ href, icon, label, desc, accent }) => (
              <Link
                key={label}
                href={href}
                className={`ddb-action-card ink-fold parchment grain ${accent === "gold" ? "gold-accent" : ""}`}
              >
                <div style={{ color: accent === "gold" ? "var(--hk-gold)" : "var(--hk-soul)" }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", letterSpacing: "0.06em",
                    color: accent === "gold" ? "var(--hk-gold)" : "var(--hk-soul-pale)", marginBottom: "0.3rem" }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: "var(--font-im-fell)", fontSize: "0.85rem", color: "rgba(216,228,248,0.5)", lineHeight: 1.5 }}>
                    {desc}
                  </p>
                </div>
                  <div className="mt-auto pt-2 flex justify-end" style={{ color: accent === "gold" ? "rgba(212,168,67,0.55)" : "rgba(74,158,255,0.5)", fontSize: "1rem" }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Two-column: characters + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Characters panel */}
          <section className="lg:col-span-2">
            <div className="ddb-panel parchment grain manuscript-ruled p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="ddb-section-title" style={{ flex: 1 }}>Meus Personagens</h2>
                <Link href="/fichas/nova" className="hk-btn hk-btn-gold px-4 py-1.5 rounded text-xs ml-4 shrink-0"
                  style={{ marginBottom: "0.75rem" }}>
                  + Novo
                </Link>
              </div>

              {/* Character rows */}
              <div>
                {placeholderChars.map((c) => (
                  <Link key={c.name} href="/fichas" className="ddb-char-row">
                    {/* Avatar placeholder */}
                    <div className="shrink-0 rounded soul-border flex items-center justify-center"
                      style={{ width: 44, height: 44, background: "linear-gradient(135deg,#111628,#0b0d18)" }}>
                      <GhostMask size={28} opacity="0.45" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", color: "var(--hk-ghost)", letterSpacing: "0.05em" }}
                        className="truncate">
                        {c.name}
                      </p>
                      <p style={{ fontFamily: "var(--font-im-fell)", fontSize: "0.8rem", color: "var(--hk-dim)", marginTop: "0.1rem" }}>
                        {c.class}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="ddb-badge ddb-badge-soul">Nv {c.level}</span>
                      <span className={`ddb-badge ${c.status === "Ativo" ? "ddb-badge-gold" : "ddb-badge-dim"}`}>
                        {c.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty state hint */}
                  <div className="text-center pt-4" style={{ borderTop: "1px solid rgba(74,158,255,0.08)", marginTop: "0.5rem" }}>
                <Link href="/fichas" style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.7rem",
                  letterSpacing: "0.1em", color: "rgba(74,158,255,0.6)" }}
                  className="uppercase tracking-widest hover:opacity-80 transition-opacity">
                  Ver todos os personagens →
                </Link>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside>
            <div className="ddb-panel parchment grain p-5">
              <h2 className="ddb-section-title">Atividade do Reino</h2>
              <div>
                {feedItems.map((item, i) => (
                  <div key={i} className="ddb-feed-item">
                    <span style={{ color: i % 2 === 0 ? "var(--hk-gold)" : "var(--hk-soul)", flexShrink: 0, marginTop: "2px" }}>
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(74,158,255,0.08)" }}>
                <Link href="/sessoes" className="hk-btn hk-btn-soul w-full py-2 rounded text-xs text-center block">
                  Ver Todas as Sessões
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* World gallery */}
        <section>
          <h2 className="ddb-section-title"><IconQuill /> O Mundo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {worldImages.map(({ label, hint }) => (
              <div key={label} className="hk-frame soul-border rounded overflow-hidden group cursor-pointer">
                <div className="relative flex flex-col items-center justify-center"
                  style={{ height: 180, background: "linear-gradient(135deg,#0f1222,#0b0d18)" }}>
                  <div className="opacity-30 mb-1"><GhostMask size={64} /></div>
                  <span style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.65rem",
                    letterSpacing: "0.2em", color: "rgba(160,206,255,0.4)", textTransform: "uppercase" }}>
                    {hint}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "radial-gradient(ellipse at center, rgba(18,85,168,0.08) 0%, transparent 70%)" }} />
                </div>
                <div className="px-4 py-3 text-center"
                  style={{ background: "rgba(11,13,24,0.92)", borderTop: "1px solid rgba(74,158,255,0.1)" }}>
                  <p style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.75rem",
                    letterSpacing: "0.05em", color: "var(--hk-soul-pale)" }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Torn edge divider (flipped) ─── */}
      <TornEdge flip />

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="relative z-10 mt-auto py-6 text-center"
        style={{ borderTop: "1px solid rgba(74,158,255,0.1)", fontFamily: "var(--font-cinzel)",
          fontSize: "0.65rem", letterSpacing: "0.25em", color: "rgba(122,138,170,0.55)" }}>
        FILHOS DO VAZIO &nbsp;·&nbsp; Hallownest © Team Cherry
      </footer>
    </div>
  );
}
