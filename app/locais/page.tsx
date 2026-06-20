import type { Metadata } from 'next'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'

export const metadata: Metadata = {
  title: 'Locais – Filhos do Vazio',
  description:
    'Explore Kishar e os territórios ao seu redor — sete lugares com segredos, perigos e ganchos de aventura.',
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
    id: 'kishar',
    nome: 'Kishar — O Reino Sobre a Criatura',
    tagline: '"O próprio corpo do reino é uma criatura colossal cuja carapaça nunca foi exatamente pedra."',
    icon: '🏔️',
    altImagem: 'Vista da Coroa, Cidade e Túneis de Kishar erguidos sobre o dorso de uma criatura colossal',
    cenario:
      'Dividido em três camadas: a Coroa (palácios e salões de governo), a Cidade (ruas irregulares que seguem a curvatura do dorso) e os Túneis (o interior oco, onde algo ainda se move). O coração fossilizado é chamado de O Primeiro Espasmo — dizem que pulsa. A Coroa nega que exista.',
    perigos: 'Atividade crescente nos túneis, decadência política, segredos que ninguém quer confirmar.',
    gancho: 'O Conselho das Carapaças está ocupado demais com impostos para notar que algo está errado em Kishar — e há sete estações que está.',
  },
  {
    id: 'fosso-dos-ecos',
    nome: 'O Fosso dos Ecos',
    tagline: '"Um abismo onde os sussurros dos mortos ainda se arrastam pelas paredes de cera."',
    icon: '🕯️',
    altImagem: 'Vista aérea do Fosso dos Ecos, com paredes de cera e luzes bruxuleantes no fundo',
    cenario:
      'Uma fenda gigantesca a poucos dias de Kishar, coberta por teias e estalactites de cera escura. No fundo, lagos de mel fermentado e colmeias que não pertencem a nenhuma civilização conhecida — pelo menos a nenhuma que ainda exista.',
    perigos: 'Insetos necrófagos territorialistas, gases alucinógenos, labirintos de favos com geometria impossível de reproduzir.',
    gancho: 'Há sete estações, um farol de cera foi aceso no ponto mais profundo do Fosso. Permanece aceso. Ninguém que foi até lá voltou para contar quem o acendeu.',
  },
  {
    id: 'arquivo-podre',
    nome: 'O Arquivo Podre',
    tagline: '"Uma biblioteca monumental construída dentro de um tronco de árvore fossilizada."',
    icon: '📚',
    altImagem: 'Interior do Arquivo Podre, com corredores de memória esculpidos na madeira fossilizada',
    cenario:
      'A árvore era antiga quando Cinzerium ainda existia. Por gerações, monges empilharam livros e pergaminhos de asas de mariposa e seda no tronco oco. A umidade e os fungos estão ganhando.',
    perigos: 'Esporos que confundem memórias recentes e avivam memórias que não deveriam existir; guardiões cegos, imunes ao efeito, protegem os corredores internos.',
    gancho: 'Alguém está queimando os registros — não os fungos, deliberadamente. Um monge usa a palavra "censura" em voz muito baixa quando acha que ninguém está ouvindo.',
  },
  {
    id: 'jardim-memorias-murchas',
    nome: 'O Jardim das Memórias Murchas',
    tagline: '"Um jardim suspenso em cavernas bioluminescentes, alimentado por sonhos líquidos."',
    icon: '🌸',
    altImagem: 'Jardim bioluminescente subterrâneo com rios de néctar de sonhos e flores apagando uma a uma',
    cenario:
      'Uma câmara subterrânea onde plantas crescem sem luz solar, alimentadas por veios de Essência Condensada — o "néctar dos sonhos". Bebê-lo faz reviver lembranças perdidas. Às vezes as suas. Às vezes as de outros.',
    perigos: 'Predadores camuflados entre as pétalas, cada vez mais agressivos; a "murcha" que está apagando as flores uma a uma.',
    gancho: 'A teoria mais séria não é que uma praga veio de fora — é que o Jardim está lembrando de algo, e o processo de lembrar está consumindo a energia que mantém as plantas vivas.',
  },
  {
    id: 'mercado-de-areia',
    nome: 'O Mercado de Areia',
    tagline: '"O único lugar neutro que ainda resta."',
    icon: '🏺',
    altImagem: 'Mercado nômade montado em torno de uma fonte luminosa, com besouros e formigas comerciando',
    cenario:
      'Não é um lugar fixo — monta-se e desmonta-se por rotas que os comerciantes nômades conhecem de memória mas nunca escrevem. A Guarda Silenciosa mantém a paz com eficiência perturbadora.',
    perigos: 'Furtadores raros (o perímetro é bem guardado), e um mapa falso que circula entre os comerciantes — preciso, verossímil, e que leva a um lugar que não deveria estar marcado em mapa nenhum.',
    gancho: 'Dois grupos já seguiram o mapa falso. Nenhum voltou para pedir reembolso.',
  },
  {
    id: 'ruinas-de-cristaurea',
    nome: 'As Ruínas de Cristáurea',
    tagline: '"O que sobrou quando a glória caiu."',
    icon: '🏛️',
    altImagem: 'Torres de vidro escurecido e ruas de mármore cobertas de poeira na antiga capital de Cinzerium',
    cenario:
      'A antiga capital não desapareceu — só parou de funcionar. As torres de vidro ainda estão de pé, a maioria. A realidade ali é levemente mais fina do que deveria ser, por causa dos fragmentos que Sérion reuniu.',
    perigos: 'Coisas impossíveis acontecem com frequência inconveniente. O palácio central tem uma sala sem maçaneta que ninguém abriu desde a batalha final — e as paredes ao redor ficam quentes demais para tocar.',
    gancho: 'Saqueadores vão. Alguns voltam com coisas valiosas. A proporção é boa o suficiente para que continuem indo.',
  },
  {
    id: 'vale-suspenso',
    nome: 'O Vale Suspenso',
    tagline: '"Onde a terra não sabe se quer ficar no lugar."',
    icon: '🪨',
    altImagem: 'Plataformas de pedra flutuantes conectadas por pontes de seda no Vale Suspenso',
    cenario:
      'Uma formação geológica impossível: plataformas de pedra flutuando a alturas variáveis, conectadas por pontes de seda reforçada. Ninguém sabe o que as mantém no ar — as teorias se contradizem.',
    perigos: 'Rotas aéreas que nenhum visitante de solo consegue seguir sem guia, e uma indiferença local perturbadora com o abismo abaixo.',
    gancho: 'No nível mais alto há uma plataforma sem ponte de acesso que, em noites de céu limpo, parece iluminada por dentro. Os habitantes não vendem informação sobre ela — e não discutem o assunto.',
  },
]

/* ── Componentes ────────────────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4" aria-hidden>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
    <span style={{ color: 'var(--gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(var(--gold-rgb),0.7)' }}>◈</span>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
  </div>
)

function LocalCard({ local }: { local: Local }) {
  return (
    <article
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-200 group"
      style={{ background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.14)' }}
    >
      <div
        className="h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.55), transparent)' }}
        aria-hidden
      />

      <div
        className="flex flex-col items-center justify-center gap-2 shrink-0"
        role="img"
        aria-label={local.altImagem}
        style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg))', borderBottom: '1px solid rgba(var(--gold-rgb),0.1)', position: 'relative' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--gold-rgb),0.05) 0%, transparent 70%)' }} aria-hidden />
        <span style={{ fontSize: '2.8rem', opacity: 0.55, position: 'relative', zIndex: 1 }} aria-hidden>{local.icon}</span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
          Arte conceitual em breve
        </span>
      </div>

      <div className="flex flex-col flex-1 gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em', lineHeight: 1.3 }}>
            {local.nome}
          </h2>
          <span className="shrink-0 ddb-badge ddb-badge-dim mt-0.5" aria-label="Atualização em breve">Em Breve</span>
        </div>

        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.65)', fontSize: '0.9rem', lineHeight: 1.65, borderLeft: '2px solid rgba(var(--gold-rgb),0.3)', paddingLeft: '0.85rem' }}>
          {local.tagline}
        </p>

        <div className="flex flex-col gap-3 flex-1">
          {[{ label: 'Cenário', texto: local.cenario }, { label: 'Perigos', texto: local.perigos }].map(({ label, texto }) => (
            <div key={label} className="flex gap-3">
              <span className="shrink-0" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-light)', paddingTop: '0.1rem', minWidth: '4rem' }}>
                {label}
              </span>
              <span style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.88rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.7 }}>
                {texto}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4 pt-3" style={{ borderTop: '1px solid rgba(var(--gold-rgb),0.1)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, marginBottom: '0.3rem' }}>
              Gancho
            </p>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.45)', lineHeight: 1.5 }}>
              {local.gancho}
            </p>
          </div>
          <span
            className="shrink-0 hk-btn"
            style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: 6, background: 'rgba(var(--text-muted-rgb),0.06)', borderColor: 'rgba(var(--text-muted-rgb),0.2)', color: 'rgba(var(--text-muted-rgb),0.35)', cursor: 'not-allowed', pointerEvents: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
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
    <ContentShell title="Locais">

      <section className="relative flex flex-col items-center text-center" aria-label="Cabeçalho da página">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gold-rgb),0.07) 0%, transparent 70%)' }} aria-hidden />

        <div className="relative flex flex-col items-center gap-4 px-6 pt-14 pb-12">
          <nav className="flex items-center gap-2" aria-label="Navegação estrutural" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">← Início</Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Locais</span>
          </nav>

          <OrnamentDivider />

          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Os Territórios de Kishar
          </p>

          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text)' }}>
            Locais
          </h1>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.85, maxWidth: 480 }}>
            Sete territórios onde o passado apodrece e o perigo aguarda.<br />
            Cada região guarda segredos que poucos ousaram desvendar.
          </p>
        </div>

        <div className="w-full divider-gold" aria-hidden />
      </section>

      <main className="flex-1 mx-auto w-full px-4 sm:px-6 py-16" style={{ maxWidth: 1200, background: 'var(--bg-secondary)' }} id="locais-grid">
        <div className="flex flex-col items-center gap-3 mb-12">
          <p className="hk-divider text-sm" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.35em' }}>
            Sete Regiões
          </p>
          <h2 className="section-heading-glow" style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
            Os Territórios do Vazio
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(var(--text-rgb),0.5)', fontSize: '0.92rem', maxWidth: 520, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
            Sete regiões aguardam os filhos corajosos — ou insensatos — o suficiente para explorá-las.
          </p>
        </div>

        <div className="locais-grid">
          {locais.map((local) => <LocalCard key={local.id} local={local} />)}
        </div>
      </main>
    </ContentShell>
  )
}
