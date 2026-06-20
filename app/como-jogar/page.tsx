import type { Metadata } from 'next'
import ContentShell from '@/components/ContentShell'
import TableOfContents from './TableOfContents'

export const metadata: Metadata = {
  title: 'Como Jogar – Filhos do Vazio',
  description:
    'Guia de regras de Filhos do Vazio v0.3: criação de personagem, rolagem, combate, alma, progressão e Fragmentos do Vazio.',
}

const sections = [
  { id: 'o-que-e',       label: '1. O que é Filhos do Vazio?' },
  { id: 'preparacao',    label: '2. O que Você Precisa' },
  { id: 'criacao',       label: '3. Criando seu Personagem' },
  { id: 'movimentacao',  label: '4. Movimentação e Espaços' },
  { id: 'rolagem',       label: '5. Mecânicas de Rolagem' },
  { id: 'combate',       label: '6. Combate' },
  { id: 'alma',          label: '7. Alma e Magia' },
  { id: 'progressao',    label: '8. Progressão' },
  { id: 'fragmentos',    label: '9. Fragmentos do Vazio' },
  { id: 'mestre',        label: '10. O Papel do Mestre' },
  { id: 'dicas',         label: '11. Dicas para Iniciantes' },
]

/* ── Tiny helpers ─────────────────────────────────────── */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-16"
      style={{
        fontFamily: 'var(--font-cinzel-decorative)',
        fontSize: '1.35rem',
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
        fontSize: '0.95rem',
        letterSpacing: '0.06em',
        color: 'var(--gold-light)',
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
    <p style={{ color: 'rgba(var(--text-rgb),0.75)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
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
    <li style={{ color: 'rgba(var(--text-rgb),0.75)', lineHeight: 1.7, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(var(--gold-rgb),0.25)' }}>
      {children}
    </li>
  )
}

/* Slot de imagem — substitua src="" e remova o overlay quando houver arte real. */
function ImageSlot({ alt, caption }: { alt: string; caption?: string }) {
  return (
    <figure style={{ margin: '1.75rem 0', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.15)', background: 'var(--bg-secondary)' }}>
      <div
        role="img"
        aria-label={alt}
        style={{
          width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '0.6rem', padding: '2rem 1.5rem',
          background: 'repeating-linear-gradient(45deg, rgba(var(--gold-rgb),0.03) 0px, rgba(var(--gold-rgb),0.03) 1px, transparent 1px, transparent 12px)',
        }}
      >
        <span style={{ fontSize: '2rem', opacity: 0.35 }}>🖼️</span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--gold-light)', opacity: 0.6, textTransform: 'uppercase' }}>
          Imagem pendente
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 480, lineHeight: 1.5 }}>
          {alt}
        </span>
      </div>
      {caption && (
        <figcaption style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 1rem', borderTop: '1px solid rgba(var(--gold-rgb),0.08)' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: 'rgba(var(--text-rgb),0.75)' }}>
        {children}
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--gold-light)', background: 'rgba(var(--gold-rgb),0.06)', borderBottom: '1px solid rgba(var(--gold-rgb),0.2)', whiteSpace: 'nowrap' }}>
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

function GiftCard({ title, italic, children }: { title: string; italic: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '1.1rem 1.25rem', borderRadius: 10, marginBottom: '1rem' }}>
      <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>{title}</h4>
      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.5)', marginBottom: '0.6rem' }}>{italic}</p>
      <p style={{ color: 'rgba(var(--text-rgb),0.7)', lineHeight: 1.7, fontSize: '0.9rem' }}>{children}</p>
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
            Guia de Regras — v0.3
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

            <ImageSlot
              alt="Arte conceitual de um inseto aventureiro diante das ruínas decadentes de Kishar, com fragmentos de poder ancestral brilhando ao fundo"
              caption="Você é um herdeiro do Vazio — e cada escolha define quem você se tornará."
            />

            <P>
              Filhos do Vazio é um RPG de mesa sobre insetos em um reino decadente, herdeiros de um poder
              ancestral que não pediram e não compreendem completamente. Você é um aventureiro que busca
              fragmentos de poder, enfrenta perigos e descobre segredos que o mundo preferia que ficassem
              esquecidos.
            </P>
            <P>
              Neste jogo, você não controla um herói genérico. Você controla um inseto com personalidade,
              traços únicos e um destino que pode ser moldado por suas escolhas — ou destruído por elas.
            </P>

            {/* ─── 2. Preparação ──────────────────────── */}
            <SectionTitle id="preparacao">2. O que Você Precisa para Jogar?</SectionTitle>
            <Ul>
              <Li><strong>Dados</strong> — vários dados de seis faces (d6). Recomenda-se pelo menos 8 por jogador.</Li>
              <Li><strong>Ficha de personagem</strong> — onde você anota atributos, traços, equipamento e fragmentos.</Li>
              <Li><strong>Mestre (GM)</strong> — a pessoa que narra a história, controla os NPCs e desafia os jogadores.</Li>
              <Li><strong>Jogadores</strong> — 2 a 5 pessoas, cada uma controlando um inseto.</Li>
              <Li><strong>Imaginação</strong> — o mais importante.</Li>
            </Ul>

            {/* ─── 3. Criação ────────────────────────── */}
            <SectionTitle id="criacao">3. Criando seu Personagem</SectionTitle>

            <ImageSlot
              alt="Linha do tempo visual dos seis passos de criação de personagem: tamanho, atributos, traços, trilha, equipamento e identidade"
              caption="Os seis passos para criar seu Filho do Vazio."
            />

            <SubTitle>Passo 1: Escolha o Tamanho</SubTitle>
            <P>
              O tamanho do seu inseto define sua escala no mundo, quanto ele precisa comer para funcionar e
              onde ele consegue passar.
            </P>
            <Table>
              <thead>
                <tr><Th>Tamanho</Th><Th>Descrição</Th><Th>Sustento por descanso</Th></tr>
              </thead>
              <tbody>
                <tr><Td>Pequeno</Td><Td>Ágil, discreto, fácil de ignorar</Td><Td>1</Td></tr>
                <tr><Td>Médio</Td><Td>Equilibrado, versátil</Td><Td>2</Td></tr>
                <tr><Td>Grande</Td><Td>Forte, imponente, difícil de esconder</Td><Td>3</Td></tr>
              </tbody>
            </Table>
            <P>
              <strong>Sustento</strong> representa comida, água e descanso mínimos. Um inseto que não satisfaz
              seu Sustento ao descansar não recupera Estamina máxima e sofre -1 em todos os testes até que
              coma. Dois descansos sem Sustento impõem -2. Três ou mais: o GM decide o que acontece, e
              geralmente não é bom.
            </P>

            <SubTitle>Passo 2: Defina os Atributos</SubTitle>
            <P>
              Distribua pontos entre os quatro atributos conforme seu tamanho. Cada atributo começa em 1 e
              tem máximo de 7 para insetos mortais.
            </P>
            <Ul>
              <Li><strong>Poder</strong> — força física, ataques corpo a corpo, resistência bruta.</Li>
              <Li><strong>Graça</strong> — agilidade, ataques à distância, esquiva e destreza.</Li>
              <Li><strong>Casca</strong> — dureza da carapaça, resistência a dano, presença física.</Li>
              <Li><strong>Saber</strong> — percepção, inteligência, magia e instinto.</Li>
            </Ul>

            <SubTitle>Passo 3: Escolha os Traços</SubTitle>
            <P>Traços definem quem seu inseto é — não apenas o que ele faz.</P>
            <Ul>
              <Li>Até <strong>7 traços comuns</strong></Li>
              <Li><strong>2 traços de personalidade</strong> (obrigatórios — são a âncora do seu personagem)</Li>
              <Li>Até <strong>3 traços marcantes</strong></Li>
              <Li>Até <strong>1 traço raro</strong></Li>
            </Ul>

            <SubTitle>Passo 4: Escolha uma Trilha Inicial</SubTitle>
            <Ul>
              <Li><strong>Marcial</strong> — combate, armas, técnicas físicas. Começa no nível 1.</Li>
              <Li><strong>Mística</strong> — magia, arcanas, manipulação de Alma. Começa no nível 1.</Li>
            </Ul>

            <SubTitle>Passo 5: Pegue Equipamento</SubTitle>
            <P>Escolha um pacote inicial (Aventureiro, Viajante, etc.) ou compre itens com 50 Geo.</P>

            <SubTitle>Passo 6: Dê Vida ao seu Inseto</SubTitle>
            <P>
              Nome, espécie, aparência, história. O mundo de Kishar é vasto e decadente — de onde seu inseto
              veio, e por que está aqui agora?
            </P>

            {/* ─── 4. Movimentação ───────────────────── */}
            <SectionTitle id="movimentacao">4. Movimentação e Espaços</SectionTitle>

            <SubTitle>Deslocamento</SubTitle>
            <P>
              O <strong>Deslocamento</strong> de um inseto é igual à sua Graça arredondada para baixo. Em
              cada rodada, um inseto pode se mover em quadrados igual ao seu Deslocamento sem ativar ataques
              de oportunidade. Sair da área de ameaça de um inimigo ainda ativa o ataque dele.
            </P>

            <SubTitle>Tamanho e Espaços</SubTitle>
            <P>O tamanho importa não só em combate, mas para onde você consegue ir.</P>

            <ImageSlot
              alt="Diagrama de grid mostrando um inseto pequeno, médio e grande tentando passar por espaços apertados e impedidos"
              caption="Nem tudo em Kishar foi feito para que você coubesse."
            />

            <P><strong>Espaços apertados</strong> (1 quadrado de largura):</P>
            <Ul>
              <Li>Pequenos passam sem penalidade.</Li>
              <Li>Médios passam com -1 dado em testes de Graça enquanto estiverem dentro.</Li>
              <Li>Grandes não passam.</Li>
            </Ul>
            <P><strong>Espaços impedidos</strong> (fendas, passagens parcialmente bloqueadas):</P>
            <Ul>
              <Li>Pequenos passam com -1 dado em testes de Graça.</Li>
              <Li>Médios não passam sem remover o obstáculo.</Li>
              <Li>Grandes não passam.</Li>
            </Ul>
            <P>
              O mundo de Kishar foi construído sobre uma criatura colossal — seus túneis, rachaduras e
              passagens foram feitos por e para coisas que não eram insetos.
            </P>

            {/* ─── 5. Rolagem ────────────────────────── */}
            <SectionTitle id="rolagem">5. Mecânicas de Rolagem</SectionTitle>

            <SubTitle>Como Rolar</SubTitle>
            <P>
              A maioria das ações é resolvida com um <strong>teste de atributo</strong>. Role um número de d6
              igual ao atributo relevante, mais bônus de traços ou equipamentos.
            </P>
            <P><strong>Cada dado que mostrar 5 ou 6 é um sucesso.</strong> Para a maioria dos testes, 1 sucesso é suficiente. Mais sucessos podem gerar resultados melhores.</P>
            <Quote>
              Exemplo: Você tenta escalar uma parede. O GM pede um teste de Graça (3 dados). Você rola: 6, 4,
              3. Um sucesso — sobe a parede. Com 2 ou 3 sucessos, talvez subisse em silêncio absoluto, sem
              deixar rastro.
            </Quote>

            <SubTitle>O Toque de Vaskrin</SubTitle>
            <Quote>
              Dizem que Vaskrin, o Grilo Verde, observa cada teste. Às vezes ele pisca. Quando isso acontece,
              você sente antes mesmo de olhar para os dados.
            </Quote>
            <P>
              Após rolar qualquer teste, conte quantos <strong>6s</strong> e quantos <strong>1s</strong>{' '}
              apareceram. Subtraia os 1s dos 6s para obter o <strong>Toque</strong>.
            </P>
            <Ul>
              <Li><strong>Toque positivo</strong> → Sorriso de Vaskrin — algo bom acontece além do resultado normal.</Li>
              <Li><strong>Toque negativo</strong> → Costas de Vaskrin — algo ruim acontece, especialmente se você já falhou.</Li>
              <Li><strong>Toque zero</strong> → Vaskrin estava olhando para outro lado. O resultado é exatamente o que foi rolado.</Li>
            </Ul>

            <ImageSlot
              alt="Um grilo verde observando de longe uma mesa de dados rolando, com brilho dourado nos 6s e sombra nos 1s"
              caption="O Toque de Vaskrin — Sorriso quando positivo, Costas quando negativo."
            />

            <SubTitle>Sorriso de Vaskrin</SubTitle>
            <Table>
              <thead><tr><Th>Toque</Th><Th>Efeito</Th></tr></thead>
              <tbody>
                <tr><Td>+1</Td><Td><strong>Inspiração</strong> — guarde uma rerolagem. Pode ser usada em qualquer teste futuro antes do próximo descanso. Não acumula: se já tiver uma guardada e ganhar outra, escolha qual manter.</Td></tr>
                <tr><Td>+2</Td><Td><strong>Brecha na Casca</strong> — aplique imediatamente: seu ataque atual ignora 1 ponto de Casca do alvo e causa +1 de dano.</Td></tr>
                <tr><Td>+3</Td><Td><strong>Mão Cheia</strong> — aplique imediatamente: todos os dados do teste contam como sucessos, independente do valor.</Td></tr>
                <tr><Td>+4 ou mais</Td><Td><strong>O Sortudo</strong> — aplique imediatamente: o dano final do ataque é dobrado. Extremamente raro.</Td></tr>
              </tbody>
            </Table>

            <SubTitle>Costas de Vaskrin</SubTitle>
            <P>Aplicados imediatamente quando ocorrem em um ataque.</P>
            <Table>
              <thead><tr><Th>Toque</Th><Th>Efeito</Th></tr></thead>
              <tbody>
                <tr><Td>-1</Td><Td><strong>Casca Grossa</strong> — seu ataque bateu em uma parte mais dura que o esperado. -1 de dano neste ataque (mínimo 1).</Td></tr>
                <tr><Td>-2</Td><Td><strong>Golpe Torto</strong> — além do -1 de dano, você se expõe: o alvo ganha +1 dado em sua próxima defesa ou ataque contra você neste turno.</Td></tr>
                <tr><Td>-3</Td><Td><strong>Desastre</strong> — todos os dados contam como falha. Além disso, sofra 1 de dano ou perca a arma (sua escolha, se o GM permitir).</Td></tr>
                <tr><Td>-4 ou menos</Td><Td><strong>Lendário Negativo</strong> — fica a critério do GM. O dado rolou contra você com uma convicção que vai além do azar.</Td></tr>
              </tbody>
            </Table>
            <Quote>
              Vaskrin não pune nem recompensa com intenção. Ele apenas observa. O que acontece com quem ele
              olha é problema de quem está sendo olhado.
            </Quote>

            {/* ─── 6. Combate ────────────────────────── */}
            <SectionTitle id="combate">6. Combate</SectionTitle>

            <ImageSlot
              alt="Vista de cima de um grid tático: insetos em miniatura posicionados em um corredor de Kishar, com setas indicando movimento e linhas de ataque"
              caption="O combate acontece em grid tático — posicionamento e Estamina são recursos fundamentais."
            />

            <SubTitle>Ordem de Turnos</SubTitle>
            <P>
              No início do combate, todos rolam <strong>Iniciativa</strong> (teste de Graça, somando os
              dados). Quem tiver maior soma age primeiro.
            </P>

            <SubTitle>Ações em Combate</SubTitle>
            <P>Em seu turno, você pode:</P>
            <Ul>
              <Li><strong>Atacar</strong> — gaste pelo menos 1 Estamina. Role Poder + qualidade da arma + Estamina extra dedicada. 1 sucesso acerta; cada sucesso extra adiciona +1 de dano, até o limite da arma.</Li>
              <Li><strong>Defender</strong> — fora do seu turno, gaste 1 Estamina para aparar (Poder) ou esquivar (Graça). Cada sucesso anula um sucesso do ataque.</Li>
              <Li><strong>Mover-se</strong> — ande até seu Deslocamento em quadrados. Pode gastar Estamina para avançar ou saltar.</Li>
              <Li><strong>Usar uma perícia</strong> — escalar, se esconder, intimidar, negociar, etc.</Li>
              <Li><strong>Focar</strong> — ação de turno completo para curar com Alma, preparar uma arcana, ou recuperar Estoque.</Li>
            </Ul>

            <SubTitle>Estamina</SubTitle>
            <P>
              Você tem um número limitado de Estamina por turno, que <strong>regenera completamente a cada
              rodada</strong>. Cada ação gasta Estamina. Use com sabedoria.
            </P>

            <SubTitle>Dano</SubTitle>
            <P>Quando você acerta:</P>
            <Ul>
              <Li><strong>Dano bruto</strong> = dano base da arma + sucessos extras, limitado pelo dano base.</Li>
              <Li>Subtrai a <strong>Casca</strong> do alvo (redução fixa). O dano final nunca é menor que 1.</Li>
              <Li>Aplique modificadores do Toque de Vaskrin, se houver.</Li>
              <Li>Aplique o dano nos <strong>Corações</strong> do alvo.</Li>
            </Ul>
            <Quote>
              Exemplo: Você ataca com um Ferrão (dano 2) e tem 3 sucessos. Dano bruto = 2 + 2 = 4. O alvo tem
              Casca 2, então sofre 2 de dano.
            </Quote>

            <SubTitle>Morrendo</SubTitle>
            <P>
              Se seus Corações chegarem a 0, você entra em <strong>Porta da Morte</strong>. Ainda pode agir,
              mas qualquer dano adicional vai para sua Estamina. Se a Estamina chegar a 0, você morre. Após o
              combate, desmaia independente do resultado.
            </P>

            {/* ─── 7. Alma ───────────────────────────── */}
            <SectionTitle id="alma">7. Alma e Magia</SectionTitle>

            <ImageSlot
              alt="Inseto meditando em posição de foco, com partículas de alma azul fluindo dos inimigos ao redor em direção ao personagem"
              caption="A Alma é coletada ao causar dano — e pode ser usada para curar, preparar ou lançar feitiços."
            />

            <P>A <strong>Alma</strong> é sua reserva de energia mágica.</P>
            <Ul>
              <Li><strong>Curar</strong> — gaste Alma para recuperar Corações (1 Alma = 1 Coração) durante um Foco.</Li>
              <Li><strong>Lançar arcanas</strong> — se você tiver uma Trilha Mística, pode conjurar feitiços gastando Alma.</Li>
            </Ul>

            <SubTitle>Coletando Alma</SubTitle>
            <P>
              Sempre que você causar dano a um inimigo, ganha Alma igual ao dano causado, limitado pelo seu
              Saber. O ciclo: <strong>ataque → ganhe Alma → cure-se ou lance magia</strong>.
            </P>

            {/* ─── 8. Progressão ─────────────────────── */}
            <SectionTitle id="progressao">8. Progressão</SectionTitle>

            <P>
              Filhos do Vazio usa três formas de progressão, intencionalmente desequilibradas — os marcos e
              os fragmentos importam mais que o acúmulo de XP.
            </P>

            <SubTitle>Experiência (XP)</SubTitle>
            <P>
              Ganha XP por combates, exploração, interações e objetivos. O que o XP concede são{' '}
              <strong>Melhorias Menores</strong>: aumentar um atributo em 0,5, ganhar um traço comum,
              melhorar levemente uma arma. XP não transforma personagens. Afina.
            </P>

            <SubTitle>Marcos</SubTitle>
            <P>
              Concedidos pelo GM ao completar missões importantes, derrotar chefes ou resolver conflitos
              significativos. Marcos são transformações narrativas — eles mudam quem o personagem é, não
              apenas o que ele consegue fazer. Um Marco pode conceder um nível em uma Trilha, um traço
              marcante, ou acesso a um tipo de arcana.
            </P>

            <SubTitle>Fragmentos do Vazio</SubTitle>
            <P>O coração do sistema. Descritos na seção seguinte.</P>

            {/* ─── 9. Fragmentos ─────────────────────── */}
            <SectionTitle id="fragmentos">9. Fragmentos do Vazio</SectionTitle>

            <SubTitle>O que são</SubTitle>
            <P>
              Fragmentos são ecos de insetos antigos que deixaram sua marca no mundo. Não são apenas itens —
              são memórias cristalizadas, pedaços de existência que se recusaram a desaparecer quando seu
              portador original morreu.
            </P>
            <P>
              Estão espalhados por ruínas, guardados por criaturas, escondidos em lugares que o mundo parece
              querer manter esquecidos. Absorver um fragmento concede poder permanente. Não é um processo
              confortável.
            </P>

            <ImageSlot
              alt="Quatro fragmentos flutuantes com brilho azul-escuro: uma máscara rachada, uma chama de alma, uma carapaça cristalizada e um cristal multifacetado"
              caption="Os quatro tipos de Fragmento do Vazio."
            />

            <SubTitle>Tipos de Fragmentos</SubTitle>
            <Table>
              <thead><tr><Th>Fragmento</Th><Th>Efeito ao absorver</Th></tr></thead>
              <tbody>
                <tr><Td>Fragmento de Máscara</Td><Td>+1 Coração máximo</Td></tr>
                <tr><Td>Fragmento de Alma</Td><Td>+1 Alma máxima</Td></tr>
                <tr><Td>Fragmento de Casca</Td><Td>+1 Casca permanente</Td></tr>
                <tr><Td>Fragmento de Adaptação</Td><Td>Concede traços conforme a quantidade absorvida (ver abaixo)</Td></tr>
              </tbody>
            </Table>

            <SubTitle>Fragmentos de Adaptação — Camadas de Poder</SubTitle>
            <P>Cada Fragmento de Adaptação absorvido abre uma camada de mudança maior que a anterior. Eles não se substituem — se acumulam.</P>
            <Table>
              <thead><tr><Th>Total absorvido</Th><Th>O que concede</Th></tr></thead>
              <tbody>
                <tr><Td>1º Fragmento</Td><Td>Um traço <strong>Comum</strong> à sua escolha</Td></tr>
                <tr><Td>2º Fragmento</Td><Td>Um traço <strong>Marcante</strong> à sua escolha (além do comum já obtido)</Td></tr>
                <tr><Td>3º Fragmento</Td><Td>Um traço <strong>Raro</strong> à sua escolha (além de todos os anteriores)</Td></tr>
              </tbody>
            </Table>
            <P>
              Cada fragmento representa uma mudança real no inseto — não apenas uma habilidade nova, mas algo
              que muda quem ele é. O primeiro ajusta. O segundo transforma. O terceiro redefine.
            </P>

            <SubTitle>Capacidade de Essência</SubTitle>
            <P>
              Cada personagem tem uma <strong>Capacidade de Essência</strong> igual a <strong>Saber + 1</strong>.
              Esse é o número total de espaços disponíveis para fragmentos. Fragmentos do mesmo tipo ficam
              progressivamente mais difíceis de absorver:
            </P>
            <Table>
              <thead><tr><Th>Ordem</Th><Th>Custo em espaços</Th></tr></thead>
              <tbody>
                <tr><Td>1º do tipo</Td><Td>1 espaço</Td></tr>
                <tr><Td>2º do tipo</Td><Td>2 espaços</Td></tr>
                <tr><Td>3º do tipo</Td><Td>4 espaços</Td></tr>
                <tr><Td>4º do tipo</Td><Td>8 espaços</Td></tr>
              </tbody>
            </Table>
            <Quote>Exemplo: Dois Fragmentos de Casca custam 1 + 2 = 3 espaços. O terceiro custaria 4 espaços adicionais, totalizando 7.</Quote>

            <SubTitle>O Despertar — A Luta Contra a Sombra</SubTitle>
            <Quote>O Vazio não se entrega. Ele testa.</Quote>
            <P>
              Quando você tenta absorver o último fragmento — aquele que preencheria completamente sua
              Capacidade de Essência — o processo não é automático. O Vazio reconhece que você está tentando
              contê-lo inteiramente, e responde da única forma que conhece. Você enfrenta a sua própria{' '}
              <strong>Sombra</strong>.
            </P>

            <ImageSlot
              alt="Personagem inseto envolto em energia do Vazio enfrentando sua própria silhueta sombria, idêntica em forma mas sem rosto"
              caption="A Sombra conhece cada traço que você tem. Cada técnica que você usa. Cada ponto fraco que você tentou esconder."
            />

            <SubTitle>O que é a Sombra</SubTitle>
            <P>
              A Sombra é uma manifestação do Vazio com a forma do seu próprio personagem — seus medos, suas
              fraquezas, a versão de você que poderia ter se tornado. O GM usa sua própria ficha contra você,
              com os seguintes ajustes:
            </P>
            <Ul>
              <Li>A Sombra tem os mesmos atributos e traços do personagem.</Li>
              <Li>Ela <strong>não tem Alma</strong> — não cura, não lança magia. O Vazio não cura a si mesmo.</Li>
              <Li>Ela <strong>não fala</strong>. Não negocia. Não hesita. Apenas pressiona.</Li>
              <Li>A Sombra tem <strong>Corações iguais ao dobro do Saber</strong> do personagem.</Li>
            </Ul>

            <SubTitle>As Regras da Luta</SubTitle>
            <Ul>
              <Li>Apenas o personagem que está tentando absorver o fragmento pode lutar. Os aliados veem o personagem em transe, imóvel, enquanto a luta acontece em algum lugar entre o mundo e o Vazio.</Li>
              <Li>Não há morte nesta luta. Se a Sombra reduzir os Corações do personagem a 0, ele é expulso.</Li>
              <Li>O personagem começa a luta com todos os seus Corações e Estamina, mas com <strong>Alma zerada</strong> — o Vazio consome a magia antes que a luta comece.</Li>
            </Ul>

            <SubTitle>Resultados</SubTitle>
            <P>
              <strong>Se vencer:</strong> o fragmento é absorvido. A Essência está completa. Algo muda no
              personagem — uma sutileza que os outros percebem antes que ele mesmo perceba. Ele escolhe um{' '}
              <strong>Dom do Vazio</strong>.
            </P>
            <P>
              <strong>Se perder:</strong> ele acorda exausto, com 1 Coração restante, sem o fragmento. O
              fragmento ainda existe em algum lugar do mundo — pode ser encontrado novamente. Mas a Sombra
              foi acordada. Da próxima vez, o GM pode tornar o combate ligeiramente mais duro, como se ela
              tivesse estudado seus erros.
            </P>

            <SubTitle>Os Dons do Vazio</SubTitle>
            <P>
              Ao despertar, o personagem não recebe poder do Vazio — ele <em>concorda</em> com o Vazio. Cada
              Dom é permanente e tem um custo que o jogo não explica diretamente, mas que o GM pode explorar
              narrativamente.
            </P>

            <GiftCard title="Forma do Abismo" italic="O Vazio lembrou que você é feito dele. Por um instante, você pode deixar o mundo passar por você.">
              Uma vez por cena, você pode se tornar intangível por um instante — negando automaticamente um
              ataque que já acertou você. Isso não é esquiva. Você simplesmente não estava completamente lá
              quando o golpe chegou.
            </GiftCard>
            <GiftCard title="Voz do Silêncio" italic="O Vazio sempre teve muito a dizer. Apenas poucos aprenderam a ouvir — e a responder.">
              Em lugares onde o Vazio é denso, você pode escutar o que o silêncio está dizendo: o GM fornece
              uma informação verdadeira por cena nesses ambientes. Durante um Foco, você também pode se
              comunicar telepaticamente com qualquer aliado que também esteja em Foco.
            </GiftCard>
            <GiftCard title="Eco do Que Ficou" italic="A Sombra que você derrotou não foi destruída. Foi convencida a trocar de lado — temporariamente.">
              Quando você morreria, você não morre: permanece em Porta da Morte com 1 Coração, e a Sombra
              emerge brevemente, executando um ataque comum contra o inimigo mais próximo que causou seu
              quase-morte. Uma vez por sessão.
            </GiftCard>
            <GiftCard title="Gravidade do Vazio" italic="Sua presença no mundo ficou mais pesada do que deveria. Coisas são atraídas para você — especialmente perigo.">
              Em combate, criaturas que teriam como alvo preferencial outro personagem precisam vencer um
              teste de Saber contra você antes de ignorá-lo.
            </GiftCard>
            <GiftCard title="Marca Inapagável" italic="O Vazio marca o que é seu. Você aprendeu a fazer o mesmo.">
              Ao tocar qualquer superfície com intenção, você pode deixar uma Marca do Vazio — duradoura,
              visível apenas para outros Filhos do Vazio. Você sente a localização de cada Marca que já
              criou, como um senso de direção constante.
            </GiftCard>
            <GiftCard title="Essência Expandida" italic="O Vazio dentro de você ficou maior do que cabia. Você aprendeu a conviver com isso.">
              Ganhe +2 espaços permanentes de Essência. Você pode absorver mais fragmentos do que sua
              natureza deveria permitir.
            </GiftCard>

            {/* ─── 10. Mestre ────────────────────────── */}
            <SectionTitle id="mestre">10. O Papel do Mestre</SectionTitle>
            <P>
              O Mestre não está contra os jogadores. Ele está lá para criar uma história emocionante e
              desafiadora — e para lembrar que o mundo de Kishar não se importa com a sobrevivência de
              ninguém em particular.
            </P>
            <SubTitle>O GM decide:</SubTitle>
            <Ul>
              <Li>A dificuldade dos testes (quantos sucessos são necessários).</Li>
              <Li>Os efeitos exatos das Costas de Vaskrin -4, dentro do espírito da regra.</Li>
              <Li>Como a Sombra luta durante o Despertar — ela conhece o personagem. O GM também deve conhecer.</Li>
              <Li>O que acontece quando algo que deveria ser impossível é tentado.</Li>
            </Ul>
            <SubTitle>O GM não decide:</SubTitle>
            <Ul>
              <Li>O que os personagens fazem. Nunca.</Li>
            </Ul>

            {/* ─── 11. Dicas ──────────────────────────── */}
            <SectionTitle id="dicas">11. Dicas para Iniciantes</SectionTitle>
            <Ul>
              <Li><strong>Comece simples.</strong> Testes, combate, dano. As camadas mais profundas aparecem sozinhas com o tempo.</Li>
              <Li><strong>Role com confiança.</strong> Resultados ruins geram os melhores momentos. Uma Costas de Vaskrin que destrói um plano cuidadoso vale dez vitórias tranquilas.</Li>
              <Li><strong>Use os traços de personalidade.</strong> Eles não são apenas bônus — são a razão do seu personagem estar aqui.</Li>
              <Li><strong>Coma.</strong> Personagens que ignoram Sustento ficam mais fracos. O mundo de Kishar já é difícil o suficiente sem fazer isso por escolha.</Li>
              <Li><strong>Guarde a Inspiração.</strong> O Sorriso +1 é mais poderoso do que parece. Aquela rerolagem vai aparecer na hora certa.</Li>
              <Li><strong>Não tente enfrentar a Sombra sem estar pronto.</strong> Você vai saber quando está pronto. Talvez.</Li>
            </Ul>

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
