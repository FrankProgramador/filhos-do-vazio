import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Locais – Filhos do Vazio',
  description:
    'Explore os territórios originais do reino de insetos — cinco regiões com segredos, perigos e ganchos de aventura.',
}

/* ── Tipos e dados ──────────────────────────────────────── */

type Local = {
  id: string
  nome: string
  tagline: string
  icon: string
  altImagem: string
  cenario: string
  perigos: string
  gancho: string
}

const locais: Local[] = [
  {
    id: 'fosso-dos-ecos',
    nome: 'O Fosso dos Ecos',
    tagline: '"Um abismo onde os sussurros dos mortos ainda se arrastam pelas paredes de cera."',
    icon: '🕯️',
    altImagem: 'Vista aérea do Fosso dos Ecos, com paredes de cera e luzes bruxuleantes no fundo',
    cenario:
      'Uma fenda gigantesca que corta o continente, coberta por teias e estalactites de cera escura. No fundo, lagos de mel fermentado e colmeias abandonadas.',
    perigos: 'Insetos necrófagos, gases tóxicos, labirintos de favos.',
    gancho: 'Um farol de cera foi aceso no fundo do fosso. Quem o acendeu? E por quê?',
  },
  {
    id: 'arquivo-podre',
    nome: 'O Arquivo Podre',
    tagline: '"Uma biblioteca monumental construída dentro de um tronco de árvore fossilizada."',
    icon: '📚',
    altImagem: 'Interior do Arquivo Podre, com estantes de galhos e um cogumelo gigante no centro',
    cenario:
      'Livros e pergaminhos feitos de asas de mariposa e seda. A umidade e fungos estão consumindo o conhecimento acumulado por eras.',
    perigos: 'Fungos que confundem a mente, armadilhas de tinta, guardiões cegos.',
    gancho:
      'Alguém está queimando os registros da história. Salve a memória do mundo antes que seja tarde.',
  },
  {
    id: 'cidadela-de-lasca',
    nome: 'A Cidadela de Lasca',
    tagline: '"Uma fortaleza construída dentro de um inseto morto do tamanho de uma montanha."',
    icon: '🪲',
    altImagem: 'Silhueta da Cidadela de Lasca dentro de uma carapaça gigante sob um céu alaranjado',
    cenario:
      'A carapaça vazia abriga três facções rivais: os Casca-Ferro (guerreiros), os Perfuradores (mineiros) e os Vermes (cultistas).',
    perigos: 'Desabamentos, disputas de território, o "espasmo" da carapaça (terremotos).',
    gancho:
      'O coração fossilizado do inseto gigante começou a bater novamente. Ele vai despertar?',
  },
  {
    id: 'jardim-das-memorias-murchas',
    nome: 'O Jardim das Memórias Murchas',
    tagline:
      '"Um jardim suspenso em cavernas bioluminescentes, onde as plantas são alimentadas por sonhos líquidos."',
    icon: '🌸',
    altImagem: 'Jardim bioluminescente com cogumelos altos e um rio de néctar azul',
    cenario:
      'Pétalas que brilham no escuro e rios de néctar que fazem reviver lembranças perdidas de quem os bebe.',
    perigos: 'Pólen alucinógeno, predadores camuflados como flores, a "murcha" (doença mágica).',
    gancho:
      'Uma praga está matando as flores da memória. Quem está apodrecendo os sonhos do reino?',
  },
  {
    id: 'mercado-de-areia',
    nome: 'O Mercado de Areia',
    tagline: '"Um oásis subterrâneo — o único lugar neutro entre as facções do reino."',
    icon: '🏺',
    altImagem:
      'Mercado de Areia com tendas coloridas e insetos comerciando ao redor de uma fonte luminosa',
    cenario:
      'Comerciantes nômades (besouros rola-bosta, formigas carregadoras) trocam itens raros sob toldos de seda ao redor de uma fonte luminosa.',
    perigos: 'Furtadores, dívidas de jogo, a Guarda Silenciosa (mantis contratados).',
    gancho:
      'Um mapa falso está circulando. O grupo precisa descobrir o falsificador antes que uma guerra ecloda.',
  },
]

/* ── Componentes ────────────────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4" aria-hidden>
    <div
      style={{
        width: 44,
        height: 1,
        background: 'linear-gradient(to right, transparent, var(--gold))',
      }}
    />
    <span style={{ color: 'var(--gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(var(--gold-rgb),0.7)' }}>
      ◈
    </span>
    <div
      style={{
        width: 44,
        height: 1,
        background: 'linear-gradient(to left, transparent, var(--gold))',
      }}
    />
  </div>
)

function LocalCard({ local }: { local: Local }) {
  return (
    <article
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-200 group"
      style={{
        background: 'var(--card)',
        border: '1px solid rgba(var(--gold-rgb),0.14)',
      }}
    >
      {/* Linha dourada no topo no hover */}
      <div
        className="h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.55), transparent)' }}
        aria-hidden
      />

      {/* Placeholder de imagem */}
      <div
        className="flex flex-col items-center justify-center gap-2 shrink-0"
        role="img"
        aria-label={local.altImagem}
        style={{
          aspectRatio: '16 / 9',
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg))',
          borderBottom: '1px solid rgba(var(--gold-rgb),0.1)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--gold-rgb),0.05) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <span style={{ fontSize: '2.8rem', opacity: 0.55, position: 'relative', zIndex: 1 }} aria-hidden>
          {local.icon}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.62rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Arte conceitual em breve
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-col flex-1 gap-4 p-6">
        {/* Título + badge */}
        <div className="flex items-start justify-between gap-3">
          <h2
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.05em',
              lineHeight: 1.3,
            }}
          >
            {local.nome}
          </h2>
          <span
            className="shrink-0 ddb-badge ddb-badge-dim mt-0.5"
            aria-label="Página em construção"
          >
            Em Breve
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            color: 'rgba(var(--text-rgb),0.65)',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            borderLeft: '2px solid rgba(var(--gold-rgb),0.3)',
            paddingLeft: '0.85rem',
          }}
        >
          {local.tagline}
        </p>

        {/* Detalhes */}
        <div className="flex flex-col gap-3 flex-1">
          {[
            { label: 'Cenário', texto: local.cenario },
            { label: 'Perigos', texto: local.perigos },
          ].map(({ label, texto }) => (
            <div key={label} className="flex gap-3">
              <span
                className="shrink-0"
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-light)',
                  paddingTop: '0.1rem',
                  minWidth: '4rem',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-im-fell)',
                  fontSize: '0.88rem',
                  color: 'rgba(var(--text-rgb),0.55)',
                  lineHeight: 1.7,
                }}
              >
                {texto}
              </span>
            </div>
          ))}
        </div>

        {/* Rodapé: gancho + botão */}
        <div
          className="flex items-end justify-between gap-4 pt-3"
          style={{ borderTop: '1px solid rgba(var(--gold-rgb),0.1)' }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.55rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                opacity: 0.8,
                marginBottom: '0.3rem',
              }}
            >
              Gancho
            </p>
            <p
              style={{
                fontFamily: 'var(--font-im-fell)',
                fontStyle: 'italic',
                fontSize: '0.82rem',
                color: 'rgba(var(--text-rgb),0.45)',
                lineHeight: 1.5,
              }}
            >
              {local.gancho}
            </p>
          </div>
          <span
            className="shrink-0 hk-btn"
            style={{
              fontSize: '0.7rem',
              padding: '0.6rem 1.2rem',
              borderRadius: 6,
              background: 'rgba(var(--text-muted-rgb),0.06)',
              borderColor: 'rgba(var(--text-muted-rgb),0.2)',
              color: 'rgba(var(--text-muted-rgb),0.35)',
              cursor: 'not-allowed',
              pointerEvents: 'none',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
            aria-disabled="true"
            aria-label="Página em construção"
          >
            Explorar
          </span>
        </div>
      </div>
    </article>
  )
}

/* ── Página ─────────────────────────────────────────────── */

export default function LocaisPage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/locais" />

      {/* ── Hero / cabeçalho da página ─────────────────── */}
      <section
        className="relative flex flex-col items-center text-center"
        style={{ paddingTop: 44 }}
        aria-label="Cabeçalho da página"
      >
        {/* Glow ambiente */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gold-rgb),0.07) 0%, transparent 70%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-4 px-6 pt-14 pb-12">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2"
            aria-label="Navegação estrutural"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <Link
              href="/"
              style={{ color: 'var(--gold-light)' }}
              className="transition-opacity hover:opacity-80"
            >
              ← Início
            </Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Locais</span>
          </nav>

          <OrnamentDivider />

          <p
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.58rem',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Territórios do Reino em Ruínas
          </p>

          <h1
            className="gold-glow"
            style={{
              fontFamily: 'var(--font-cinzel-decorative)',
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: 'var(--text)',
            }}
          >
            Locais
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
              color: 'rgba(var(--text-rgb),0.6)',
              lineHeight: 1.85,
              maxWidth: 480,
            }}
          >
            Cinco territórios onde o passado apodrece e o perigo aguarda.<br />
            Cada região guarda segredos que poucos ousaram desvendar.
          </p>
        </div>

        {/* Divisor dourado */}
        <div
          className="w-full divider-gold"
          aria-hidden
        />
      </section>

      {/* ── Grade de locais ────────────────────────────── */}
      <main
        className="flex-1 mx-auto w-full px-4 sm:px-6 py-16"
        style={{ maxWidth: 1200, background: 'var(--bg-secondary)' }}
        id="locais-grid"
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <p
            className="hk-divider text-sm"
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.35em' }}
          >
            Cinco Regiões
          </p>
          <h2
            className="section-heading-glow"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text)',
              textAlign: 'center',
            }}
          >
            Os Territórios do Vazio
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(var(--text-rgb),0.5)',
              fontSize: '0.92rem',
              maxWidth: 520,
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
            }}
          >
            Cinco regiões originais aguardam os filhos corajosos — ou insensatos — o suficiente para explorá-las.
          </p>
        </div>

        {/* Grid 3→2→1 colunas */}
        <div className="locais-grid">
          {locais.map((local) => (
            <LocalCard key={local.id} local={local} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
