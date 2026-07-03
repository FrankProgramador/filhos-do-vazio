import type { Metadata } from 'next'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import TableOfContents from './TableOfContents'
import TraitsModalLink from './TraitsModalLink'
import EquipmentPackagesModalLink from './EquipmentPackagesModalLink'
import DiceRoller from './DiceRoller'
import StatBlock from './StatBlock'
import CombatEncounter from './CombatEncounter'

export const metadata: Metadata = {
  title: 'Como Jogar – Filhos do Vazio',
  description:
    'Livro inicial de Filhos do Vazio: o que é o jogo, o que você precisa para jogar, criação de personagem e um tutorial prático de introdução.',
}

const sections = [
  { id: 'o-que-e', label: '1. O que é Filhos do Vazio?' },
  { id: 'preparacao', label: '2. O que Você Precisa' },
  { id: 'criacao', label: '3. Criando seu Personagem' },
  { id: 'tutorial', label: '4. Tutorial Prático — Um Dia na Vida de Orin' },
]

/* ── Tiny helpers ─────────────────────────────────────── */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-16"
      style={{
        fontFamily: 'var(--font-cinzel-decorative)',
        fontSize: '2.5rem',
        color: 'var(--gold)',
        textShadow: '0 0 18px rgba(var(--gold-rgb),0.35)',
        marginBottom: '1rem',
        marginTop: '2.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(var(--gold-rgb),0.18)',
      }}
    >
      {children}
    </h2>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-cinzel)',
        fontSize: '1.9rem',
        letterSpacing: '0.06em',
        color: 'var(--text)',
        marginTop: '1.5rem',
        marginBottom: '0.5rem',
      }}
    >
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: 'rgba(var(--text-rgb),0.75)', fontSize: '1.5rem', lineHeight: 1.8, marginBottom: '0.75rem' }}>
      {children}
    </p>
  )
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-im-fell)',
      fontStyle: 'italic',
      color: 'rgba(var(--text-rgb),0.55)',
      fontSize: '1.5rem',
      lineHeight: 1.8,
      margin: '0.75rem 0 1rem',
      borderLeft: '2px solid rgba(var(--gold-rgb),0.3)',
      paddingLeft: '0.85rem',
    }}>
      {children}
    </p>
  )
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '1rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {children}
    </ul>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ color: 'rgba(var(--text-rgb),0.75)', fontSize: '1.5rem', lineHeight: 1.7, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(var(--gold-rgb),0.25)' }}>
      {children}
    </li>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.5rem', color: 'rgba(var(--text-rgb),0.75)' }}>
        {children}
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', letterSpacing: '0.08em', color: 'var(--text-muted)', background: 'rgba(var(--gold-rgb),0.06)', borderBottom: '1px solid rgba(var(--gold-rgb),0.2)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.07)', color: muted ? 'var(--text-muted)' : 'rgba(var(--text-rgb),0.75)', verticalAlign: 'top' }}>
      {children}
    </td>
  )
}

function TrilhaCard({ title, italic, children }: { title: string; italic: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '1.1rem 1.25rem', borderRadius: 10, marginBottom: '1.25rem' }}>
      <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>{title}</h4>
      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '1.2rem', color: 'rgba(var(--text-rgb),0.5)', marginBottom: '0.6rem' }}>{italic}</p>
      <div>{children}</div>
    </div>
  )
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: 'var(--gold-light)', margin: '0.9rem 0 0.4rem', letterSpacing: '0.03em' }}>
      {children}
    </p>
  )
}

function OrinSpeech({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
        margin: '1.25rem 0', padding: '0.9rem 1.15rem',
        background: 'rgba(var(--void-light-rgb),0.08)',
        border: '1px solid rgba(var(--void-light-rgb),0.3)',
        borderRadius: '4px 14px 14px 14px',
      }}
    >
      <span style={{ fontSize: '1.3rem', flexShrink: 0, lineHeight: 1.4 }} aria-hidden>🪲</span>
      <div>
        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--void-glow)', marginBottom: '0.3rem' }}>
          Orin
        </p>
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '1.3rem', color: 'rgba(var(--text-rgb),0.85)', lineHeight: 1.6, margin: 0 }}>
          {children}
        </p>
      </div>
    </div>
  )
}

function RuleBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: '1.5rem 0', padding: '1.25rem 1.5rem', borderRadius: 10,
        background: 'rgba(var(--info-rgb),0.06)',
        border: '1px solid rgba(var(--info-rgb),0.3)',
      }}
    >
      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--info)', marginBottom: '0.75rem' }}>
        📖 {title}
      </p>
      <div>{children}</div>
    </div>
  )
}

function SheetUpdate({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: '1.25rem 0', padding: '0.9rem 1.2rem', borderRadius: 8,
        background: 'rgba(var(--gold-rgb),0.05)',
        border: '1px dashed rgba(var(--gold-rgb),0.35)',
      }}
    >
      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
        📝 Anote na ficha
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>{children}</div>
    </div>
  )
}

function GMNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: '1.5rem 0', padding: '1.25rem 1.5rem', borderRadius: 10,
        background: 'rgba(var(--void-light-rgb),0.07)',
        border: '1px solid rgba(var(--void-light-rgb),0.3)',
      }}
    >
      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--void-glow)', marginBottom: '0.75rem' }}>
        🕯️ {title}
      </p>
      <div>{children}</div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────── */

export default function ComoJogarPage() {
  return (
    <ContentShell title="Como Jogar">
      <main style={{ minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ padding: '3.5rem 1.5rem 2.5rem', textAlign: 'center', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(var(--gold-rgb),0.07) 0%, transparent 70%)', borderBottom: '1px solid rgba(var(--gold-rgb),0.08)' }}>
          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', letterSpacing: '0.22em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Livro Inicial — v0.3
          </p>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.2 }}>
            Como Jogar
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Tudo que você precisa para criar um personagem e jogar uma sessão de{' '}
            <em style={{ color: 'var(--gold-light)' }}>Filhos do Vazio</em>.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[240px_1fr] grid-cols-1 gap-10 items-start" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
          <aside className="hidden lg:block" style={{ position: 'sticky', top: 80, background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 8, padding: '1.25rem 1rem' }}>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              Índice
            </p>
            <TableOfContents sections={sections} />
          </aside>

          <article style={{ minWidth: 0 }}>

            {/* ─── 1. O que é ─────────────────────────── */}
            <SectionTitle id="o-que-e">1. O que é Filhos do Vazio?</SectionTitle>

            <style>{`
              .oqe-comic-box {
                position: absolute;
                background: #F0E6C8; border: 2.5px solid #0D1018;
                padding: .55rem 1rem;
                top: 8%; left: 3%; max-width: min(100%, 739px);
                transform: skewX(-3deg);
                box-shadow: 4px 4px 0 #0D1018;
              }
              .oqe-comic-box p {
                font-family: var(--font-im-fell); font-style: italic;
                color: #0D1018; margin: 0; line-height: 1.55;
                font-size: clamp(0.72rem, 1.6vw, 1.1rem);
                transform: skewX(3deg);
              }
              @media (max-width: 639px) {
                .oqe-comic-box { max-width: 90vw; top: 5%; }
              }
              .imag-comic-box {
                position: absolute;
                background: #F0E6C8; border: 2.5px solid #0D1018;
                padding: .7rem 1.1rem;
                top: 8%; left: 3%; max-width: 100%;
                transform: skewX(-3deg);
                box-shadow: 4px 4px 0 #0D1018;
              }
              .imag-comic-box p {
                font-family: var(--font-im-fell); font-style: italic;
                color: #0D1018; margin: 0; line-height: 1.55;
                font-size: clamp(0.85rem, 1.8vw, 1.15rem);
                transform: skewX(3deg);
              }
              @media (max-width: 767px) {
                .imag-cols { grid-template-columns: 1fr !important; }
              }
            `}</style>

            <figure style={{ position: 'relative', margin: '1.75rem 0 2.5rem' }}>
              <div
                style={{
                  position: 'relative',
                  height: 340,
                  overflow: 'hidden',
                  clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)',
                  boxShadow: '0 20px 45px -20px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src="/banner.jpeg"
                  alt="Arte conceitual de um inseto aventureiro diante das ruínas decadentes de Crosta Eterna, com fragmentos de poder ancestral brilhando ao fundo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="oqe-comic-box">
                  <p>Você é um herdeiro do Vazio — e cada escolha define quem você se tornará.</p>
                </div>
              </div>
            </figure>

            <Quote>
              Há lugares onde o mundo aprendeu a permanecer em silêncio. Foi quebrando esse silêncio que
              surgiram as primeiras histórias sobre o Vazio.
            </Quote>
            <Quote>
              Para uns, é uma força. Para outros, uma maldição. Há ainda os que acreditam que não passa de
              um eco — a memória distorcida de algo mais antigo que o próprio reino.
            </Quote>
            <Quote>
              O Vazio não grita. Ele sussurra, como uma fresta na realidade, uma sensação de que algo está
              fora do lugar.
            </Quote>
            <Quote>
              E é aqui, nas costas e entranhas de um titã caído, em um reino decadente, que sua história
              começa.
            </Quote>
            <P>
              Em Filhos do Vazio, insetos sencientes (nem sempre humanóides) percorrem um mundo de perigos e
              segredos. Suas escolhas deixam marcas profundas. Poucos talharão seus nomes na história — mas
              todos sentirão o chamado.
            </P>

            {/* ─── 2. Preparação ──────────────────────── */}
            <SectionTitle id="preparacao">2. O que Você Precisa para Jogar?</SectionTitle>

            <P>Toda grande jornada começa com pouco.</P>
            <P>
              Um punhado de viajantes, algumas ferramentas e a coragem de seguir por um caminho onde
              ninguém pode garantir o que existe adiante.
            </P>
            <P>Para explorar o mundo de Filhos do Vazio, você precisará apenas do essencial.</P>

            <SubTitle>🎲 Dados</SubTitle>
            <P>Os desafios são resolvidos com dados de seis faces (d6).</P>
            <P>
              Embora seja possível jogar com menos, recomenda-se que cada jogador tenha pelo menos oito
              dados, tornando as rolagens mais rápidas e fluidas.
            </P>

            <SubTitle>📜 Ficha de Personagem</SubTitle>
            <P>Sua ficha conta a história do seu aventureiro.</P>
            <P>
              É nela que ficam registrados seus atributos, habilidades, equipamentos, fragmentos, evolução
              e tudo aquilo que torna seu personagem único.
            </P>
            <P>Ela mudará conforme sua jornada avança.</P>

            <SubTitle>🕯️ Mestre</SubTitle>
            <P>Toda história precisa de alguém para contar o que existe além da próxima curva.</P>
            <P>
              O Mestre (GM) descreve o mundo, interpreta seus habitantes, apresenta desafios e reage às
              escolhas dos jogadores. Ele não joga contra o grupo; seu papel é dar vida ao reino e conduzir
              a aventura.
            </P>

            <SubTitle>🐞 Jogadores</SubTitle>
            <P>
              Uma mesa costuma reunir de dois a cinco jogadores, cada um interpretando um inseto com sua
              própria personalidade, motivações e forma de enfrentar o desconhecido.
            </P>
            <P>Juntos, eles escreverão uma história que jamais será exatamente igual à de outra mesa.</P>

            <div className="imag-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', margin: '1.5rem 0 2rem' }}>
              <div>
                <SubTitle>✨ Imaginação</SubTitle>
                <P>Acima de qualquer regra, dado ou ficha, existe a imaginação.</P>
                <P>
                  Ela transforma números em decisões, corredores escuros em ruínas esquecidas e pequenos
                  insetos em protagonistas de grandes histórias.
                </P>
              </div>
              <div style={{ position: 'relative', height: 350, overflow: 'hidden', borderRadius: 8, boxShadow: '0 20px 45px -20px rgba(0,0,0,0.6)' }}>
                <img
                  src="/placeholder.jpg"
                  alt="Ilustração representando a imaginação no mundo de Filhos do Vazio"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="imag-comic-box">
                  <p>
                    Todo o restante cabe dentro de uma mochila.
                    <br />
                    A imaginação, não.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── 3. Criação ────────────────────────── */}
            <SectionTitle id="criacao">3. Criando seu Personagem</SectionTitle>

            <P>
              Quando um aventureiro entra nas ruínas de Crosta Eterna, ninguém pergunta quanto ele consegue
              levantar.
            </P>
            <Quote>Perguntam se ele volta.</Quote>
            <P>
              Seu personagem não é definido apenas pelos números em sua ficha. Antes da primeira aventura,
              ele já possui uma história, uma forma de enxergar o mundo e qualidades que o diferenciam de
              qualquer outro inseto.
            </P>
            <P>Este passo representa tudo aquilo que seu personagem já viveu antes da campanha começar.</P>
            <P>Primeiro, descubra como seu corpo foi moldado.</P>
            <P>Depois, quem você é.</P>
            <P>Por fim, quais características fazem de você alguém único.</P>

            <style>{`
              @keyframes cp-orbit {
                0%    { left: 50%; top: 75%; transform: translate(-50%, -50%) scale(1.20); opacity: 1;     z-index: 3; }
                12.5% { left: 23%; top: 66%; transform: translate(-50%, -50%) scale(1.13); opacity: 0.93;  z-index: 3; }
                25%   { left: 12%; top: 45%; transform: translate(-50%, -50%) scale(0.95); opacity: 0.78;  z-index: 2; }
                37.5% { left: 23%; top: 24%; transform: translate(-50%, -50%) scale(0.77); opacity: 0.62;  z-index: 1; }
                50%   { left: 50%; top: 15%; transform: translate(-50%, -50%) scale(0.70); opacity: 0.55;  z-index: 1; }
                62.5% { left: 77%; top: 24%; transform: translate(-50%, -50%) scale(0.77); opacity: 0.62;  z-index: 1; }
                75%   { left: 88%; top: 45%; transform: translate(-50%, -50%) scale(0.95); opacity: 0.78;  z-index: 2; }
                87.5% { left: 77%; top: 66%; transform: translate(-50%, -50%) scale(1.13); opacity: 0.93;  z-index: 3; }
                100%  { left: 50%; top: 75%; transform: translate(-50%, -50%) scale(1.20); opacity: 1;     z-index: 3; }
              }
              .cp-orbit-banner {
                position: relative; height: 400px; overflow: hidden; border-radius: 10px;
                box-shadow: inset 0 0 0 1px rgba(var(--gold-rgb),.12), 0 8px 40px rgba(0,0,0,.55);
                margin: 1.75rem 0 1rem;
              }
              .cp-orbit-item {
                position: absolute;
                width: 150px; aspect-ratio: 1 / 1;
                animation: cp-orbit 21s linear infinite;
              }
              .cp-orbit-1 { animation-delay: 0s; }
              .cp-orbit-2 { animation-delay: -7s; }
              .cp-orbit-3 { animation-delay: -14s; }
              .cp-portrait {
                width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
                border: 3px solid var(--gold); background: var(--bg-secondary);
                box-shadow: 0 0 24px rgba(var(--gold-rgb),.45), 0 10px 30px rgba(0,0,0,.6);
              }
              .cp-portrait img { width: 100%; height: 100%; object-fit: cover; }
              .cp-orbit-label {
                position: absolute; bottom: -1.6rem; left: 50%; transform: translateX(-50%);
                font-family: var(--font-cinzel); font-size: 0.7rem; letter-spacing: 0.1em;
                text-transform: uppercase; color: var(--gold-light); white-space: nowrap;
              }
            `}</style>

            <figure style={{ margin: '1.75rem 0 2.5rem' }}>
              <div className="cp-orbit-banner">
                <div className="pl-wrap" aria-hidden>
                  <div className="pl-track pl-sky">
                    {Array.from({ length: 6 }, (_, i) => (<img key={i} src="/img/bases/parallax/Sky.png" alt="" />))}
                  </div>
                  <div className="pl-track pl-down">
                    {Array.from({ length: 6 }, (_, i) => (<img key={i} src="/img/bases/parallax/DownLayer.png" alt="" />))}
                  </div>
                  <div className="pl-track pl-mid">
                    {Array.from({ length: 6 }, (_, i) => (<img key={i} src="/img/bases/parallax/MiddleLayer.png" alt="" />))}
                  </div>
                  <div className="pl-track pl-top">
                    {Array.from({ length: 6 }, (_, i) => (<img key={i} src="/img/bases/parallax/TopLayer.png" alt="" />))}
                  </div>
                  <div className="pl-light" />
                </div>

                <div style={{ position: 'absolute', inset: 0 }}>
                  <div className="cp-orbit-item cp-orbit-1">
                    <div className="cp-portrait"><img src="/img/bases/pequeno.jpg" alt="Inseto de tamanho pequeno" /></div>
                    <span className="cp-orbit-label">Pequeno</span>
                  </div>
                  <div className="cp-orbit-item cp-orbit-2">
                    <div className="cp-portrait"><img src="/img/bases/medio.jpg" alt="Inseto de tamanho médio" /></div>
                    <span className="cp-orbit-label">Médio</span>
                  </div>
                  <div className="cp-orbit-item cp-orbit-3">
                    <div className="cp-portrait"><img src="/img/bases/grande.jpg" alt="Inseto de tamanho grande" /></div>
                    <span className="cp-orbit-label">Grande</span>
                  </div>
                </div>

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 70%, var(--bg) 100%)', pointerEvents: 'none' }} aria-hidden />
              </div>
              <figcaption style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.6rem 1rem 0' }}>
                Pequeno, médio ou grande — o tamanho do seu inseto orbita as escolhas que moldam sua jornada.
              </figcaption>
            </figure>

            <div style={{ margin: '1.5rem 0 2rem', padding: '1.25rem 1.5rem', background: 'rgba(var(--gold-rgb),0.04)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 8 }}>
              <p style={{ color: 'rgba(var(--text-rgb),0.75)', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Para auxiliar nesta aventura, Filhos do Vazio conta com um{' '}
                <Link href="/criar-personagem" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                  assistente de criação de personagem
                </Link>{' '}
                — ele guia você por cada escolha, calcula seus valores e monta a ficha automaticamente.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Mas se preferir fazer manualmente, basta seguir os passos abaixo.
              </p>
            </div>

            <SubTitle>🪲 Seu Corpo</SubTitle>
            <P>Nenhum inseto nasce igual ao outro.</P>
            <P>Alguns são pequenos o bastante para atravessar rachaduras invisíveis aos demais.</P>
            <P>Outros carregam uma carapaça robusta ou uma presença capaz de intimidar apenas por existir.</P>
            <P>
              Seu <strong>Tamanho</strong> define os atributos iniciais do personagem. Eles representam
              aquilo que faz parte da sua natureza antes mesmo de qualquer treinamento.
            </P>
            <Table>
              <thead>
                <tr>
                  <Th>Tamanho</Th><Th>Poder</Th><Th>Graça</Th><Th>Casca</Th><Th>Saber</Th>
                  <Th>Fofo</Th><Th>Assustador</Th><Th>Corações</Th><Th>Sustento</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>Pequeno</Td><Td>2</Td><Td>4</Td><Td>3</Td><Td>3</Td><Td>2</Td><Td>0</Td><Td>4</Td><Td>1</Td></tr>
                <tr><Td>Médio</Td><Td>3</Td><Td>3</Td><Td>3</Td><Td>3</Td><Td>1</Td><Td>1</Td><Td>5</Td><Td>2</Td></tr>
                <tr><Td>Grande</Td><Td>4</Td><Td>2</Td><Td>3</Td><Td>3</Td><Td>0</Td><Td>2</Td><Td>6</Td><Td>3</Td></tr>
              </tbody>
            </Table>
            <P>Esses valores representam apenas o início da sua história.</P>
            <P>As próximas escolhas definirão quem você realmente é.</P>

            <SubTitle>🎭 Traços de Personalidade</SubTitle>
            <Quote>
              Todo aventureiro possui uma história.
              <br />
              Alguns apenas carregam a própria de maneira mais evidente.
            </Quote>
            <P>Escolha exatamente <strong>2 Traços de Personalidade</strong>.</P>
            <P>
              Eles representam crenças, defeitos, virtudes e hábitos que acompanham seu personagem desde
              antes da campanha começar.
            </P>
            <P>Cada traço concede um benefício mecânico, mas também traz um compromisso de interpretação.</P>
            <P>
              Esses compromissos fazem parte do jogo. O Mestre poderá criar situações em que sua
              personalidade será colocada à prova. Se você não deseja interpretar determinado comportamento,
              escolha outro traço.
            </P>
            <P>Assim como pessoas mudam, personagens também mudam.</P>
            <P>
              Um acontecimento marcante, um trauma, uma grande vitória ou até o encontro com sua própria
              Sombra podem transformar sua maneira de enxergar o mundo. Sempre que a história justificar, o
              Mestre poderá permitir que um Traço de Personalidade seja substituído por outro.
            </P>
            <P>
              Consulte a lista completa no{' '}
              <Link href="/como-jogar/tracos" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                Compêndio de Traços
              </Link>
              , seção Traços de Personalidade, ou{' '}
              <TraitsModalLink mode="personality" title="Traços de Personalidade">clicando aqui</TraitsModalLink>.
            </P>

            <SubTitle>💪 Traços de atributos</SubTitle>
            <Quote>
              A vida deixa marcas.
              <br />
              Algumas aparecem na carapaça.
              <br />
              Outras moldam quem você é para sempre.
            </Quote>
            <P>Agora escolha <strong>7 Traços</strong>.</P>
            <P>
              Eles representam talentos naturais, características físicas, hábitos desenvolvidos e pequenas
              vantagens adquiridas antes do início da campanha.
            </P>
            <P>Alguns aumentam um atributo.</P>
            <P>Outros fortalecem uma característica em troca de outra.</P>
            <P>Nenhuma combinação é proibida.</P>
            <P>Cada escolha apenas conta uma história diferente.</P>
            <P>
              Consulte a lista completa no{' '}
              <Link href="/como-jogar/tracos" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                Compêndio de Traços
              </Link>
              , seção Traços, ou{' '}
              <TraitsModalLink mode="attributes" title="Traços">clicando aqui</TraitsModalLink>.
            </P>

            <SubTitle>✨ Traços Especiais</SubTitle>
            <Quote>
              Nenhum aventureiro é igual ao outro.
              <br />
              Alguns nasceram com asas.
              <br />
              Outros com ferrões.
              <br />
              Há aqueles que carregam dons que desafiam toda explicação.
            </Quote>
            <P>Os Traços Especiais representam tudo aquilo que torna seu personagem único além dos seus atributos.</P>
            <P>
              Eles podem conceder armas naturais, adaptações do corpo, sentidos aguçados, formas incomuns de
              locomoção, talentos sociais ou até afinidade com o Vazio.
            </P>
            <P>Escolha <strong>7 Traços Especiais</strong>, respeitando os limites de raridade.</P>

            <SubTitle>Raridade</SubTitle>
            <P>Os Traços Especiais são divididos em três categorias.</P>
            <Table>
              <thead>
                <tr><Th>Raridade</Th><Th>Limite</Th></tr>
              </thead>
              <tbody>
                <tr><Td>Comum</Td><Td>Sem limite</Td></tr>
                <tr><Td>Marcante</Td><Td>Até 3</Td></tr>
                <tr><Td>Raro</Td><Td>Até 1</Td></tr>
              </tbody>
            </Table>

            <SubTitle>Subtraços</SubTitle>
            <P>Alguns Traços podem ser aprimorados por meio de Subtraços.</P>
            <P>Você só pode escolher um Subtraço se possuir seu Traço principal.</P>
            <P>Os Subtraços não consomem uma das suas 7 escolhas, mas continuam contando para os limites de raridade.</P>

            <SubTitle>Consultando os Traços</SubTitle>
            <P>A lista completa de Traços Especiais faz parte do Compêndio de Traços, um material separado deste livro.</P>
            <P>
              Se você estiver utilizando o Criador de Personagens no site de Filhos do Vazio, o Compêndio
              será gerado automaticamente com todos os Traços disponíveis na sua campanha.
            </P>
            <P>Caso esteja jogando com o material impresso, basta utilizar a versão mais recente do Compêndio de Traços.</P>
            <P>
              Consulte a lista completa no{' '}
              <Link href="/como-jogar/tracos" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                Compêndio de Traços
              </Link>
              , seção Traços Especiais, ou{' '}
              <TraitsModalLink mode="attributes" title="Traços Especiais">clicando aqui</TraitsModalLink>.
            </P>

            <SubTitle>Escolha sua Trilha</SubTitle>
            <Quote>
              Todo aventureiro aprende a lutar.
              <br />
              Mas nenhum aprende da mesma forma.
            </Quote>
            <P>Os atributos definem aquilo que você é.</P>
            <P>Os Traços definem aquilo que nasceu com você.</P>
            <P>A Trilha define como você enfrenta o mundo.</P>
            <P>
              Ela representa anos de treinamento, prática, devoção ou estudo. É o conjunto de técnicas que
              seu personagem domina e aperfeiçoará ao longo da jornada.
            </P>
            <P>Ao criar seu personagem, escolha uma Trilha.</P>
            <P>Cada Trilha possui três estágios de evolução:</P>
            <Ul>
              <Li>🌱 <strong>Iniciado</strong> — o primeiro passo nesse caminho.</Li>
              <Li>🛡 <strong>Veterano</strong> — domínio das técnicas fundamentais.</Li>
              <Li>👑 <strong>Mestre</strong> — a expressão máxima da Trilha.</Li>
            </Ul>
            <P>
              Neste momento, escolha apenas uma Trilha e receba sua habilidade de Iniciado. As demais
              habilidades serão conquistadas conforme seu personagem evoluir.
            </P>

            <SubTitle>Estamina e Alma</SubTitle>
            <P>Todo aventureiro possui uma reserva de energia física e espiritual.</P>
            <Table>
              <thead>
                <tr><Th>Recurso</Th><Th>Fórmula</Th></tr>
              </thead>
              <tbody>
                <tr><Td>Estamina Máxima</Td><Td>3 + Graça</Td></tr>
                <tr><Td>Alma Máxima</Td><Td>3 + Saber</Td></tr>
              </tbody>
            </Table>
            <P>Esses valores podem aumentar por efeitos de Fragmentos, equipamentos e outras habilidades.</P>

            <SubTitle>⚔️ Trilhas Marciais</SubTitle>
            <P>
              As Trilhas Marciais são caminhos de disciplina, técnica e resistência. Seus praticantes
              confiam no próprio corpo e no treinamento para superar qualquer desafio.
            </P>

            <TrilhaCard title="Pressão" italic="A melhor defesa do inimigo é o tempo que ele tem para reagir. Não lhe dê esse tempo.">
              <P>
                Você domina um estilo de combate baseado em manter o adversário constantemente sob ataque,
                reduzindo suas opções até que ele cometa um erro.
              </P>
              <StageLabel>🌱 Iniciado — Pressão Acumulada</StageLabel>
              <P>Sempre que acertar um ataque contra uma criatura, ela recebe 1 marcador de Pressão, até o máximo de 2.</P>
              <P>Cada marcador reduz a Casca da criatura em 1.</P>
              <P>Os marcadores permanecem enquanto você continuar atacando esse alvo.</P>
              <Ul>
                <Li>Acertar adiciona 1 marcador.</Li>
                <Li>Errar um ataque não remove os marcadores, mas também não adiciona novos.</Li>
                <Li>Os marcadores são removidos caso você passe um turno sem atacar esse alvo ou ataque outra criatura.</Li>
              </Ul>
            </TrilhaCard>

            <TrilhaCard title="Mira" italic="Antes que o inimigo alcance você, ele já deve ter sentido o primeiro disparo.">
              <P>Você domina armas de longo alcance e sabe transformar distância em vantagem.</P>
              <StageLabel>🌱 Iniciado — Bom Braço</StageLabel>
              <P>Você recebe +1 dado em todos os ataques à distância.</P>
              <P>Além disso, o alcance de arremesso de armas aumenta em 2 quadrados.</P>
            </TrilhaCard>

            <TrilhaCard title="Bastião" italic="Enquanto eu permanecer de pé, ninguém passa.">
              <P>Você transforma sua defesa em uma muralha para proteger a si mesmo e seus aliados.</P>
              <StageLabel>🌱 Iniciado — Defensor Nato</StageLabel>
              <P>Resultados 4 também contam como sucessos em testes de Bloqueio e Aparo.</P>
            </TrilhaCard>

            <SubTitle>✨ Trilhas Místicas</SubTitle>
            <P>
              As Trilhas Místicas exploram o poder da Alma e os mistérios do Vazio. Seus praticantes
              compreendem que nem toda batalha é vencida apenas com força física.
            </P>

            <TrilhaCard title="Fluxo das Almas" italic="A Alma é invisível apenas para quem nunca aprendeu a enxergá-la.">
              <P>Você aprende a canalizar sua Alma como uma extensão do próprio corpo.</P>
              <StageLabel>🌱 Iniciado — Lâmina de Alma</StageLabel>
              <P>Gaste 2 Alma antes de realizar um ataque.</P>
              <P>Se o ataque acertar, ele ignora toda a Casca do alvo, causa +1 de dano e você recupera 1 Alma.</P>
            </TrilhaCard>

            <TrilhaCard title="Manto" italic="O Vazio não cria caminhos. Ele permite atravessá-los.">
              <P>Você utiliza a energia do Vazio para desaparecer de um lugar e surgir em outro num instante.</P>
              <StageLabel>🌱 Iniciado — Rasante</StageLabel>
              <P>Gaste 1 Alma para mover-se instantaneamente até 3 quadrados, ignorando criaturas, terreno difícil e obstáculos baixos.</P>
              <P>Esse movimento não provoca Ataques de Oportunidade.</P>
            </TrilhaCard>

            <TrilhaCard title="Devoto" italic="Toda oração tem um preço. Toda bênção também.">
              <P>
                Você entrega sua Alma a uma entidade, crença ou ideal, aprendendo a utilizá-la para proteger
                aliados ou punir inimigos.
              </P>
              <P>Ao escolher esta Trilha, você recebe automaticamente o Traço de Personalidade Devoto.</P>
              <StageLabel>🌱 Iniciado — Toque Devoto</StageLabel>
              <P>Uma vez por turno, como ação, toque uma criatura.</P>
              <P>Você pode gastar Alma para:</P>
              <Ul>
                <Li>Curar um aliado, ou</Li>
                <Li>Causar dano direto a um inimigo, ignorando Casca.</Li>
              </Ul>
              <P>O custo é cumulativo.</P>
              <Table>
                <thead>
                  <tr><Th>Alma Gasta</Th><Th>Efeito</Th></tr>
                </thead>
                <tbody>
                  <tr><Td>1</Td><Td>Cura 1 Coração ou causa 1 de dano.</Td></tr>
                  <tr><Td>3 (1 + 2)</Td><Td>Cura 2 Corações ou causa 2 de dano.</Td></tr>
                  <tr><Td>6 (1 + 2 + 3)</Td><Td>Cura 3 Corações ou causa 3 de dano.</Td></tr>
                </tbody>
              </Table>
              <P>
                Além disso, sempre que utilizar esta habilidade, você pode remover um efeito de Dano ao
                Longo do Tempo (DoT) do alvo.
              </P>
            </TrilhaCard>

            <SubTitle>Equipamento</SubTitle>
            <P>Comece com 50 Geo ou escolha um dos pacotes iniciais.</P>
            <P>
              Geo são cristais minerais formados naturalmente nas camadas profundas da Crosta Eterna.
              Servem como padrão de troca, valor e fabricação entre viajantes e assentamentos.
            </P>

            <SubTitle>Limites do Corpo</SubTitle>
            <P>O que um inseto carrega define tanto quanto sua força.</P>
            <Ul>
              <Li>Você pode carregar até o <strong>dobro do seu Poder</strong> em peso total.</Li>
              <Li>Você pode empunhar apenas até o <strong>valor do seu Poder</strong> em equipamentos ativos.</Li>
            </Ul>
            <P>
              Armaduras, armas e equipamentos pesados fazem parte desse limite e podem restringir o que seu
              corpo é capaz de fazer em combate.
            </P>
            <Quote>Máscaras podem ser apenas estéticas… ou esconder algo muito maior.</Quote>

            <SubTitle>Uso de Itens</SubTitle>
            <P>Itens podem ser usados de duas formas:</P>
            <Ul>
              <Li><strong>Acesso rápido</strong> — usados imediatamente durante a cena.</Li>
              <Li><strong>Guardados</strong> — exigem preparação e tempo para serem recuperados.</Li>
            </Ul>

            <SubTitle>Compêndio</SubTitle>
            <P>
              Outros equipamentos, armas, armaduras, máscaras e itens especiais podem ser encontrados,
              comprados ou construídos ao longo da campanha.
            </P>
            <P>
              Escolha seu pacote inicial consultando o{' '}
              <Link href="/como-jogar/itens" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                Compêndio de Itens
              </Link>
              , seção Pacotes Iniciais, ou{' '}
              <EquipmentPackagesModalLink>clicando aqui</EquipmentPackagesModalLink>.
            </P>
            <P>
              Para ver a lista completa de itens disponíveis para compra, consulte o{' '}
              <Link href="/como-jogar/itens" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
                Compêndio de Itens
              </Link>.
            </P>

            <SubTitle>Dê Vida ao seu Inseto</SubTitle>
            <P>Nome, espécie, aparência, história.</P>
            <P>
              O mundo de Crosta Eterna é vasto e decadente — repleto de ruínas antigas, caminhos esquecidos
              e verdades enterradas sob camadas de silêncio.
            </P>
            <P>De onde seu inseto veio… e por que ele continua caminhando?</P>

            <style>{`
              .trilha-comic-box {
                position: absolute;
                background: #F0E6C8; border: 2.5px solid #0D1018;
                padding: .55rem 1rem;
                bottom: 8%; right: 3%; max-width: min(90%, 520px);
                transform: skewX(-3deg);
                box-shadow: 4px 4px 0 #0D1018;
              }
              .trilha-comic-box p {
                font-family: var(--font-im-fell); font-style: italic;
                color: #0D1018; margin: 0; line-height: 1.55;
                font-size: clamp(0.72rem, 1.6vw, 1.1rem);
                transform: skewX(3deg);
              }
              @media (max-width: 639px) {
                .trilha-comic-box { max-width: 90vw; bottom: 5%; right: 2%; }
              }
            `}</style>

            <figure style={{ position: 'relative', margin: '1.75rem 0 2.5rem' }}>
              <div
                style={{
                  position: 'relative',
                  height: 340,
                  overflow: 'hidden',
                  clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)',
                  boxShadow: '0 20px 45px -20px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src="/banner.jpeg"
                  alt="Aventureiro de Filhos do Vazio diante das ruínas de Kishar, no fim de sua jornada de criação"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="trilha-comic-box">
                  <p>No fim, não é o mundo que define o aventureiro — é a forma como ele escolhe atravessá-lo.</p>
                </div>
              </div>
            </figure>

            {/* ─── 4. Tutorial Prático ────────────────── */}
            <SectionTitle id="tutorial">4. Tutorial Prático — Um Dia na Vida de Orin</SectionTitle>

            <Quote>
              As melhores histórias raramente começam com grandes heróis.
              <br />
              Às vezes, começam com uma entrega atrasada.
            </Quote>

            <P>
              O sol ainda não havia alcançado as camadas superiores da Crosta Eterna quando Orin terminou
              de organizar sua mochila.
            </P>
            <P>
              Pequeno, persistente e curioso até demais, ele vivia de pequenos trabalhos entre os
              assentamentos próximos. Não pagavam muito, mas eram suficientes para conseguir comida, manter
              os equipamentos em ordem e voltar para casa no fim do dia.
            </P>
            <P>Ou pelo menos era isso que normalmente acontecia.</P>
            <P>Naquela manhã, uma velha cigarra o aguardava do lado de fora do abrigo.</P>
            <Quote>— Tenho um serviço.</Quote>
            <P>Ela colocou sobre a mesa uma pequena caixa de madeira escura, presa por cordões de fibra.</P>
            <P>Era pesada para seu tamanho.</P>
            <P>Nenhuma marca.</P>
            <P>Nenhum símbolo.</P>
            <P>Nenhuma indicação do que havia dentro.</P>
            <Quote>— Leve isso até o Entreposto da Ponte Partida.</Quote>
            <P>Orin pegou a caixa.</P>
            <P>Ela estava... morna.</P>
            <Quote>— E não abra.</Quote>
            <P>A cigarra foi embora sem explicar mais nada.</P>

            <P>Seu personagem está pronto.</P>
            <P>
              Nesta aventura você vai ser Orin, um pequeno besouro de carapaça castanho-escura, com algumas
              marcas de desgaste e um velho manto preso sobre as costas. Carrega uma mochila simples, um
              cantil pendurado na cintura e uma adaga de quitina bastante usada, mas bem cuidada.
            </P>
            <P>
              Antes de iniciar a jornada, confira sua ficha, revise seus equipamentos e relembre a
              habilidade da sua Trilha.
            </P>

            <div className="card" style={{ padding: '1.5rem', borderRadius: 12, margin: '1.5rem 0 2rem', background: 'var(--bg-secondary)' }}>
              <h3 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>Orin</h3>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Espécie: Besouro · Tamanho: Pequeno · Trilha: Pressão (🌱 Iniciado)
              </p>

              <StageLabel>Personalidade</StageLabel>
              <Ul>
                <Li>Curioso</Li>
                <Li>Obstinado</Li>
              </Ul>

              <StageLabel>Atributos</StageLabel>
              <Table>
                <thead><tr><Th>Atributo</Th><Th>Valor</Th></tr></thead>
                <tbody>
                  <tr><Td>💪 Poder</Td><Td>2</Td></tr>
                  <tr><Td>🪶 Graça</Td><Td>5</Td></tr>
                  <tr><Td>🛡 Casca</Td><Td>3</Td></tr>
                  <tr><Td>🧠 Saber</Td><Td>4</Td></tr>
                </tbody>
              </Table>

              <StageLabel>Sociais</StageLabel>
              <Table>
                <thead><tr><Th>Atributo</Th><Th>Valor</Th></tr></thead>
                <tbody>
                  <tr><Td>😊 Fofo</Td><Td>2</Td></tr>
                  <tr><Td>😠 Assustador</Td><Td>0</Td></tr>
                </tbody>
              </Table>

              <StageLabel>Recursos</StageLabel>
              <Table>
                <thead><tr><Th>Recurso</Th><Th>Valor</Th></tr></thead>
                <tbody>
                  <tr><Td>❤️ Corações</Td><Td>4</Td></tr>
                  <tr><Td>⚡ Estamina</Td><Td>8 (3 + Graça)</Td></tr>
                  <tr><Td>✨ Alma</Td><Td>7 (3 + Saber)</Td></tr>
                </tbody>
              </Table>
              <P>Sustento: 1 por descanso</P>

              <StageLabel>Trilha — Pressão</StageLabel>
              <P>🌱 Iniciado — Pressão Acumulada</P>
              <P>Ao acertar um ataque contra uma criatura, ela recebe 1 marcador de Pressão (máximo 2).</P>
              <P>Cada marcador reduz sua Casca em 1.</P>
              <P>Os marcadores permanecem enquanto Orin continuar atacando o mesmo alvo.</P>

              <StageLabel>Equipamentos</StageLabel>
              <Ul>
                <Li>Adaga de Quitina</Li>
                <Li>Manto de Viagem</Li>
                <Li>Cantil</Li>
                <Li>Ração ×2</Li>
                <Li>Corda (10 metros)</Li>
                <Li>10 Geo</Li>
              </Ul>

              <StageLabel>Empunhado</StageLabel>
              <Table>
                <thead><tr><Th>Mão</Th><Th>Item</Th></tr></thead>
                <tbody>
                  <tr><Td>Principal</Td><Td>Adaga (1)</Td></tr>
                  <tr><Td>Secundária</Td><Td>Livre</Td></tr>
                </tbody>
              </Table>

              <StageLabel>Manto do Viajante — 2 espaços de acesso rápido</StageLabel>
              <Ul>
                <Li>Lamparina bioluminescente</Li>
                <Li>Adaga de arremesso</Li>
              </Ul>
            </div>

            <P>
              Tudo o que vier a partir daqui será aprendido durante a aventura, assim como Orin aprenderá ao
              longo do caminho.
            </P>
            <P>Agora é hora de dar o primeiro passo.</P>

            <SubTitle>Saindo de Casa</SubTitle>
            <P>Orin prende a mochila às costas, ajusta o manto e confere pela última vez a pequena caixa de madeira.</P>
            <P>Continua fechada.</P>
            <P>Sem marcas.</P>
            <P>Sem qualquer indicação do que há dentro.</P>
            <P>Mesmo assim...</P>
            <P>É difícil ignorar a sensação de que ela pesa mais do que deveria.</P>
            <P>Ele respira fundo, fecha a porta do abrigo e segue pelo velho túnel que leva para fora do assentamento.</P>
            <Quote>A viagem começou.</Quote>

            <SubTitle>Nem Toda Ação Exige um Teste</SubTitle>
            <P>Durante uma aventura, você diz ao Mestre o que seu personagem pretende fazer.</P>
            <P>Se não houver risco, pressão ou consequência para uma falha, a ação simplesmente acontece.</P>
            <Quote>
              Orin consegue caminhar pelos túneis, guardar a caixa na mochila e seguir viagem sem precisar
              rolar dados.
            </Quote>
            <P>Os testes só entram em cena quando o resultado é incerto ou quando uma falha pode mudar a história.</P>

            <SubTitle>O Caminho Silencioso</SubTitle>
            <P>
              O túnel é estreito, mas familiar. Raízes grossas atravessam o teto, gotas d&apos;água caem
              lentamente das paredes e pequenos fungos iluminam o caminho com um brilho azulado.
            </P>
            <P>Orin já percorreu aquela rota dezenas de vezes.</P>
            <P>Por isso, quando tudo fica silencioso de repente...</P>
            <P>...ele percebe.</P>
            <P>Até o gotejar da água desapareceu.</P>
            <P>Algo está diferente.</P>

            <OrinSpeech>Parece que algo não está certo...</OrinSpeech>

            <RuleBox title="Teste de Saber">
              <P>
                Quando você procura detalhes, percebe perigos ou tenta entender o ambiente ao seu redor,
                faça um teste de Saber. Trata-se de um teste que mescla seu conhecimento e sua percepção de
                mundo — todo teste que exige essas qualidades pode ser decidido com o Saber.
              </P>
              <Quote>Exemplo: Orin decide observar o túnel antes de continuar.</Quote>
              <P>O Mestre define a dificuldade conforme a situação; neste caso, a dificuldade é 1.</P>
              <P>Orin tem 4 de Saber.</P>
              <P>Role um número de d6 igual ao seu valor de Saber.</P>
              <P>Cada resultado 5 ou 6 conta como 1 sucesso.</P>
            </RuleBox>

            <DiceRoller
              label="Rolar 4d6 (Saber)"
              diceCount={4}
              successContent={
                <>
                  <P>Orin se ajoelha e observa o chão.</P>
                  <P>Entre a poeira e pequenas pedras soltas, há marcas recentes.</P>
                  <P>Não parecem pegadas de um predador.</P>
                  <P>São leves demais.</P>
                  <P>Alguém passou por ali há pouco tempo.</P>
                  <P>Talvez apenas outro viajante.</P>
                  <P>Talvez não.</P>
                </>
              }
              failContent={
                <>
                  <P>Orin examina o túnel por alguns instantes, mas não encontra nada incomum.</P>
                  <P>O silêncio o incomoda, porém ele não consegue descobrir o motivo.</P>
                  <P>Depois de ajustar a mochila sobre as costas, continua sua caminhada.</P>
                </>
              }
            />

            <SubTitle>O Atalho</SubTitle>
            <P>Depois de mais alguns minutos de caminhada, o túnel principal se divide em dois.</P>
            <P>O caminho da esquerda é largo e seguro, mas faz uma longa volta antes de chegar ao destino.</P>
            <P>O da direita é diferente.</P>
            <P>Uma antiga rachadura corta a parede de pedra, estreita demais para a maioria dos insetos.</P>
            <P>Orin conhece aquele lugar desde pequeno.</P>
            <P>Ser pequeno às vezes tem suas vantagens.</P>

            <RuleBox title="Tamanho Importa">
              <P>Insetos de tamanhos diferentes interagem com o mundo de formas diferentes.</P>
              <P>Orin é um inseto Pequeno.</P>
              <P>Isso permite que ele atravesse passagens estreitas que insetos Médios e Grandes simplesmente não conseguem utilizar.</P>
            </RuleBox>

            <P>Às vezes, o melhor caminho não é o mais rápido...</P>
            <Quote>É o único pelo qual você consegue passar.</Quote>
            <P>Orin sorri discretamente.</P>
            <P>O atalho ainda existe.</P>
            <P>Mas uma pedra desprendida bloqueia parte da passagem.</P>
            <P>Ela não é grande.</P>
            <P>Só pesada o bastante para impedir sua passagem.</P>

            <RuleBox title="Teste de Poder">
              <P>
                Quando um personagem precisa mover um obstáculo, levantar peso, empurrar algo ou usar sua
                força física, faça um teste de Poder.
              </P>
              <P>Role um número de d6 igual ao seu valor de Poder.</P>
              <P>Cada resultado 5 ou 6 conta como 1 sucesso.</P>
              <P>Orin possui Poder 2, então ele rola 2d6.</P>
              <P>O Mestre determina a dificuldade conforme o desafio.</P>
              <P>Neste caso, 1 sucesso basta para deslocar a pedra.</P>
            </RuleBox>

            <DiceRoller
              label="Rolar 2d6 (Poder)"
              diceCount={2}
              revealBoth
              successContent={
                <>
                  <P>Com um último empurrão, a pedra desliza alguns centímetros.</P>
                  <P>O espaço agora é suficiente.</P>
                  <P>Orin prende a respiração e atravessa a abertura sem dificuldades.</P>
                </>
              }
              failContent={
                <>
                  <P>A pedra sequer se move.</P>
                  <P>Orin tenta novamente, muda a posição das mãos, faz mais força...</P>
                  <P>Nada.</P>
                  <P>Resmungando baixinho, ele desiste do atalho e volta para o caminho principal.</P>
                </>
              }
            />
            <Quote>
              Nem toda falha impede a aventura.
              <br />
              Às vezes, ela apenas torna a viagem um pouco mais longa.
            </Quote>

            <P><strong>Se Orin encontrou o atalho...</strong></P>
            <P>Depois de atravessar a passagem estreita, a viagem continua tranquila.</P>
            <P>
              O velho atalho economiza um bom tempo de caminhada, e antes que o sol alcance seu ponto mais
              alto, Orin já está novamente no caminho principal.
            </P>

            <P><strong>Se Orin não conseguiu mover a pedra...</strong></P>
            <P>Orin suspira, olha mais uma vez para a passagem bloqueada e decide não insistir.</P>
            <Quote>Nem sempre vale a pena lutar contra uma pedra.</Quote>
            <P>Ele volta pelo caminho principal e segue viagem.</P>
            <Quote>Às vezes o caminho mais curto simplesmente não é o seu.</Quote>

            <P><strong>De qualquer forma...</strong></P>
            <P>Seja pelo atalho ou pela estrada principal, as horas passam.</P>
            <P>A mochila pesa um pouco mais.</P>
            <P>Os pés começam a reclamar.</P>
            <P>E o estômago também.</P>
            <P>Chega a hora de fazer uma pausa.</P>

            <GMNote title="Uma observação para Mestres">
              <P>Em RPG, resultados diferentes nem sempre significam histórias completamente diferentes.</P>
              <P>
                Às vezes, o sucesso apenas economiza tempo. Outras vezes, a falha cria uma nova dificuldade.
                E, em muitas situações, ambos os caminhos acabam levando ao mesmo destino — apenas por
                experiências diferentes.
              </P>
              <P>
                O importante não é manter os personagens nos trilhos, mas garantir que suas escolhas e seus
                sucessos ou fracassos tenham consequências interessantes.
              </P>
            </GMNote>

            <SubTitle>Uma Pausa na Jornada</SubTitle>
            <P>Orin encontra um tronco caído protegido pelas raízes de uma árvore gigantesca.</P>
            <P>É um bom lugar para recuperar o fôlego.</P>
            <P>Orin apoia a mochila sobre uma raiz grossa e se senta por alguns minutos.</P>
            <P>A caminhada foi mais longa do que imaginava.</P>
            <P>Ele bebe um pouco de água, respira fundo e pega uma de suas rações.</P>
            <P>Não é uma grande refeição.</P>
            <P>Mas é suficiente para recuperar as energias.</P>

            <RuleBox title="Descanso">
              <P>Quando os personagens encontram um local seguro, eles podem fazer um descanso.</P>
              <P>Após um descanso, recupere toda a sua Estamina.</P>
              <P>
                Se houver tempo, o Mestre também pode permitir outras atividades, como conversar, cozinhar,
                estudar um objeto ou realizar pequenos reparos em equipamentos.
              </P>
            </RuleBox>

            <RuleBox title="Sustento">
              <P>Durante cada descanso, seu personagem deve consumir seu valor de Sustento.</P>
              <P>Orin é um inseto Pequeno, portanto precisa consumir 1 de Sustento.</P>
              <P>Ele come uma de suas rações.</P>
            </RuleBox>

            <SheetUpdate>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', color: 'var(--text)' }}>Rações: 2 → 1</p>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', color: 'var(--text)' }}>Nível de Fome: 0</p>
            </SheetUpdate>

            <P>Enquanto guarda os pertences na mochila, seus olhos encontram novamente a pequena caixa.</P>
            <P>Ela continua fechada.</P>
            <P>Sem marcas.</P>
            <P>Sem fechaduras.</P>
            <P>Mesmo assim...</P>
            <Quote>É difícil desviar o olhar.</Quote>

            <RuleBox title="Teste de Personalidade">
              <P>Alguns traços de personalidade podem colocar o personagem em situações difíceis.</P>
              <P>
                Nesses momentos, o Mestre pode pedir um teste para verificar se o personagem consegue
                resistir aos próprios impulsos.
              </P>
              <P>Orin possui o traço Curioso.</P>
              <P>Para ignorar completamente a caixa, ele deve fazer um teste de Saber.</P>
              <P>Role seus 4 dados.</P>
              <P>Neste caso, são necessários 2 sucessos.</P>
            </RuleBox>

            <DiceRoller
              label="Rolar 4d6 (Saber)"
              diceCount={4}
              requiredSuccesses={2}
              successContent={
                <>
                  <P>Orin respira fundo.</P>
                  <OrinSpeech>Não é da minha conta.</OrinSpeech>
                  <P>Fecha a mochila e continua a viagem.</P>
                  <P>Mas a sensação permanece.</P>
                </>
              }
              failContent={
                <>
                  <P>Orin tenta ignorar a caixa.</P>
                  <P>Não consegue.</P>
                  <P>Ele a retira da mochila.</P>
                  <P>Passa os dedos sobre a madeira.</P>
                  <P>Não há fechadura.</P>
                  <P>Não há mecanismo.</P>
                  <P>Só um simples cordão mantendo a tampa fechada.</P>
                  <OrinSpeech>É só uma olhada...</OrinSpeech>
                  <P>Ele afrouxa lentamente o primeiro nó.</P>
                  <P>...</P>
                  <P>E para.</P>
                  <P>A voz da velha cigarra ecoa em sua cabeça.</P>
                  <Quote>— Não abra.</Quote>
                  <P>Depois de alguns segundos de hesitação, prende novamente o cordão e devolve a caixa à mochila.</P>
                  <P>Ainda não.</P>
                </>
              }
            />

            <GMNote title="Traços de Personalidade Contam Histórias">
              <P>Eles não servem apenas para conceder bônus em testes.</P>
              <P>
                Às vezes, um traço faz o personagem agir de uma determinada forma, cria conflitos ou coloca
                decisões difíceis diante dele.
              </P>
              <P>Cabe ao Mestre decidir quando esses momentos acontecem.</P>
            </GMNote>

            <SubTitle>Um Som no Escuro</SubTitle>
            <P>Depois do descanso, Orin retoma a caminhada.</P>
            <P>O túnel fica cada vez mais estreito.</P>
            <P>As raízes desaparecem aos poucos, dando lugar à pedra nua.</P>
            <P>O silêncio volta.</P>
            <P>Desta vez, porém...</P>
            <P>Ele é interrompido por um pequeno estalo.</P>
            <Quote>Tac.</Quote>
            <P>Logo à frente.</P>
            <P>Orin para imediatamente.</P>

            <GMNote title="Agir também é uma escolha">
              <P>Em RPG, o Mestre descreve a situação.</P>
              <P>Os jogadores dizem o que seus personagens fazem.</P>
              <P>Nem sempre existe uma única resposta correta.</P>
              <P>Se você estivesse no lugar de Orin, o que faria?</P>
              <Ul>
                <Li>Aproximar-se com cuidado.</Li>
                <Li>Observar de longe.</Li>
                <Li>Esconder-se.</Li>
                <Li>Chamar quem está ali.</Li>
                <Li>Dar meia-volta.</Li>
              </Ul>
              <P>Qualquer tentativa pode funcionar. O papel do Mestre é dizer o que acontece depois.</P>
            </GMNote>

            <P>Orin decide observar antes de seguir.</P>

            <RuleBox title="Teste de Saber">
              <P>Orin tenta descobrir de onde veio o barulho.</P>
              <P>Role 4d6 (seu valor de Saber).</P>
              <P>São necessários 2 sucessos.</P>
            </RuleBox>

            <DiceRoller
              label="Rolar 4d6 (Saber)"
              diceCount={4}
              requiredSuccesses={2}
              successContent={
                <>
                  <P>Entre duas pedras, Orin vê um pequeno besouro carregando um graveto muito maior do que ele.</P>
                  <P>O graveto escapa, bate na parede...</P>
                  <Quote>Tac.</Quote>
                  <P>Era apenas isso.</P>
                  <P>Orin sorri discretamente.</P>
                  <Quote>Às vezes, nossa imaginação cria perigos maiores do que a realidade.</Quote>
                </>
              }
              failContent={
                <>
                  <P>Orin não consegue identificar a origem do som.</P>
                  <P>Depois de alguns segundos de silêncio, decide continuar.</P>
                  <P>Ao passar pelo local, vê um pequeno besouro fugindo assustado com um enorme graveto nas costas.</P>
                  <P>Provavelmente foi ele quem fez o barulho.</P>
                </>
              }
            />

            <P>Enquanto continua caminhando...</P>
            <P>...Orin leva a mão até a mochila.</P>
            <P>Sem perceber.</P>
            <P>Como se quisesse confirmar que a caixa ainda está lá.</P>
            <P>Ela está.</P>
            <P>E continua...</P>
            <Quote>Morna.</Quote>

            <SubTitle>O Corredor Estreito</SubTitle>
            <P>Pouco depois, o túnel termina em uma passagem estreita entre duas grandes raízes.</P>
            <P>Do outro lado, uma pequena formiga-soldado revira o chão à procura de alimento.</P>
            <P>Ela ainda não percebeu Orin.</P>

            <GMNote title="Nem todo encontro termina em combate">
              <P>Quando uma criatura aparece, cabe aos jogadores decidir como agir.</P>
              <Ul>
                <Li>Você pode conversar.</Li>
                <Li>Pode observar.</Li>
                <Li>Pode fugir.</Li>
                <Li>Pode tentar passar despercebido.</Li>
                <Li>Ou pode enfrentar o perigo.</Li>
              </Ul>
            </GMNote>

            <P>Orin decide seguir em silêncio.</P>

            <RuleBox title="Teste de Graça">
              <P>
                Mover-se sem fazer barulho, esconder-se ou atravessar um local sem chamar atenção
                normalmente exige um teste de Graça.
              </P>
              <P>Orin possui Graça 5.</P>
              <P>Role 5d6.</P>
              <P>São necessários 2 sucessos.</P>
            </RuleBox>

            <DiceRoller
              label="Rolar 5d6 (Graça)"
              diceCount={5}
              requiredSuccesses={2}
              successContent={
                <>
                  <P>A formiga continua concentrada no alimento.</P>
                  <P>Orin espera o momento certo, atravessa lentamente a passagem e segue alguns metros adiante.</P>
                  <P>Atrás de uma grande raiz, ele para por um instante.</P>
                  <Quote>Conseguiu.</Quote>
                  <P>A formiga sequer percebeu sua presença.</P>
                  <P>Mas, enquanto observava a criatura para garantir que não seria visto...</P>
                  <P>...deixou de prestar atenção ao restante do túnel.</P>
                  <P>Quando volta a caminhar, escuta um estalo logo atrás de si.</P>
                  <P>Outra formiga.</P>
                  <P>Esta estava patrulhando a passagem e agora bloqueia o caminho.</P>
                  <Quote>Não há tempo para fugir.</Quote>
                </>
              }
              failContent={
                <>
                  <P>Uma pequena pedra escapa sob seus pés.</P>
                  <P>A formiga ergue imediatamente as antenas.</P>
                  <P>Ela abandona o alimento e corre em direção a Orin.</P>
                  <Quote>Não há tempo para se esconder.</Quote>
                </>
              }
            />

            <P>Em ambos os casos, Orin acaba diante de uma única formiga-soldado.</P>
            <P>Mas a situação é diferente.</P>
            <P>No primeiro caso, ele evitou um problema e foi surpreendido por outro.</P>
            <P>No segundo, foi descoberto logo de início.</P>
            <Quote>Os dois caminhos levam ao mesmo combate, mas por motivos diferentes.</Quote>

            <SubTitle>O Primeiro Combate</SubTitle>
            <P>A formiga ergue as antenas.</P>
            <P>Por um breve instante, os dois permanecem imóveis.</P>
            <P>Então ela avança.</P>
            <Quote>Não há mais como evitar o confronto.</Quote>

            <RuleBox title="Iniciativa">
              <P>Quando um combate começa, é preciso descobrir quem age primeiro.</P>
              <P>Para isso, cada participante faz um teste de Iniciativa.</P>
              <P>Role um número de dados igual à sua Graça e some os valores obtidos, em vez de contar sucessos.</P>
              <P>Quem obtiver o maior resultado age primeiro.</P>
              <Quote>Exemplo</Quote>
              <P>Orin possui Graça 5. Ele rola 5d6.</P>
              <P>3 • 5 • 2 • 6 • 4 = 20</P>
              <P>A formiga possui Graça 3. Ela rola 3d6.</P>
              <P>4 • 2 • 5 = 11</P>
              <P>Como 20 é maior que 11, Orin age primeiro.</P>
              <P>
                <strong>Empates:</strong> em caso de empate, quem possui a maior Graça vence. Se o empate
                continuar, o Mestre decide quem age primeiro.
              </P>
            </RuleBox>

            <P>Orin já esperava que aquilo pudesse acontecer.</P>
            <P>Antes que a formiga terminasse de avançar, sua mão já havia alcançado a adaga presa ao cinto.</P>
            <Quote>Agora é a vez dele.</Quote>

            <RuleBox title="Atacando">
              <P>Para atacar, faça um teste usando o atributo indicado pela arma.</P>
              <P>A adaga utiliza Graça, então Orin rola 5d6.</P>
              <P>Cada resultado 5 ou 6 conta como um sucesso.</P>
              <P>A formiga tentará se defender.</P>
            </RuleBox>

            <StatBlock
              data={{
                name: 'Formiga-Soldado',
                icon: '🐜',
                tamanho: 'Pequeno',
                funcao: 'Guardiã de túnel / agressiva por instinto',
                attributes: [
                  { label: 'Poder', value: 3 },
                  { label: 'Graça', value: 3 },
                  { label: 'Casca', value: 3 },
                  { label: 'Saber', value: 1 },
                ],
                resources: [
                  { label: '❤️ Corações', value: '3' },
                  { label: '⚡ Estamina', value: '6' },
                  { label: '🛡 Defesa base', value: '1 dado' },
                ],
                attacks: [
                  {
                    name: 'Mandíbulas Cortantes', test: 'Poder', dice: '3d6', acerto: '5 ou 6 = sucesso', dano: '2',
                    observacao: 'Ignora efeitos narrativos leves de "bloqueio improvisado" (galhos, pedras pequenas, etc.)',
                  },
                  {
                    name: 'Investida Curta', test: 'Graça', dice: '3d6', acerto: '1 sucesso',
                    efeito: 'Causa dano 1 e empurra o alvo 1 quadrado (se houver espaço)', custo: '1 Estamina',
                  },
                ],
                defense: ['Rola 1d6 por defesa', '5 ou 6 = anula 1 sucesso do atacante'],
                behavior: [
                  'Ataca intrusos sem hesitação',
                  'Prioriza alvos mais próximos',
                  'Não recua a menos que fique em estado crítico',
                ],
              }}
            />

            <StatBlock
              data={{
                name: 'Orin',
                icon: '🐜',
                attributes: [
                  { label: 'Poder', value: 2 },
                  { label: 'Graça', value: 5 },
                  { label: 'Casca', value: 3 },
                  { label: 'Saber', value: 4 },
                ],
                resources: [
                  { label: '❤️ Corações', value: '4' },
                  { label: '⚡ Estamina', value: '8' },
                  { label: '✨ Alma', value: '7' },
                ],
                attacks: [
                  { name: 'Adaga de Quitina', test: 'Graça', dice: '5d6', acerto: '5 ou 6 = sucesso', dano: '2', observacao: 'Peso: 1' },
                ],
                defense: ['Rola 1d6', '5 ou 6 = anula 1 sucesso'],
                behavior: [
                  'Ágil e preciso',
                  'Evita trocas diretas',
                  'Prefere ataques rápidos e reposicionamento',
                ],
              }}
            />

            <RuleBox title="⚔️ Sistema de Ações e Estamina">
              <P>Durante o combate, quase tudo o que um personagem faz consome Estamina.</P>
              <P>Cada ação representa esforço físico, foco ou reação rápida.</P>
            </RuleBox>

            <RuleBox title="🟡 Ações Básicas">
              <StageLabel>🗡 Atacar</StageLabel>
              <P>Atacar custa no mínimo 1 Estamina.</P>
              <Ul>
                <Li>Você rola um número de dados igual ao atributo da arma.</Li>
                <Li>Cada resultado 5 ou 6 = 1 sucesso.</Li>
                <Li>O primeiro sucesso causa o dano base da arma.</Li>
                <Li>Cada sucesso adicional adiciona +1 de dano.</Li>
              </Ul>

              <StageLabel>💥 Esforço (ataque mais forte)</StageLabel>
              <P>Você pode empurrar seu corpo além do limite normal.</P>
              <Ul>
                <Li>1º dado extra: 1 + 2 Estamina.</Li>
                <Li>2º dado extra: 1 + 2 + 3 Estamina.</Li>
                <Li>E assim por diante.</Li>
              </Ul>
              <P>Cada dado extra aumenta sua chance de sucesso no ataque.</P>

              <StageLabel>🏃 Movimento</StageLabel>
              <P>Mover custa Estamina.</P>
              <Ul>
                <Li>1 Estamina permite se mover normalmente pelo seu Deslocamento.</Li>
                <Li>Regras detalhadas de terreno são apresentadas em outro momento.</Li>
              </Ul>

              <StageLabel>🎒 Itens de acesso rápido</StageLabel>
              <P>Usar um item de espaço rápido custa 1 Estamina.</P>

              <StageLabel>⚔️ Ações em combate</StageLabel>
              <Ul>
                <Li>Qualquer ação comum custa 1 Estamina base.</Li>
                <Li>Ações mais fortes seguem a regra de acúmulo de esforço.</Li>
                <Li>Você sempre escolhe quanto quer se comprometer antes de agir.</Li>
              </Ul>
              <Quote>
                Exemplos: 1 Estamina → lançar adaga de arremesso. 1 Estamina → se aproximar do alvo.
                3 Estamina → atacar com adaga de quitina com esforço adicional.
              </Quote>
            </RuleBox>

            <RuleBox title="🛡 Defesa">
              <P>Você pode gastar Estamina para se defender até o seu próximo turno.</P>
              <P>Se não tiver Estamina, não consegue reagir bem.</P>

              <StageLabel>🏃 Esquiva</StageLabel>
              <Ul>
                <Li>Usa Graça contra o dano total do ataque.</Li>
                <Li>Cada sucesso reduz o dano.</Li>
                <Li>Se algum dano ainda passar, ele ainda causa pelo menos 1 de dano (se o ataque acertou).</Li>
              </Ul>

              <StageLabel>⚔️ Aparo</StageLabel>
              <Ul>
                <Li>Usa Poder contra o dano total.</Li>
                <Li>Representa bloquear ou desviar com a arma.</Li>
              </Ul>

              <StageLabel>🛡 Bloqueio (escudos)</StageLabel>
              <Ul>
                <Li>Funciona como Aparo.</Li>
                <Li>Adiciona o valor de defesa base do escudo.</Li>
                <Li>Mais consistente contra ataques diretos.</Li>
              </Ul>

              <StageLabel>💥 Importante</StageLabel>
              <Ul>
                <Li>Defesas também custam Estamina.</Li>
                <Li>Cada nova defesa no mesmo turno segue custo acumulado.</Li>
                <Li>Se um inimigo atacar múltiplas vezes, você precisa gastar mais Estamina para reagir a cada ataque.</Li>
              </Ul>
              <Quote>
                Exemplo: 1ª defesa → 1 Estamina. 2ª defesa → 1 + 2 Estamina. 3ª defesa → 1 + 2 + 3 Estamina.
              </Quote>
            </RuleBox>

            <RuleBox title="🧠 Dano">
              <Ul>
                <Li>Dano base = dano da arma + sucessos extras.</Li>
                <Li>Dano final = dano base − Casca.</Li>
                <Li>Dano mínimo sempre é 1, se o ataque acertou.</Li>
              </Ul>
              <Quote>Casca nunca reduz um ataque bem-sucedido a zero.</Quote>
            </RuleBox>

            <Quote>
              🔥 Você não está apenas escolhendo o que fazer.
              <br />
              Está escolhendo o quanto do seu corpo vai gastar para isso.
            </Quote>

            <GMNote title="💡 Observação importante para o jogador">
              <P>Nem sempre gastar mais Estamina é melhor.</P>
              <P>Às vezes, sobreviver ao próximo turno é mais importante do que acertar um golpe perfeito.</P>
            </GMNote>

            <RuleBox title="Trilha — Pressão">
              <StageLabel>🌱 Iniciado — Pressão Acumulada</StageLabel>
              <P>Ao acertar um ataque contra uma criatura, ela recebe 1 marcador de Pressão (máximo 2).</P>
              <P>Cada marcador reduz sua Casca em 1.</P>
              <P>Os marcadores permanecem enquanto Orin continuar atacando o mesmo alvo.</P>
              <P>Se Orin errar o ataque, os marcadores não aumentam, mas também não somem.</P>
              <P>Se ele passar um turno sem atacar o alvo, os marcadores desaparecem.</P>
            </RuleBox>

            <RuleBox title="Distância e Adaga de Arremesso">
              <P>
                Esta passagem é curta e estreita — há pouco espaço para manobras. A distância máxima entre
                Orin e as formigas, neste combate, é de 3 quadrados.
              </P>
              <P>
                Além da Adaga de Quitina (corpo a corpo, exige distância 0), Orin carrega em seu acesso
                rápido uma <strong>Adaga de Arremesso</strong> — item de uso único.
              </P>
              <P>Ela atinge alvos a até 2 quadrados de distância sem custo extra.</P>
              <P>Cada quadrado além do alcance base aumenta o custo em Estamina, em acúmulo:</P>
              <Ul>
                <Li>1º quadrado extra: 1 + 2 Estamina</Li>
                <Li>2º quadrado extra: 1 + 2 + 3 Estamina</Li>
                <Li>3º quadrado extra: 1 + 2 + 3 + 4 Estamina</Li>
              </Ul>
            </RuleBox>

            {(() => {
              const formigaLines = {
                start: [
                  'A formiga para por um instante… então vira o corpo na sua direção.',
                  'As antenas dela se erguem lentamente.',
                  'Ela abandona o que estava carregando.',
                  'Não há hesitação no movimento dela.',
                  'O chão estala sob as patas.',
                  'Ela avança direto para cima de você.',
                ],
                onHit: [
                  'As mandíbulas se fecham com força.',
                  'O impacto joga você meio passo para trás.',
                  'A carapaça arranha contra sua pele.',
                ],
                onDamaged: [
                  'O corpo dela recua, mas não para.',
                  'Ela emite um som seco, quase mecânico.',
                  'As patas se firmam novamente no chão.',
                ],
                onNearDefeat: [
                  'O movimento dela perde ritmo.',
                  'Ela hesita pela primeira vez.',
                  'Ainda assim, continua avançando.',
                ],
              }
              const formiga = {
                name: 'Formiga-Soldado', icon: '🐜',
                poder: 3, graca: 3, casca: 3,
                maxCoracoes: 3, maxEstamina: 6,
                defenseDice: 1,
                attacks: [
                  { name: 'Mandíbulas Cortantes', attribute: 'poder' as const, dice: 3, damage: 2, staminaCost: 1 },
                  { name: 'Investida Curta', attribute: 'graca' as const, dice: 3, damage: 1, staminaCost: 1, note: 'Empurra o alvo 1 quadrado' },
                ],
                lines: formigaLines,
              }
              return (
                <CombatEncounter
                  initialDistance={3}
                  player={{
                    name: 'Orin', icon: '🐜',
                    poder: 2, graca: 5, casca: 3,
                    maxCoracoes: 4, maxEstamina: 8,
                    defenseDice: 1,
                    trilhaPressao: true,
                    attacks: [
                      { name: 'Adaga de Quitina', attribute: 'graca', dice: 5, damage: 2, staminaCost: 1, meleeOnly: true },
                      { name: 'Adaga de Arremesso', attribute: 'graca', dice: 4, damage: 1, staminaCost: 1, baseRange: 2, singleUse: true },
                    ],
                    lines: {
                      start: [
                        'Orin ajusta o peso do corpo, já em posição.',
                        'A mão desliza até a adaga sem hesitar.',
                      ],
                      onHit: [
                        'A lâmina encontra uma abertura na carapaça.',
                        'Um corte limpo, rápido.',
                      ],
                      onDamaged: [
                        'Orin recua um passo, respirando fundo.',
                        'O impacto quase o faz perder o equilíbrio.',
                      ],
                    },
                  }}
                  enemies={[formiga, formiga]}
                />
              )
            })()}

            <div style={{ marginTop: '3rem', padding: '1.25rem 1.5rem', background: 'rgba(var(--gold-rgb),0.04)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 8 }}>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: '0.4rem' }}>
                O Vazio espera.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
                Boa sorte, Filho do Vazio. — Vaskrin provavelmente não disse isso, mas teria achado graça.
              </p>
            </div>
          </article>
        </div>
      </main>
    </ContentShell>
  )
}
