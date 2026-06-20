import type { Metadata } from 'next'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'

export const metadata: Metadata = {
  title: 'História – Filhos do Vazio',
  description:
    'Antes de Kishar, os Seres Superiores guerrearam e caíram. Esta é a história do que restou.',
}

/* ── Dados do Panteão ───────────────────────────────────── */

type Deidade = {
  id: string
  nome: string
  epiteto: string
  icon: string
  texto: string
}

const panteao: Deidade[] = [
  { id: 'radiancia', nome: 'A Radiância', epiteto: 'Deusa da luz cegante e da memória eterna', icon: '☀️', texto: 'Existia como um sol de consciência pura. Sua luz concedia visão e despertava mentes — mas não era benevolente. Exigia devoção absoluta; quem a negava era consumido por sonhos febris que se tornavam pesadelos de vigília. Sua ira era a Infecção: uma praga que devorava a mente e transformava insetos em cascas obedientes. Criou a Tribo das Mariposas para que a adorassem eternamente.' },
  { id: 'rei-palido', nome: 'O Rei Pálido', epiteto: 'A mente fria. O arquiteto da ordem', icon: '♔', texto: 'Um Verme ancestral que abandonou sua forma colossal para renascer como governante mortal. Onde a Radiância exigia devoção, ele oferecia razão e propósito. Fundou reinos sobre os ossos de civilizações mais antigas. Seu maior ato foi também sua maior tragédia: para conter a Infecção, tentou domar o Vazio. O plano falhou de maneiras que ainda não foram completamente compreendidas. Desapareceu, deixando apenas seu trono vazio.' },
  { id: 'dama-branca', nome: 'A Dama Branca', epiteto: 'A paciência que cresce devagar', icon: '🌿', texto: 'Consorte do Rei Pálido. Seu corpo era uma árvore de carne e raízes brancas, enraizada em algum lugar que ninguém encontrou mais. Via o mundo não como um tabuleiro, mas como um jardim. Sobreviveu ao colapso dos grandes reinos isolando-se completamente. Aguarda. Para quê, não se sabe.' },
  { id: 'unn', nome: 'Unn', epiteto: 'A deusa adormecida do crescimento e da vida verde', icon: '🌊', texto: 'Existia antes mesmo do Rei Pálido. Seu domínio era a seiva nas veias das plantas, os sonhos que se tornam florestas. Enfraqueceu com o tempo — hoje resta apenas um vestígio de sua forma antiga, algo aquático e silencioso que observa aqueles que se aproximam de certos lagos profundos. Não fala. Apenas olha.' },
  { id: 'coracao-pesadelos', nome: 'O Coração dos Pesadelos', epiteto: 'Fome com forma', icon: '🔥', texto: 'Habita um espelho distorcido do mundo — o Reino dos Pesadelos. Não é bom nem mau: é apetite. Alimenta-se do medo e do sofrimento dos reinos em colapso. Para sobreviver, precisa de um receptáculo — um corpo que possa conter sua essência flamejante. O ritual se repete: um mestre, uma criança, o fogo que nunca se apaga.' },
  { id: 'vaskrin', nome: 'Vaskrin, o Grilo Verde', epiteto: 'Deus da sorte, do acaso e das apostas mal feitas', icon: '🦗', texto: 'Ninguém sabe quando Vaskrin surgiu — os registros mais antigos já o mencionam como algo que sempre esteve lá. Aparece em encruzilhadas, em mesas de jogo, em momentos onde a diferença entre a vida e a morte é uma questão de milímetros e ventos. Não interfere. Observa. Às vezes, raramente, pisca — e aquele para quem ele piscou descobre que a moeda caiu do lado certo. Ele não responde orações. Mas dizem que escuta.' },
  { id: 'vazio', nome: 'A Entidade do Vazio', epiteto: 'A antítese de toda luz e forma', icon: '◈', texto: 'O Vazio é a matéria primordial que existe nas profundezas mais absolutas do mundo — uma escuridão tão densa que precede a própria existência. O Rei Pálido tentou domá-lo. O Vazio não pode ser domado. Ele apenas espera. Os Filhos do Vazio — aqueles que carregam sua essência, voluntariamente ou não — não são servos. São uma possibilidade. O Vazio não tem planos. Tem gravidade.' },
]

const entidadesMenores = [
  { nome: 'A Rainha Vespa', texto: 'Governou uma civilização de colmeia com ferro e mel, muito antes de qualquer reino mortal ganhar forma. Reduzida a um cadáver mumificado que, dizem alguns, ainda abre os olhos em certas luas.' },
  { nome: 'Os Sonhadores', texto: 'Três insetos mortais elevados ao status de semi-divinos por rituais que o Rei Pálido conduziu pessoalmente. Cada um guarda um selo de contenção. O que estão contendo é uma questão que os sábios preferem não investigar muito de perto.' },
  { nome: 'O Tecelão de Sonhos', texto: 'Habita os recantos mais profundos do Reino dos Sonhos — se é que habita, se é que existe. Tece as memórias dos mortos em fios de Essência. Poucos o viram. Os que viram raramente explicam o que encontraram.' },
]

/* ── Componentes de apoio ───────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4 my-10" aria-hidden>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.25))' }} />
    <span style={{ color: 'var(--gold)', fontSize: '0.8rem', opacity: 0.6 }}>◈</span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(var(--gold-rgb),0.25))' }} />
  </div>
)

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-im-fell)', fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', lineHeight: 1.95, color: 'rgba(var(--text-rgb),0.72)', marginBottom: '1.4rem' }}>
      {children}
    </p>
  )
}

function DeityCard({ deidade }: { deidade: Deidade }) {
  return (
    <article className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.14)' }}>
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '1.5rem' }} aria-hidden>{deidade.icon}</span>
        <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold)' }}>{deidade.nome}</h3>
      </div>
      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginBottom: '0.75rem', borderLeft: '2px solid rgba(var(--gold-rgb),0.3)', paddingLeft: '0.75rem' }}>
        {deidade.epiteto}
      </p>
      <p style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(var(--text-rgb),0.62)' }}>
        {deidade.texto}
      </p>
    </article>
  )
}

/* ── Página ─────────────────────────────────────────────── */

export default function HistoriaPage() {
  return (
    <ContentShell title="História">
      <section className="relative flex flex-col items-center text-center" aria-label="Cabeçalho da página">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gold-rgb),0.06) 0%, transparent 70%)' }} aria-hidden />

        <div className="relative flex flex-col items-center gap-4 px-6 pt-14 pb-12">
          <nav className="flex items-center gap-2" aria-label="Navegação estrutural" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">← Início</Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">História</span>
          </nav>

          <div className="flex items-center gap-4" aria-hidden>
            <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(var(--gold-rgb),0.7)' }}>◈</span>
            <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Compêndio de Lore — v0.1
          </p>

          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text)' }}>
            História
          </h1>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.85, maxWidth: 480 }}>
            Dos deuses que guerrearam, do reino que caiu, e do que restou sobre o dorso de uma criatura adormecida.
          </p>
        </div>

        <div className="w-full divider-gold" aria-hidden />
      </section>

      <main className="flex-1 w-full" style={{ background: 'var(--bg-secondary)' }}>
        <article className="mx-auto px-6 py-16" style={{ maxWidth: 760 }}>

          {/* ── Parte I: O Panteão ── */}
          <h2 className="mb-3" style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em', textAlign: 'center' }}>
            Parte I — O Panteão
          </h2>
          <Paragraph>
            Na aurora de todos os tempos, quando o mundo ainda era informe, os Seres Superiores despertaram.
            Eram deuses de carne e pensamento, entidades cuja mera existência dobrava a realidade ao redor.
            Cada um personificava um aspecto fundamental da existência — e seus conflitos moldaram os
            alicerces do mundo que viria a ser.
          </Paragraph>
          <Paragraph>
            O que os livros sagrados chamam de &quot;Os Grandes&quot; são apenas os que deixaram marcas
            suficientes para serem lembrados. Existiram outros — entidades menores, divindades esquecidas —
            que sumiram antes que qualquer inseto soubesse escrever.
          </Paragraph>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ margin: '2rem 0' }}>
            {panteao.map(d => <DeityCard key={d.id} deidade={d} />)}
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '1rem' }}>
            Entidades Menores e Esquecidas
          </h3>
          {entidadesMenores.map(e => (
            <Paragraph key={e.nome}>
              <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>{e.nome}</strong> — {e.texto}
            </Paragraph>
          ))}
          <Paragraph>
            Existiram mais. Sempre existiram mais. O mundo é mais velho do que qualquer registro, e os deuses
            que morreram antes de qualquer inseto saber escrever deixaram apenas silêncio — e às vezes, uma
            sensação estranha em lugares que não deveriam ter sensação nenhuma.
          </Paragraph>

          <OrnamentDivider />

          {/* ── Parte II: A Linha do Tempo ── */}
          <h2 className="mb-3" style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em', textAlign: 'center' }}>
            Parte II — A Linha do Tempo
          </h2>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-light)', marginTop: '2rem', marginBottom: '0.75rem' }}>
            Os Tempos Antigos
          </h3>
          <Paragraph>
            Antes dos reinos dos insetos, os Seres Superiores existiram e guerrearam. A chamada{' '}
            <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Guerra dos Ecos</strong> quebrou o
            mundo em fragmentos — literalmente: a batalha entre as divindades deixou para trás lascas de sua
            própria essência, espalhadas por cavernas, ruínas e profundezas que os insetos mais tarde
            chamariam de lar.
          </Paragraph>
          <Paragraph>O que restou foi um mundo cicatrizado, cheio de poder que ninguém sabia como usar direito.</Paragraph>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-light)', marginTop: '2rem', marginBottom: '0.75rem' }}>
            O Passado — A Ascensão e a Queda de Cinzerium
          </h3>
          <Paragraph>
            Do caos que se seguiu à guerra dos deuses, um inseto chamado{' '}
            <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Rei Sérion</strong> emergiu das
            sombras. Mortal, ambicioso, visionário. Descobriu que os fragmentos deixados pelos Seres
            Superiores eram chaves — e que, reunidos, amplificavam seu poder de maneiras que nenhum deus
            havia previsto.
          </Paragraph>
          <Paragraph>
            Com eles, ergueu <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Cinzerium</strong>:
            o maior reino que o mundo havia visto. Sua capital, Cristáurea, era uma cidade de torres de vidro
            e ruas de mármore, construída sobre o túmulo de um deus caído. Por eras, floresceu.
          </Paragraph>
          <Paragraph>Mas os fragmentos tinham preço. E o preço era a alma.</Paragraph>
          <Paragraph>
            Com o tempo, Sérion começou a mudar. O poder de ver traições futuras o fez ver traições em todo
            lugar. Governou primeiro com medo, depois com terror. Foi quando{' '}
            <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Kaelen de Ferro</strong> — seu
            escudeiro, o inseto que havia ajudado a construir Cinzerium pedra por pedra — recusou-se a
            obedecer.
          </Paragraph>
          <Paragraph>
            A rebelião durou anos. No final, Kaelen enfrentou Sérion no palácio de Cristáurea. A batalha durou
            três dias e três noites. Quando a poeira baixou, ambos estavam mortos. Cinzerium ruiu logo em
            seguida.
          </Paragraph>

          <blockquote style={{ margin: '2.5rem 0', padding: '1.5rem 2rem', borderLeft: '3px solid rgba(var(--gold-rgb),0.5)', background: 'linear-gradient(to right, rgba(var(--gold-rgb),0.05), transparent)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', color: 'rgba(var(--text-rgb),0.8)', lineHeight: 1.8, margin: 0 }}>
              Nunca se soube o que aconteceu com a Rainha Mira. Seu nome foi apagado dos registros oficiais —
              o que, para quem entende de história, geralmente significa que a história tem medo dela.
            </p>
          </blockquote>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-light)', marginTop: '2rem', marginBottom: '0.75rem' }}>
            O Presente — O Reino Sem Rei
          </h3>
          <Paragraph>
            Com a queda de Cinzerium, o mundo se fragmentou em domínios menores.{' '}
            <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Kishar</strong> — a criatura
            colossal que havia servido como território neutro durante a era de ouro — tornou-se o ponto de
            convergência natural. Não porque alguém escolheu. Porque era o único lugar que sobrou intacto.
          </Paragraph>
          <Paragraph>
            Durante gerações, o reino foi governado por uma linha de reis e rainhas que ninguém mais consegue
            traçar com clareza — a chamada <strong style={{ color: 'var(--gold-light)', fontStyle: 'normal' }}>Era das Trocas</strong>.
            Nenhum rei durou muito. Alguns foram depostos. Alguns desapareceram, o que é talvez a categoria
            mais inquietante.
          </Paragraph>
          <Paragraph>
            O último rei — <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Sael, o Persistente</strong> —
            durou quatorze estações no trono. Foi encontrado no jardim da Coroa ao amanhecer, sentado em
            posição ereta, com os olhos abertos. Não havia marca no corpo. Isso foi há sete estações.
          </Paragraph>
          <Paragraph>
            Desde então, Kishar é governado pelo{' '}
            <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Conselho das Carapaças</strong> —
            cinco insetos que governam por consenso, o que na prática significa que quase nada é decidido com
            velocidade.
          </Paragraph>
          <Paragraph>
            O reino está em decadência. Não dramaticamente — não ainda. Mas as rachaduras estão aparecendo.
            Algo está errado em Kishar. Algo esteve errado por algum tempo. E o Conselho está ocupado demais
            brigando sobre impostos de exportação para perceber.
          </Paragraph>

          <div className="mt-16 flex flex-col items-center gap-4 text-center" style={{ padding: '2rem', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 12, background: 'rgba(var(--gold-rgb),0.03)' }}>
            <span style={{ color: 'var(--gold-light)', fontSize: '1.5rem', opacity: 0.4 }} aria-hidden>◈</span>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(var(--text-muted-rgb),0.5)' }}>
              Atualização em breve
            </p>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.3)', maxWidth: 400 }}>
              Este é um documento vivo — Locais e Facções detalham o que Kishar se tornou. Novos capítulos serão revelados conforme o mundo é construído.
            </p>
          </div>
        </article>
      </main>
    </ContentShell>
  )
}
