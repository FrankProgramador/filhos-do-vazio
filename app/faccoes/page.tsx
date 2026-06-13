import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Facções – Filhos do Vazio',
  description:
    'Cinco facções que disputam o poder nas sombras do reino — aliadas, inimigos, ou algo entre os dois.',
}

/* ── Tipos e dados ──────────────────────────────────────── */

type Relacao = 'aliada' | 'neutra' | 'ambigua' | 'perigosa'

type Faccao = {
  id: string
  nome: string
  lema: string
  icon: string
  altImagem: string
  ideologia: string
  lider: string
  relacao: string
  relacaoTipo: Relacao
  gancho: string
}

const faccoes: Faccao[] = [
  {
    id: 'colmeia-de-vozes',
    nome: 'A Colmeia de Vozes',
    lema: '"Uma só voz, um só propósito. Nenhum inseto será esquecido."',
    icon: '🐝',
    altImagem: 'Favos de mel gigantes iluminados por luzes pulsantes douradas',
    ideologia:
      'Coletivismo radical. Buscam fundir as mentes de todos os insetos em uma única consciência, pois creem que a individualidade é a origem de toda decadência.',
    lider: 'A Abelha-Mestra — entidade jamais vista, apenas "ouvida" através da colmeia.',
    relacao: 'Neutros, mas cortejarão os jogadores — a um custo pessoal.',
    relacaoTipo: 'neutra',
    gancho:
      'Um membro desertou e teme ser "reabsorvido". Ele carrega informações sobre um artefato antigo.',
  },
  {
    id: 'casca-ferro',
    nome: 'Os Casca-Ferro',
    lema: '"O que não quebra, endurece. O que endurece, sobrevive."',
    icon: '🪖',
    altImagem: 'Guerreiros blindados com armaduras feitas de carapaças de inimigos vencidos',
    ideologia:
      'Sobrevivência pela força e disciplina. Desprezam os fracos, mas protegem os seus com ferocidade. Creem que o reino só será salvo quando todos forem forjados como aço.',
    lider: 'General Mandíbula — besouro rinoceronte veterano de cem batalhas, com uma pinça a menos.',
    relacao: 'Respeitam a força. Prove seu valor e se tornam aliados; mostre fraqueza e serão explorados.',
    relacaoTipo: 'aliada',
    gancho:
      'Os Casca-Ferro recrutam para uma missão suicida: invadir o ninho de uma criatura lendária para roubar seus ovos.',
  },
  {
    id: 'vermes-sussurrantes',
    nome: 'Os Vermes Sussurrantes',
    lema: '"A podridão é apenas o começo de uma nova forma."',
    icon: '🍄',
    altImagem: 'Insetos cobertos de esporos e cogumelos em cavernas úmidas e bioluminescentes',
    ideologia:
      'Culto à decadência e à transformação. Acreditam que a morte e a decomposição são processos sagrados que abrem caminho para o renascimento.',
    lider: 'O Primeiro Esporo — morreu três vezes e foi renascido pelo fungo. Ninguém sabe o que realmente é.',
    relacao: 'Suspeitosos e reclusos, mas detentores de conhecimento proibido sobre venenos e ressurreição.',
    relacaoTipo: 'perigosa',
    gancho:
      'Uma praga de fungos ameaça vilarejos inteiros. Os Vermes dizem que é "parte do plano" — e talvez estejam certos.',
  },
  {
    id: 'teceloes-noturnos',
    nome: 'Os Tecelões Noturnos',
    lema: '"Na escuridão, tecemos o amanhã."',
    icon: '🕷️',
    altImagem: 'Figuras encapuzadas em seda negra movendo-se entre teias prateadas no escuro',
    ideologia:
      'Sigilo, predição e controle. Aracnídeos que creem que o futuro pode ser tecido como uma teia — e que cabe a eles puxar os fios certos.',
    lider: 'A Viúva — figura andrógina que jamais fala diretamente, apenas através de mensageiros e cartas enigmáticas.',
    relacao: 'Manipuladores. Contratam os jogadores para missões que servem a um plano maior, sem revelar o objetivo.',
    relacaoTipo: 'ambigua',
    gancho:
      'Oferecem informação sobre um tesouro em troca de algo aparentemente insignificante — uma pedra, um nome, um favor a ser cobrado depois.',
  },
  {
    id: 'forjados-do-vazio',
    nome: 'Os Forjados do Vazio',
    lema: '"Do vazio viemos — mas antes de retornar, faremos o vazio lembrar de nós."',
    icon: '⚙️',
    altImagem: 'Insetos com próteses de sucata e tatuagens luminescentes trabalhando em um monumento colossal',
    ideologia:
      'Existencialismo radical. Aceitaram a indiferença do Vazio e decidiram criar seu próprio significado através da arte, da engenharia e da memória coletiva.',
    lider: 'O Conselho dos Ecos — três insetos representando Passado (historiador), Presente (engenheira) e Futuro (poeta). Raramente concordam.',
    relacao: 'Acolhedores e curiosos. Ajudam generosamente — em troca de uma história ou uma memória valiosa.',
    relacaoTipo: 'aliada',
    gancho:
      'Estão construindo um monumento colossal no deserto. Para finalizá-lo, precisam do cristal no coração de um monstro ancestral. Oferecem tecnologia avançada como pagamento.',
  },
]

/* ── Estilos de relação ────────────────────────────────── */

const relacaoConfig: Record<Relacao, { label: string; color: string; border: string; bg: string }> = {
  aliada: {
    label: 'Potencial Aliada',
    color: 'rgba(74,158,255,0.9)',
    border: 'rgba(74,158,255,0.35)',
    bg: 'rgba(74,158,255,0.08)',
  },
  neutra: {
    label: 'Neutra',
    color: 'rgba(212,168,67,0.9)',
    border: 'rgba(212,168,67,0.35)',
    bg: 'rgba(212,168,67,0.08)',
  },
  ambigua: {
    label: 'Ambígua',
    color: 'rgba(180,100,220,0.9)',
    border: 'rgba(180,100,220,0.35)',
    bg: 'rgba(180,100,220,0.08)',
  },
  perigosa: {
    label: 'Perigosa',
    color: 'rgba(220,80,80,0.9)',
    border: 'rgba(220,80,80,0.35)',
    bg: 'rgba(220,80,80,0.08)',
  },
}

/* ── Componentes ────────────────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4" aria-hidden>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--hk-gold))' }} />
    <span style={{ color: 'var(--hk-gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(212,168,67,0.7)' }}>◈</span>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--hk-gold))' }} />
  </div>
)

function FaccaoCard({ faccao }: { faccao: Faccao }) {
  const rel = relacaoConfig[faccao.relacaoTipo]

  return (
    <article
      className="flex flex-col rounded-xl overflow-hidden group transition-all duration-200"
      style={{ background: 'var(--hk-deep)', border: '1px solid rgba(74,158,255,0.12)' }}
    >
      {/* Linha colorida no topo no hover */}
      <div
        className="h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to right, transparent, ${rel.color}, transparent)` }}
        aria-hidden
      />

      {/* Emblema / placeholder */}
      <div
        className="relative flex flex-col items-center justify-center gap-3 shrink-0"
        role="img"
        aria-label={faccao.altImagem}
        style={{
          aspectRatio: '21 / 9',
          background: 'linear-gradient(160deg, #0f1628 0%, #0b0d1a 100%)',
          borderBottom: '1px solid rgba(74,158,255,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Glow radial do tipo de relação */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 60%, ${rel.bg.replace('0.08', '0.12')} 0%, transparent 70%)`,
          }}
          aria-hidden
        />
        <span style={{ fontSize: '2.6rem', position: 'relative', zIndex: 1 }} aria-hidden>
          {faccao.icon}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--hk-dim)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Arte conceitual em breve
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-col flex-1 p-6 gap-4">

        {/* Cabeçalho: nome + "Em Breve" */}
        <div className="flex items-start justify-between gap-3">
          <h2
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--hk-gold)',
              letterSpacing: '0.05em',
              lineHeight: 1.3,
            }}
          >
            {faccao.nome}
          </h2>
          <span className="shrink-0 ddb-badge ddb-badge-dim mt-0.5" aria-label="Página em construção">
            Em Breve
          </span>
        </div>

        {/* Lema */}
        <p
          style={{
            fontFamily: 'var(--font-im-fell)',
            fontStyle: 'italic',
            color: 'rgba(216,228,248,0.6)',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            borderLeft: `2px solid ${rel.border}`,
            paddingLeft: '0.85rem',
          }}
        >
          {faccao.lema}
        </p>

        {/* Ideologia */}
        <div className="flex gap-3">
          <span
            className="shrink-0"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--hk-soul)',
              paddingTop: '0.1rem',
              minWidth: '4.5rem',
            }}
          >
            Ideologia
          </span>
          <span
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontSize: '0.87rem',
              color: 'rgba(216,228,248,0.55)',
              lineHeight: 1.7,
            }}
          >
            {faccao.ideologia}
          </span>
        </div>

        {/* Líder */}
        <div className="flex gap-3">
          <span
            className="shrink-0"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--hk-soul)',
              paddingTop: '0.1rem',
              minWidth: '4.5rem',
            }}
          >
            Líder
          </span>
          <span
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontSize: '0.87rem',
              color: 'rgba(216,228,248,0.55)',
              lineHeight: 1.7,
            }}
          >
            {faccao.lider}
          </span>
        </div>

        {/* Relação + gancho no rodapé */}
        <div
          className="flex flex-col gap-3 mt-auto pt-4"
          style={{ borderTop: '1px solid rgba(74,158,255,0.08)' }}
        >
          {/* Badge de relação */}
          <div className="flex items-center gap-2.5">
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--hk-dim)',
              }}
            >
              Relação
            </span>
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: rel.color,
                border: `1px solid ${rel.border}`,
                background: rel.bg,
                padding: '0.2rem 0.6rem',
                borderRadius: 20,
              }}
            >
              {rel.label}
            </span>
          </div>

          {/* Descrição da relação */}
          <p
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'rgba(216,228,248,0.45)',
              lineHeight: 1.5,
            }}
          >
            {faccao.relacao}
          </p>

          {/* Gancho + botão */}
          <div className="flex items-end justify-between gap-4 pt-1">
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--hk-gold)',
                  opacity: 0.8,
                  marginBottom: '0.25rem',
                }}
              >
                Gancho
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-im-fell)',
                  fontStyle: 'italic',
                  fontSize: '0.82rem',
                  color: 'rgba(216,228,248,0.45)',
                  lineHeight: 1.5,
                }}
              >
                {faccao.gancho}
              </p>
            </div>
            <span
              className="shrink-0 hk-btn"
              style={{
                fontSize: '0.7rem',
                padding: '0.6rem 1.2rem',
                borderRadius: 6,
                background: 'rgba(122,138,170,0.06)',
                borderColor: 'rgba(122,138,170,0.2)',
                color: 'rgba(122,138,170,0.35)',
                cursor: 'not-allowed',
                pointerEvents: 'none',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}
              aria-disabled="true"
              aria-label="Página em construção"
            >
              Conhecer
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Página ─────────────────────────────────────────────── */

export default function FaccoesPage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--hk-void)' }}>
      <SiteHeader activePath="/faccoes" />

      {/* ── Hero / cabeçalho ───────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center"
        style={{ paddingTop: 44 }}
        aria-label="Cabeçalho da página"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,158,255,0.07) 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-4 px-6 pt-14 pb-12">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2"
            aria-label="Navegação estrutural"
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            <Link href="/" style={{ color: 'var(--hk-soul)' }} className="transition-opacity hover:opacity-80">
              ← Início
            </Link>
            <span style={{ color: 'rgba(74,158,255,0.35)' }} aria-hidden>◈</span>
            <span style={{ color: 'rgba(216,228,248,0.45)' }} aria-current="page">Facções</span>
          </nav>

          <OrnamentDivider />

          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--hk-dim)' }}>
            Poderes que movem o reino
          </p>

          <h1
            className="soul-glow"
            style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--hk-ghost)' }}
          >
            Facções
          </h1>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', color: 'rgba(216,228,248,0.6)', lineHeight: 1.85, maxWidth: 480 }}>
            Cinco forças disputam o futuro do reino nas sombras.<br />
            Cada aliança tem seu preço — cada traição, suas consequências.
          </p>

          {/* Legenda de relações */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {(Object.entries(relacaoConfig) as [Relacao, typeof relacaoConfig[Relacao]][]).map(([, cfg]) => (
              <span
                key={cfg.label}
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.52rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                  background: cfg.bg,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 20,
                }}
              >
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="w-full"
          style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.18), transparent)' }}
          aria-hidden
        />
      </section>

      {/* ── Grade de facções ───────────────────────────── */}
      <main
        className="flex-1 mx-auto w-full px-4 sm:px-6 py-16"
        style={{ maxWidth: 1200, background: 'var(--hk-abyss)' }}
      >
        <div className="flex flex-col items-center gap-3 mb-12">
          <p
            className="hk-divider"
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.35em' }}
          >
            Cinco Facções
          </p>
          <h2
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--hk-pale)', textAlign: 'center', textShadow: '0 0 24px rgba(74,158,255,0.18)' }}
          >
            As Forças do Vazio
          </h2>
          <p
            style={{ textAlign: 'center', color: 'rgba(216,228,248,0.5)', fontSize: '0.92rem', maxWidth: 520, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}
          >
            Aliadas, inimigas ou algo entre os dois — nenhuma facção é simples o suficiente para um único rótulo.
          </p>
        </div>

        <div className="content-grid">
          {faccoes.map((faccao) => (
            <FaccaoCard key={faccao.id} faccao={faccao} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
