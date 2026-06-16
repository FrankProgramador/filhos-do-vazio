import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import TableOfContents from './TableOfContents'

export const metadata: Metadata = {
  title: 'Como Jogar – Filhos do Vazio',
  description:
    'Compilação completa do sistema de Filhos do Vazio: atributos, combate, progressão, fragmentos do Vazio e todas as mecânicas do jogo.',
}

const sections = [
  { id: 'introducao',          label: '1. Introdução' },
  { id: 'rolagem',             label: '2. Rolagem de Dados' },
  { id: 'atributos',           label: '3. Atributos e Barras' },
  { id: 'criacao',             label: '4. Criação de Personagem' },
  { id: 'fragmentos',          label: '5. Fragmentos do Vazio' },
  { id: 'combate',             label: '6. Combate' },
  { id: 'alma',                label: '7. Alma e Recuperação' },
  { id: 'progressao',          label: '8. Progressão' },
  { id: 'ferimentos',          label: '9. Ferimentos Permanentes' },
  { id: 'marcas',              label: '10. Marcas do Vazio' },
  { id: 'grid',                label: '11. Grid e Movimento' },
  { id: 'equipamento',         label: '12. Equipamento' },
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
        color: 'var(--hk-gold)',
        textShadow: '0 0 18px rgba(212,168,67,0.35)',
        marginBottom: '1rem',
        marginTop: '2.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(212,168,67,0.18)',
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
        color: 'var(--hk-soul-pale)',
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
    <p style={{ color: 'var(--hk-pale)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
      {children}
    </p>
  )
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        listStyleType: 'none',
        paddingLeft: '1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
      }}
    >
      {children}
    </ul>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        color: 'var(--hk-pale)',
        lineHeight: 1.7,
        paddingLeft: '0.75rem',
        borderLeft: '2px solid rgba(74,158,255,0.25)',
      }}
    >
      {children}
    </li>
  )
}

/* An image placeholder slot.
   Replace src="" and remove the placeholder overlay once real art is available. */
function ImageSlot({ alt, caption }: { alt: string; caption?: string }) {
  return (
    <figure
      style={{
        margin: '1.75rem 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(74,158,255,0.15)',
        background: 'rgba(15,18,34,0.7)',
      }}
    >
      <div
        role="img"
        aria-label={alt}
        style={{
          width: '100%',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          padding: '2rem 1.5rem',
          background:
            'repeating-linear-gradient(45deg, rgba(74,158,255,0.03) 0px, rgba(74,158,255,0.03) 1px, transparent 1px, transparent 12px)',
        }}
      >
        <span style={{ fontSize: '2rem', opacity: 0.35 }}>🖼️</span>
        <span
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--hk-soul)',
            opacity: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Imagem pendente
        </span>
        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--hk-dim)',
            textAlign: 'center',
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          {alt}
        </span>
      </div>
      {caption && (
        <figcaption
          style={{
            fontSize: '0.78rem',
            color: 'var(--hk-dim)',
            textAlign: 'center',
            padding: '0.5rem 1rem',
            borderTop: '1px solid rgba(74,158,255,0.08)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.88rem',
          color: 'var(--hk-pale)',
        }}
      >
        {children}
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: '0.5rem 0.75rem',
        textAlign: 'left',
        fontFamily: 'var(--font-cinzel)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        color: 'var(--hk-soul-pale)',
        background: 'rgba(74,158,255,0.06)',
        borderBottom: '1px solid rgba(74,158,255,0.2)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      style={{
        padding: '0.45rem 0.75rem',
        borderBottom: '1px solid rgba(74,158,255,0.07)',
        color: muted ? 'var(--hk-dim)' : 'var(--hk-pale)',
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  )
}

/* ── Page ─────────────────────────────────────────────── */

export default function ComoJogarPage() {
  return (
    <>
      <SiteHeader activePath="/como-jogar" />

      <main
        style={{ paddingTop: 44, minHeight: '100vh', background: 'var(--hk-void)' }}
      >
        {/* Hero */}
        <div
          style={{
            padding: '3.5rem 1.5rem 2.5rem',
            textAlign: 'center',
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74,158,255,0.07) 0%, transparent 70%)',
            borderBottom: '1px solid rgba(74,158,255,0.08)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              color: 'var(--hk-soul)',
              opacity: 0.7,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Compilação do Sistema
          </p>
          <h1
            className="soul-glow"
            style={{
              fontFamily: 'var(--font-cinzel-decorative)',
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              color: 'var(--hk-ghost)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Como Jogar
          </h1>
          <p
            style={{
              color: 'var(--hk-dim)',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.7,
              fontSize: '0.95rem',
            }}
          >
            Todas as regras, mecânicas e decisões de design de{' '}
            <em style={{ color: 'var(--hk-soul-pale)' }}>Filhos do Vazio</em> reunidas em um só lugar.
          </p>
        </div>

        {/* Layout: sidebar + content */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6"
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '2.5rem',
            alignItems: 'start',
            paddingTop: '2.5rem',
            paddingBottom: '4rem',
          }}
        >
          {/* ── Sidebar índice ─────────────────────────── */}
          <aside
            className="hidden lg:block"
            style={{
              position: 'sticky',
              top: 60,
              background: 'rgba(15,18,34,0.6)',
              border: '1px solid rgba(74,158,255,0.1)',
              borderRadius: 8,
              padding: '1.25rem 1rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                color: 'var(--hk-soul)',
                opacity: 0.6,
                textTransform: 'uppercase',
                marginBottom: '0.85rem',
              }}
            >
              Índice
            </p>
            <TableOfContents sections={sections} />
          </aside>

          {/* ── Main content ───────────────────────────── */}
          <article style={{ minWidth: 0 }}>

            {/* ─── 1. Introdução ─────────────────────── */}
            <SectionTitle id="introducao">1. Introdução</SectionTitle>

            <ImageSlot
              alt="Arte conceitual do reino de insetos: ruínas de uma civilização ancestral, tochas de alma azul iluminando corredores de pedra escura, com silhuetas de insetos ao fundo"
              caption="O reino decadente de Filhos do Vazio — fragmentos de poder ancestral aguardam quem ousar buscá-los."
            />

            <P>
              <em style={{ color: 'var(--hk-soul-pale)' }}>Filhos do Vazio</em> é um jogo sobre insetos
              em um reino decadente, onde fragmentos de poder ancestral estão espalhados pelo mundo. Você
              é um herdeiro do Vazio — e cada escolha define quem você se tornará.
            </P>
            <P>O sistema usa dados de seis faces (d6) e foca em:</P>
            <Ul>
              <Li>Rolagens rápidas com sucessos em 5 ou 6.</Li>
              <Li>Efeitos especiais para 6s e 1s (Brilho e Fratura do Vazio).</Li>
              <Li>Progressão por XP, marcos e Fragmentos do Vazio.</Li>
              <Li>Combate tático com Estamina, Casca e Ruptura.</Li>
            </Ul>

            {/* ─── 2. Rolagem ────────────────────────── */}
            <SectionTitle id="rolagem">2. Rolagem de Dados</SectionTitle>

            <SubTitle>Testes</SubTitle>
            <Ul>
              <Li>Role uma quantidade de d6 determinada pelo atributo + perícia.</Li>
              <Li>Cada 5 ou 6 é um sucesso.</Li>
              <Li>Sucessos determinam se a ação foi bem-sucedida e, em ataques, o dano.</Li>
            </Ul>

            <SubTitle>Brilho e Fratura do Vazio</SubTitle>
            <P>
              Após a rolagem, conte os 6s e os 1s. Subtraia 1s de 6s para obter o saldo.
            </P>

            <ImageSlot
              alt="Diagrama mostrando uma mão de inseto rolando dados d6, com destaque para os resultados 6 (brilho azul dourado) e 1 (fratura escura), ilustrando o sistema de saldo"
              caption="Saldo = total de 6s − total de 1s. Positivo gera Brilho; negativo gera Fratura."
            />

            <Table>
              <thead>
                <tr>
                  <Th>Saldo</Th>
                  <Th>Efeito (se sucesso)</Th>
                  <Th>Efeito (se falha)</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>+1</Td><Td>Favorável – recupera 1 Estamina</Td><Td muted>—</Td></tr>
                <tr><Td>+2</Td><Td>Sortudo – ignora 1 ponto de Casca</Td><Td muted>—</Td></tr>
                <tr><Td>+3</Td><Td>Crítico – dano máximo</Td><Td muted>—</Td></tr>
                <tr><Td>+4+</Td><Td>Lendário – dano dobrado</Td><Td muted>—</Td></tr>
                <tr><Td>-1</Td><Td muted>—</Td><Td>Infeliz – pequena complicação</Td></tr>
                <tr><Td>-2</Td><Td muted>—</Td><Td>Azarado – perde 1 Estamina</Td></tr>
                <tr><Td>-3</Td><Td muted>—</Td><Td>Trágico – consequência grave</Td></tr>
                <tr><Td>-4-</Td><Td muted>—</Td><Td>Catastrófico – erro desastroso</Td></tr>
              </tbody>
            </Table>

            {/* ─── 3. Atributos ──────────────────────── */}
            <SectionTitle id="atributos">3. Atributos e Barras</SectionTitle>

            <ImageSlot
              alt="Ficha de personagem estilizada com as quatro barras primárias (Poder, Graça, Casca, Saber) representadas por ícones: punho, asa, carapaça e olho brilhante"
              caption="Os quatro atributos primários e suas derivações na ficha de personagem."
            />

            <SubTitle>Primários (1 a 7)</SubTitle>
            <Ul>
              <Li><strong>Poder</strong> – força, ataques corpo a corpo, carga.</Li>
              <Li><strong>Graça</strong> – agilidade, ataques à distância, esquiva.</Li>
              <Li><strong>Casca</strong> – resistência fixa (reduz dano).</Li>
              <Li><strong>Saber</strong> – percepção, inteligência, magia.</Li>
            </Ul>

            <SubTitle>Secundários (derivados diretos)</SubTitle>
            <Ul>
              <Li>Carga = Poder</Li>
              <Li>Deslocamento = Graça</Li>
              <Li>Tamanho de Cinto = Casca</Li>
              <Li>Espaços de Técnica = Saber</Li>
            </Ul>

            <SubTitle>Barras</SubTitle>
            <Ul>
              <Li><strong>Coração</strong> – base por tamanho (Pequeno 6, Médio 7, Grande 8) + modificadores.</Li>
              <Li><strong>Alma</strong> – 3 + níveis em Trilhas Místicas.</Li>
              <Li><strong>Estamina</strong> – 3 + níveis em Trilhas Marciais.</Li>
              <Li><strong>Estoque</strong> – opcional, metade do Saber (arredondado para cima).</Li>
            </Ul>

            <SubTitle>Sustento (Fome simplificada)</SubTitle>
            <Ul>
              <Li>Base por tamanho: Pequeno 1, Médio 2, Grande 3.</Li>
              <Li>Cada traço Marcante +1, cada Raro +2.</Li>
              <Li>
                Ao descansar, consome rações igual ao Sustento. Se faltar, ganha níveis de Fome (máx 3):
                penalidades em testes físicos e recuperação.
              </Li>
            </Ul>

            {/* ─── 4. Criação ────────────────────────── */}
            <SectionTitle id="criacao">4. Criação de Personagem</SectionTitle>

            <ImageSlot
              alt="Linha do tempo visual dos 5 passos de criação de personagem: ícone de espécie (inseto), régua de tamanho, barras de atributo, lista de traços, e símbolo de trilha inicial"
              caption="Os cinco passos para criar seu Filho do Vazio."
            />

            <SubTitle>Passo 1: Espécie</SubTitle>
            <P>
              Escolha uma espécie pronta (Formiga, Besouro, Mariposa, Louva-a-deus, Vagalume, Aranha)
              ou crie uma Base Livre:
            </P>
            <Ul>
              <Li>Defina nome e tamanho padrão.</Li>
              <Li>Distribua 12 pontos entre Poder, Graça, Casca, Saber (mínimo 1, máximo 5).</Li>
              <Li>Distribua 2 pontos entre Assustador e Fofo.</Li>
              <Li>Escolha 3 traços inerentes (comuns, marcantes ou um raro).</Li>
              <Li>Ganhe +1 ponto de atributo extra por criar uma espécie original.</Li>
            </Ul>

            <SubTitle>Passo 2: Tamanho (opcional)</SubTitle>
            <P>
              Pode alterar o tamanho padrão da espécie. Isso afeta atributos e Sustento.
            </P>

            <SubTitle>Passo 3: Atributos</SubTitle>
            <Ul>
              <Li>Comece com os da espécie, aplique modificações de tamanho, distribua +2 pontos livremente.</Li>
              <Li>Calcule Coração, Alma, Estamina, Velocidade, etc.</Li>
            </Ul>

            <SubTitle>Passo 4: Traços Adicionais</SubTitle>
            <Ul>
              <Li>Comuns – até 7 extras.</Li>
              <Li>Marcantes – até 3 extras, cada um +1 Sustento.</Li>
              <Li>Raros – até 1 extra, cada um +2 Sustento.</Li>
              <Li>Traços inerentes da espécie não contam para esses limites.</Li>
            </Ul>

            <SubTitle>Passo 5: Trilha Inicial e Equipamento</SubTitle>
            <Ul>
              <Li>Nível 1 em uma Trilha (Marcial ou Mística).</Li>
              <Li>Uma arma simples (dano 2, Qualidade 1), um escudo ou ferramenta, 50 Geo, 2 rações.</Li>
            </Ul>

            {/* ─── 5. Fragmentos ─────────────────────── */}
            <SectionTitle id="fragmentos">5. Fragmentos do Vazio</SectionTitle>

            <P>
              Fragmentos são ecos de insetos antigos que transcendem a morte. Absorvê-los concede poder,
              mas ocupa espaços de Essência.
            </P>

            <ImageSlot
              alt="Quatro fragmentos flutuantes com brilho azul-escuro: uma máscara rachada (Coração), uma chama de alma (Alma), uma carapaça cristalizada (Casca) e um cristal multifacetado (Adaptação)"
              caption="Os quatro tipos de Fragmento do Vazio — cada um com custo crescente de Essência."
            />

            <SubTitle>Capacidade de Essência</SubTitle>
            <P>Saber + 1</P>

            <SubTitle>Tipos de Fragmento</SubTitle>
            <Table>
              <thead>
                <tr>
                  <Th>Fragmento</Th>
                  <Th>Efeito</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>Máscara</Td><Td>+1 Coração máximo</Td></tr>
                <tr><Td>Alma</Td><Td>+1 Alma máxima</Td></tr>
                <tr><Td>Casca</Td><Td>+1 Casca</Td></tr>
                <tr><Td>Adaptação</Td><Td>Concede um traço (Comum, Marcante ou Raro)</Td></tr>
              </tbody>
            </Table>

            <SubTitle>Saturação (custo exponencial)</SubTitle>
            <Table>
              <thead>
                <tr>
                  <Th>Quantos do mesmo tipo</Th>
                  <Th>Custo do próximo</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>1º</Td><Td>1 espaço</Td></tr>
                <tr><Td>2º</Td><Td>2 espaços</Td></tr>
                <tr><Td>3º</Td><Td>4 espaços</Td></tr>
                <tr><Td>4º</Td><Td>8 espaços</Td></tr>
              </tbody>
            </Table>
            <P>Exemplo: 3 Fragmentos de Casca ocupam 1+2+4 = 7 espaços.</P>

            <SubTitle>Limites</SubTitle>
            <Ul>
              <Li>Atributo máximo via fragmentos: +3 (ex: Casca 7 → 10).</Li>
              <Li>Não é possível ter mais de 3 fragmentos do mesmo tipo (custo 7 já é alto).</Li>
              <Li>Fragmentos de Adaptação seguem a mesma lógica: 1º = Comum, 2º = Marcante, 3º = Raro.</Li>
            </Ul>

            <SubTitle>Despertar do Filho do Vazio</SubTitle>
            <P>
              Ao preencher todos os espaços de Essência, o personagem desperta e ganha um Dom do Vazio.
            </P>

            <ImageSlot
              alt="Personagem inseto envolto em energia do Vazio — silhueta negra com fissuras de luz azul pulsando, representando o Despertar ao preencher todos os espaços de Essência"
              caption="O Despertar ocorre quando todos os espaços de Essência são preenchidos."
            />

            <Table>
              <thead>
                <tr>
                  <Th>Dom</Th>
                  <Th>Efeito</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>Afinidade com o Vazio</Td><Td>+1 em testes de Brilho do Vazio</Td></tr>
                <tr><Td>Resiliência do Vazio</Td><Td>Ignora 1 Fratura por cena</Td></tr>
                <tr><Td>Essência Expandida</Td><Td>+1 espaço de Essência</Td></tr>
                <tr><Td>Evolução Acelerada</Td><Td>+1 Traço Raro extra</Td></tr>
                <tr><Td>Marca do Vazio</Td><Td>Começa com 1 Marca</Td></tr>
                <tr><Td>Eco do Primeiro</Td><Td>Rerrola 1 teste por sessão</Td></tr>
              </tbody>
            </Table>

            {/* ─── 6. Combate ────────────────────────── */}
            <SectionTitle id="combate">6. Combate</SectionTitle>

            <ImageSlot
              alt="Vista de cima de um grid tático: insetos em miniatura posicionados em um corredor de pedra com quadriculado, setas indicando movimento e linhas de ataque"
              caption="O combate acontece em grid tático — posicionamento e Estamina são recursos fundamentais."
            />

            <SubTitle>Iniciativa</SubTitle>
            <P>Teste de Graça (soma dos dados, não sucessos). Maior valor age primeiro.</P>

            <SubTitle>Ataque</SubTitle>
            <Ul>
              <Li>Gaste pelo menos 1 Estamina.</Li>
              <Li>Corpo a corpo: Poder + Qualidade da arma + Estamina dedicada.</Li>
              <Li>Distância: Graça + Qualidade da arma + Estamina dedicada.</Li>
              <Li>1 sucesso = acerto. Sucessos extras = excesso (+1 de dano cada, limitado pelo dano base da arma).</Li>
            </Ul>

            <SubTitle>Dano</SubTitle>
            <Ul>
              <Li>Dano bruto = base + excesso.</Li>
              <Li>Subtraia a Casca do alvo (redução fixa).</Li>
              <Li>Dano mínimo final = 1.</Li>
              <Li>Brilho do Vazio pode adicionar bônus (ignorar Casca, dano máximo, etc.).</Li>
            </Ul>

            <SubTitle>Defesa (Reação)</SubTitle>
            <Ul>
              <Li>Gaste 1 Estamina para aparar (Poder + escudo/arma) ou esquivar (Graça).</Li>
              <Li>Cada sucesso anula um sucesso do ataque.</Li>
              <Li>Pode anular completamente o ataque (dano zero).</Li>
            </Ul>

            <SubTitle>Ruptura</SubTitle>
            <P>
              Sempre que sofrer dano igual ou superior à sua Casca em um único golpe, ganha 1 ponto de
              Ruptura (máx 3).
            </P>
            <Ul>
              <Li>
                Ao atingir 3, fica Atordoado: perde reação, ataques contra ele ignoram 1 Casca até o
                próximo turno.
              </Li>
              <Li>Ruptura volta a 0 no início do seu próximo turno.</Li>
            </Ul>

            <SubTitle>Taxa de Estamina</SubTitle>
            <P>
              Cada ataque adicional no mesmo turno custa +1 Estamina cumulativa (reset no próximo turno).
            </P>

            <SubTitle>Movimento</SubTitle>
            <Ul>
              <Li>Velocidade = quadrados por turno.</Li>
              <Li>Deslocamento = Graça (movimento sem provocar ataques de oportunidade).</Li>
              <Li>Avanço/Pulo – 1 Estamina para mover até 2 quadrados.</Li>
              <Li>Golpe Saltitante – passar sobre um alvo e acertá-lo permite movimento extra.</Li>
            </Ul>

            {/* ─── 7. Alma ───────────────────────────── */}
            <SectionTitle id="alma">7. Alma e Recuperação</SectionTitle>

            <ImageSlot
              alt="Inseto meditando em posição de foco, com partículas de alma azul fluindo dos inimigos ao redor em direção ao personagem — representando a coleta de Alma ao causar dano"
              caption="A Alma é coletada ao causar dano — e pode ser usada para curar, preparar ou lançar feitiços."
            />

            <SubTitle>Coleta de Alma</SubTitle>
            <Ul>
              <Li>Causar dano a um inimigo gera Alma igual ao dano causado (após redução de Casca).</Li>
              <Li>Máximo por ataque = Saber.</Li>
            </Ul>

            <SubTitle>Foco</SubTitle>
            <P>Ação de turno completo. Efeito no início do próximo turno.</P>
            <Ul>
              <Li><strong>Foco de Alma</strong> – cura.</Li>
              <Li><strong>Foco de Arte</strong> – preparar.</Li>
              <Li><strong>Foco de Feitiço</strong> – reduzir custo.</Li>
              <Li><strong>Foco de Estoque</strong> – recuperar Estoque.</Li>
            </Ul>

            {/* ─── 8. Progressão ─────────────────────── */}
            <SectionTitle id="progressao">8. Progressão</SectionTitle>

            <SubTitle>Experiência (XP)</SubTitle>
            <P>Ganha por combate, exploração, interações, objetivos e momentos memoráveis.</P>

            <Table>
              <thead>
                <tr>
                  <Th>Patamar</Th>
                  <Th>XP necessário</Th>
                  <Th>Recompensa</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>2</Td><Td>8 XP</Td><Td>1 Melhoria Menor</Td></tr>
                <tr><Td>3</Td><Td>16 XP</Td><Td>1 nível em Trilha</Td></tr>
                <tr><Td>4</Td><Td>25 XP</Td><Td>1 Melhoria Menor</Td></tr>
                <tr><Td>5+</Td><Td muted>+10 XP por patamar</Td><Td muted>alternando</Td></tr>
              </tbody>
            </Table>

            <SubTitle>Marcos (narrativos)</SubTitle>
            <Ul>
              <Li>Marco par (2º, 4º…) → +1 nível em Trilha.</Li>
              <Li>Marco ímpar (1º, 3º…) → +1 Melhoria Menor.</Li>
            </Ul>

            <SubTitle>Melhorias Menores</SubTitle>
            <Ul>
              <Li>Aumentar atributo em 1 (máx 7).</Li>
              <Li>Aumentar Velocidade, Carga, Cinto, Espaços de Técnica.</Li>
              <Li>Adquirir traço Comum/Marcante (se tiver slot).</Li>
              <Li>Aumentar Qualidade de arma natural ou escudo.</Li>
              <Li>Adicionar modificador a arma natural.</Li>
            </Ul>

            {/* ─── 9. Ferimentos ─────────────────────── */}
            <SectionTitle id="ferimentos">9. Ferimentos Permanentes</SectionTitle>

            <P>Ao entrar em Porta da Morte, role 1d6:</P>

            <Table>
              <thead>
                <tr>
                  <Th>1d6</Th>
                  <Th>Efeito</Th>
                  <Th>Duração</Th>
                </tr>
              </thead>
              <tbody>
                <tr><Td>1</Td><Td>Cicatriz Profunda – –1 permanente em um atributo</Td><Td>Permanente</Td></tr>
                <tr><Td>2</Td><Td>Casca Rachada – –1 Casca até 4 descansos</Td><Td>Longa</Td></tr>
                <tr><Td>3</Td><Td>Dor Persistente – –1 Estamina máxima até descanso</Td><Td>Curta</Td></tr>
                <tr><Td>4</Td><Td>Memória Turva – –1 Saber até descanso</Td><Td>Curta</Td></tr>
                <tr><Td>5</Td><Td>Cicatriz Visível – –1 Fofo até ser curada</Td><Td>Temporária</Td></tr>
                <tr><Td>6</Td><Td>Nada</Td><Td>—</Td></tr>
              </tbody>
            </Table>

            <ImageSlot
              alt="Inseto ferido apoiado em sua arma, com rachaduras visíveis na carapaça e uma cicatriz luminosa atravessando o torso — representando as sequelas da Porta da Morte"
              caption="A Porta da Morte deixa marcas. Cada cicatriz conta uma história."
            />

            {/* ─── 10. Marcas ────────────────────────── */}
            <SectionTitle id="marcas">10. Marcas do Vazio</SectionTitle>

            <P>
              Ganha 1 Marca ao obter saldo +3 ou mais ou –3 ou menos. Máximo 3 Marcas.
            </P>
            <Ul>
              <Li>Gastar 1 → +1 sucesso após rolagem.</Li>
              <Li>Gastar 2 → agir fora da iniciativa.</Li>
              <Li>Gastar 3 → sobreviver à Porta da Morte (uma vez por descanso).</Li>
            </Ul>

            <ImageSlot
              alt="Três símbolos circulares com o motivo do Vazio gravados em pedra — representando as três Marcas disponíveis; o símbolo central brilha intensamente em azul-escuro"
              caption="As Marcas do Vazio são poder acumulado — use-as com sabedoria."
            />

            {/* ─── 11. Grid ──────────────────────────── */}
            <SectionTitle id="grid">11. Grid e Movimento</SectionTitle>

            <ImageSlot
              alt="Diagrama de grid com três silhuetas de tamanhos diferentes: inseto pequeno (1×1), inseto médio (1×1) e inseto grande (2×2), com indicação de passagem em corredores de 1 e 2 quadrados"
              caption="Ocupação no grid por tamanho — e regras de passagem em corredores."
            />

            <SubTitle>Ocupação</SubTitle>
            <Ul>
              <Li>Pequeno: 1×1</Li>
              <Li>Médio: 1×1</Li>
              <Li>Grande: 2×2</Li>
            </Ul>

            <SubTitle>Passagem em corredores</SubTitle>
            <Ul>
              <Li>
                <strong>1 quadrado</strong>: Pequeno passa livre; Médio com penalidade (–2 ataque/defesa,
                Velocidade -1); Grande não passa.
              </Li>
              <Li>
                <strong>2 quadrados</strong>: todos passam livremente.
              </Li>
            </Ul>

            {/* ─── 12. Equipamento ───────────────────── */}
            <SectionTitle id="equipamento">12. Equipamento (Resumo)</SectionTitle>

            <Ul>
              <Li><strong>Armas</strong>: dano base, Qualidade, Peso. Armas pesadas (Peso 2+) causam Desequilíbrio.</Li>
              <Li><strong>Escudos</strong>: Qualidade, Peso, bônus de aparar.</Li>
              <Li><strong>Armaduras</strong>: RD fixa, Durabilidade, Peso.</Li>
              <Li><strong>Ferramentas</strong>: Qualidade para testes de perícia.</Li>
              <Li><strong>Frascos, Venenos, Armadilhas</strong>: efeitos variados, custo em Estoque ou Geo.</Li>
            </Ul>

            <ImageSlot
              alt="Mesa de armeiro com itens dispostos: lança fina (arma leve), escudo de carapaça, frasco de cura com brilho azul, veneno em conta-gotas e uma armadilha de mandíbula — estilo inventário de RPG"
              caption="O equipamento define seu estilo de jogo — de frascos curativos a armadilhas mortais."
            />

            {/* ─── Rodapé do artigo ──────────────────── */}
            <div
              style={{
                marginTop: '3rem',
                padding: '1.25rem 1.5rem',
                background: 'rgba(74,158,255,0.04)',
                border: '1px solid rgba(74,158,255,0.12)',
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  color: 'var(--hk-soul)',
                  marginBottom: '0.4rem',
                }}
              >
                Sistema em desenvolvimento
              </p>
              <p style={{ color: 'var(--hk-dim)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                Esta compilação reúne todas as mecânicas principais. O sistema está pronto para ser
                testado e refinado. Regras podem mudar entre sessões.
              </p>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
