import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'História – Filhos do Vazio',
  description:
    'Antes de Vespera, existiu Hallownest. Um reino que acreditou ter derrotado a morte — e pagou o preço.',
}

/* ── Componentes de apoio ───────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4 my-10" aria-hidden>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.25))' }} />
    <span style={{ color: 'var(--gold)', fontSize: '0.8rem', opacity: 0.6 }}>◈</span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(var(--gold-rgb),0.25))' }} />
  </div>
)

function IllustrationFrame({
  icon,
  label,
  caption,
  alt,
  aspect = '16/9',
}: {
  icon: string
  label: string
  caption: string
  alt: string
  aspect?: string
}) {
  return (
    <figure className="my-12 mx-auto" style={{ maxWidth: 820 }}>
      <div
        className="hk-frame rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 relative"
        role="img"
        aria-label={alt}
        style={{ aspectRatio: aspect }}
      >
        {/* Glow ambiente */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--gold-rgb),0.05) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <span style={{ fontSize: '3rem', opacity: 0.3, position: 'relative', zIndex: 1 }} aria-hidden>
          {icon}
        </span>
        <p
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(var(--text-rgb),0.35)',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '0 1rem',
          }}
        >
          {label}
        </p>
        <span
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.52rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(var(--text-muted-rgb),0.4)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Ilustração em breve
        </span>
      </div>
      {caption && (
        <figcaption
          style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: 'rgba(var(--text-rgb),0.35)',
            textAlign: 'center',
            marginTop: '0.75rem',
            letterSpacing: '0.01em',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-im-fell)',
        fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
        lineHeight: 1.95,
        color: 'rgba(var(--text-rgb),0.72)',
        marginBottom: '1.4rem',
      }}
    >
      {children}
    </p>
  )
}

function Isolated({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-im-fell)',
        fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
        lineHeight: 1.95,
        color: 'rgba(var(--text-rgb),0.72)',
        margin: '0.5rem 0',
      }}
    >
      {children}
    </p>
  )
}

/* ── Página ─────────────────────────────────────────────── */

export default function HistoriaPage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/historia" />

      {/* ── Hero / cabeçalho ───────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center"
        style={{ paddingTop: 44 }}
        aria-label="Cabeçalho da página"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gold-rgb),0.06) 0%, transparent 70%)',
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
            <Link href="/" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">
              ← Início
            </Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">História</span>
          </nav>

          {/* Ornamento dourado */}
          <div className="flex items-center gap-4" aria-hidden>
            <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(var(--gold-rgb),0.7)' }}>◈</span>
            <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
          </div>

          <p
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.58rem',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Lore &amp; Lendas
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
            História
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
              color: 'rgba(var(--text-rgb),0.5)',
              lineHeight: 1.85,
              maxWidth: 420,
            }}
          >
            Dos fragmentos que restaram, tentamos reconstruir a verdade.
          </p>
        </div>

        <div
          className="w-full divider-gold"
          aria-hidden
        />
      </section>

      {/* ── Conteúdo principal ─────────────────────────── */}
      <main
        className="flex-1 w-full"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <article
          className="mx-auto px-6 py-16"
          style={{ maxWidth: 720 }}
        >
          {/* Título do capítulo */}
          <h2
            className="mb-8"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}
          >
            Antes de Vespera
          </h2>

          {/* ── Prólogo ── */}
          <Paragraph>
            Muito antes de nosso reino existir, antes das primeiras cidades serem erguidas e antes
            dos nomes dos deuses serem conhecidos, existiu outro reino.
          </Paragraph>

          <Paragraph>Ao menos é o que dizem as histórias.</Paragraph>

          <IllustrationFrame
            icon="🏛️"
            label="Hallownest — vista das cavernas iluminadas por uma luz impossível"
            caption="'Um reino subterrâneo que iluminava o escuro com sua própria luz.'"
            alt="Ilustração panorâmica de Hallownest: cavernas imensas iluminadas por uma luz dourada impossível, com silhuetas de cidades de pedra negra ao fundo"
            aspect="21/9"
          />

          <Paragraph>
            Seu nome era <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Hallownest</strong>.
          </Paragraph>

          <Paragraph>
            Os contadores de histórias falam sobre um rei que governava uma terra subterrânea
            iluminada por uma luz impossível. Falam sobre cavaleiros sem rosto, cidades de pedra
            negra e uma divindade dourada que caminhava pelos sonhos dos insetos.
          </Paragraph>

          <IllustrationFrame
            icon="⚔️"
            label="O Cavaleiro Sem Rosto — silhueta de um guerreiro com máscara vazia"
            caption="Diz-se que os cavaleiros de Hallownest não tinham identidade. Apenas propósito."
            alt="Ilustração de um cavaleiro de máscara branca em uma armadura escura, segurando uma lâmina de sombra, com cidades de pedra ao fundo"
            aspect="16/9"
          />

          <Paragraph>Mas essas são apenas lendas.</Paragraph>

          <OrnamentDivider />

          {/* ── Os Fragmentos ── */}
          <Paragraph>Ninguém sabe o que é verdade.</Paragraph>

          <Paragraph>
            Nenhum viajante vivo afirma ter visto Hallownest. Nenhum mapa aponta seu caminho.
            Nenhum estudioso encontrou provas definitivas de sua existência.
          </Paragraph>

          <Paragraph>Restam apenas fragmentos.</Paragraph>

          <div style={{ margin: '0.25rem 0 1.75rem' }}>
            <Isolated>Pergaminhos incompletos.</Isolated>
            <Isolated>Canções antigas.</Isolated>
            <Isolated>Inscrições desgastadas pelo tempo.</Isolated>
            <Isolated>E histórias.</Isolated>
          </div>

          <IllustrationFrame
            icon="📜"
            label="Fragmentos de Hallownest — pergaminhos, inscrições e relíquias"
            caption="Os únicos vestígios são fragmentos — nunca suficientes para confirmar. Jamais suficientes para negar."
            alt="Ilustração de pergaminhos e tabletes de pedra com inscrições em língua antiga, parcialmente destruídos pelo tempo"
            aspect="16/9"
          />

          <Paragraph>Histórias sobre um reino que acreditou ter derrotado a morte.</Paragraph>
          <Paragraph>Histórias sobre uma luz que enlouqueceu seu povo.</Paragraph>
          <Paragraph>Histórias sobre uma escuridão aprisionada nas profundezas.</Paragraph>

          <OrnamentDivider />

          {/* ── O Debate ── */}
          <Paragraph>
            Alguns afirmam que Hallownest caiu por desafiar forças que não compreendia.
          </Paragraph>

          <Paragraph>
            Outros acreditam que nunca existiu e que tudo não passa de um mito criado para
            assustar os jovens.
          </Paragraph>

          <Paragraph>
            Mas, entre os estudiosos mais velhos, existe uma frase repetida em voz baixa:
          </Paragraph>

          {/* Pull quote */}
          <blockquote
            style={{
              margin: '2.5rem 0',
              padding: '1.5rem 2rem',
              borderLeft: '3px solid rgba(var(--gold-rgb),0.5)',
              background: 'linear-gradient(to right, rgba(var(--gold-rgb),0.05), transparent)',
              borderRadius: '0 8px 8px 0',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-im-fell)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
                color: 'rgba(var(--text-rgb),0.8)',
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              "Os reinos mudam. Os nomes mudam. Os deuses mudam. Mas as feridas do mundo
              permanecem."
            </p>
          </blockquote>

          <OrnamentDivider />

          {/* ── Vespera ── */}
          <Paragraph>
            Se Hallownest realmente existiu, sua história terminou há eras.
          </Paragraph>

          <Paragraph>
            Agora existe apenas{' '}
            <strong style={{ color: 'var(--gold-light)', fontStyle: 'normal' }}>Vespera</strong>.
          </Paragraph>

          <Paragraph>Um reino construído sobre ruínas ainda mais antigas.</Paragraph>
          <Paragraph>Um reino cercado por mistérios.</Paragraph>
          <Paragraph>
            Um reino que observa, impotente, as primeiras rachaduras surgirem no Grande Selo.
          </Paragraph>

          <IllustrationFrame
            icon="🔮"
            label="O Grande Selo — estrutura circular com fissuras se espalhando pelas bordas"
            caption="As rachaduras surgiram primeiro nas profundezas. Depois, subiram."
            alt="Ilustração do Grande Selo: uma estrutura circular e monumental com raios de luz vazando pelas fissuras que se espalham pela pedra"
            aspect="16/9"
          />

          <Paragraph>
            E, enquanto as fissuras se espalham pelas profundezas, alguns começam a se perguntar
            se as velhas lendas eram avisos.
          </Paragraph>

          <Paragraph>Ou profecias.</Paragraph>

          {/* Indicador "em breve" */}
          <div
            className="mt-16 flex flex-col items-center gap-4 text-center"
            style={{
              padding: '2rem',
              border: '1px solid rgba(var(--gold-rgb),0.1)',
              borderRadius: 12,
              background: 'rgba(var(--gold-rgb),0.03)',
            }}
          >
            <span style={{ color: 'var(--gold-light)', fontSize: '1.5rem', opacity: 0.4 }} aria-hidden>
              ◈
            </span>
            <p
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(var(--text-muted-rgb),0.5)',
              }}
            >
              A história continua
            </p>
            <p
              style={{
                fontFamily: 'var(--font-im-fell)',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                color: 'rgba(var(--text-rgb),0.3)',
                maxWidth: 360,
              }}
            >
              Novos capítulos serão revelados conforme os segredos de Vespera emergem das profundezas.
            </p>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
