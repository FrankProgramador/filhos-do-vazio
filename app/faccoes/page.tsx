import type { Metadata } from 'next'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'

export const metadata: Metadata = {
  title: 'Facções – Filhos do Vazio',
  description:
    'Seis forças disputam o futuro de Kishar nas sombras — aliadas, inimigas, ou algo entre os dois.',
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
    id: 'conselho-das-carapacas',
    nome: 'O Conselho das Carapaças',
    lema: '"Paralisia elegante — muito protocolo, pouca ação."',
    icon: '🏛️',
    altImagem: 'Cinco conselheiros reunidos em uma câmara de pedra na Coroa de Kishar',
    ideologia: 'O governo atual de Kishar. Cinco conselheiros escolhidos por processos que cada facção interpreta diferente, reunidos para governar por consenso um reino que precisa desesperadamente de decisões rápidas.',
    lider: 'Cinco conselheiros — nenhum com poder de decidir sozinho, e é exatamente esse o problema.',
    relacao: 'Não são vilões. São insetos administrando uma herança que ninguém pediu, enquanto a situação piora lentamente.',
    relacaoTipo: 'neutra',
    gancho: 'Algo está errado em Kishar há sete estações. O Conselho está ocupado demais debatendo impostos de exportação para perceber.',
  },
  {
    id: 'casca-ferro',
    nome: 'Os Casca-Ferro',
    lema: '"O que não quebra, endurece. O que endurece, sobrevive."',
    icon: '🪖',
    altImagem: 'Guerreiros Casca-Ferro em formação, vendo Kishar como um ancestral de batalha',
    ideologia: 'Guerreiros que veem Kishar como um ancestral de batalha — uma criatura que lutou, sobreviveu e deixou sua armadura para que outros pudessem usá-la. A facção militar mais organizada do reino, com código de honra próprio e tolerância baixa para misticismo.',
    lider: 'Sem líder único — hierarquia clara, mas dividida internamente.',
    relacao: 'Tolerância muito baixa para qualquer coisa que cheire a culto, o que os coloca em conflito constante com os Vermes.',
    relacaoTipo: 'aliada',
    gancho: 'Há uma disputa crescente entre os Casca-Ferro tradicionais, que acreditam que sua função é proteger o reino, e uma facção mais jovem que acredita que sua função é controlá-lo.',
  },
  {
    id: 'perfuradores',
    nome: 'Os Perfuradores',
    lema: '"Kishar é recurso — respeitado como se respeita uma mina."',
    icon: '⛏️',
    altImagem: 'Perfuradores trabalhando nos túneis profundos de Kishar, extraindo resina e minerais',
    ideologia: 'Pragmáticos. As resinas dos túneis e os minerais da carapaça têm valor. Respeitam a criatura com cuidado, eficiência e sem sentimentalismo — e passam mais tempo nos túneis do que qualquer outra facção.',
    lider: 'Sem liderança centralizada conhecida fora dos contratos que assinam.',
    relacao: 'São os mais informados sobre o que acontece nos túneis — e os mais motivados a não compartilhar essa informação.',
    relacaoTipo: 'ambigua',
    gancho: 'Os Perfuradores assinaram contratos com o Conselho que incluem cláusulas sobre o que pode ser reportado. Os Casca-Ferro sabem que essas cláusulas existem. Não sabem o que está sendo não-reportado.',
  },
  {
    id: 'vermes',
    nome: 'Os Vermes',
    lema: '"Testemunhas, não cultistas."',
    icon: '🪱',
    altImagem: 'Vermes descendo em ritual aos túneis mais profundos de Kishar',
    ideologia: 'A Coroa os chama de cultistas. Eles se chamam de testemunhas. Acreditam que Kishar está dormindo — não morto, não inerte, mas em repouso tão profundo que os insetos da superfície confundem com morte.',
    lider: 'Nenhuma hierarquia declarada.',
    relacao: 'Não são pacíficos, mas também não são violentos por princípio. São inconvenientes — talvez a coisa mais perigosa que se pode ser num reino que precisa que todos fingam que está tudo bem.',
    relacaoTipo: 'ambigua',
    gancho: 'Os Vermes descem aos túneis em rituais que a Coroa classifica como ilegais. Alguns voltam. Os que voltam raramente explicam o que encontraram — dizem que não há palavras adequadas ainda.',
  },
  {
    id: 'guarda-silenciosa',
    nome: 'A Guarda Silenciosa',
    lema: '"Cobramos por tarefa, não por hora. E falamos só quando necessário."',
    icon: '🛡️',
    altImagem: 'Mantis da Guarda Silenciosa patrulhando o Mercado de Areia',
    ideologia: 'Mantis contratados que operam como força de segurança neutra no Mercado de Areia e em qualquer lugar onde haja dinheiro suficiente. Sua neutralidade é real, não performance — sem afiliação política, sem agenda oculta.',
    lider: 'Liderança interna anônima, fora do alcance público.',
    relacao: 'Um dos elementos mais estáveis do reino, justamente por não se importar com quem governa.',
    relacaoTipo: 'neutra',
    gancho: 'Há uma lista — não de contratos, de nomes — mantida pela liderança interna, de insetos que nunca deverão ser protegidos, independente de pagamento. Ninguém fora da organização sabe quem está nela.',
  },
  {
    id: 'filhos-do-vazio',
    nome: 'Os Filhos do Vazio',
    lema: '"O nome não foi escolhido por eles. Foi dado. Mas ficou."',
    icon: '🌌',
    altImagem: 'Silhuetas de insetos marcados pela essência do Vazio, sem bandeira ou território comum',
    ideologia: 'Não são uma facção no sentido convencional. Não têm liderança declarada, território fixo, ou agenda política. São insetos que carregam, em graus variados, a essência do Vazio — por nascimento, exposição às profundezas, contato com fragmentos corrompidos, ou razões que nem eles conseguem explicar.',
    lider: 'Nenhuma — cada um carrega o Vazio à sua própria maneira.',
    relacao: 'O que os une é a sensação compartilhada de que o mundo está prestes a mudar de forma irreversível — e que eles estarão no centro disso.',
    relacaoTipo: 'ambigua',
    gancho: 'Alguns querem evitar a mudança que sentem chegando. Alguns querem acelerá-la. A maioria ainda está tentando entender o que exatamente está sentindo.',
  },
]

/* ── Estilos de relação ────────────────────────────────── */

const relacaoConfig: Record<Relacao, { label: string; color: string; border: string; bg: string }> = {
  aliada: { label: 'Potencial Aliada', color: 'rgba(var(--success-rgb),0.9)', border: 'rgba(var(--success-rgb),0.35)', bg: 'rgba(var(--success-rgb),0.08)' },
  neutra: { label: 'Neutra', color: 'rgba(var(--text-muted-rgb),0.9)', border: 'rgba(var(--text-muted-rgb),0.35)', bg: 'rgba(var(--text-muted-rgb),0.08)' },
  ambigua: { label: 'Ambígua', color: 'rgba(var(--void-light-rgb),0.9)', border: 'rgba(var(--void-light-rgb),0.35)', bg: 'rgba(var(--void-light-rgb),0.08)' },
  perigosa: { label: 'Perigosa', color: 'rgba(var(--error-rgb),0.9)', border: 'rgba(var(--error-rgb),0.35)', bg: 'rgba(var(--error-rgb),0.08)' },
}

/* ── Componentes ────────────────────────────────────────── */

const OrnamentDivider = () => (
  <div className="flex items-center gap-4" aria-hidden>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to right, transparent, var(--gold))' }} />
    <span style={{ color: 'var(--gold)', fontSize: '0.95rem', opacity: 0.85, textShadow: '0 0 10px rgba(var(--gold-rgb),0.7)' }}>◈</span>
    <div style={{ width: 44, height: 1, background: 'linear-gradient(to left, transparent, var(--gold))' }} />
  </div>
)

function FaccaoCard({ faccao }: { faccao: Faccao }) {
  const rel = relacaoConfig[faccao.relacaoTipo]

  return (
    <article className="flex flex-col rounded-xl overflow-hidden group transition-all duration-200" style={{ background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.12)' }}>
      <div className="h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, transparent, ${rel.color}, transparent)` }} aria-hidden />

      <div className="relative flex flex-col items-center justify-center gap-3 shrink-0" role="img" aria-label={faccao.altImagem} style={{ aspectRatio: '21 / 9', background: 'linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg) 100%)', borderBottom: '1px solid rgba(var(--gold-rgb),0.1)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${rel.bg.replace('0.08', '0.12')} 0%, transparent 70%)` }} aria-hidden />
        <span style={{ fontSize: '2.6rem', position: 'relative', zIndex: 1 }} aria-hidden>{faccao.icon}</span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
          Arte conceitual em breve
        </span>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-start justify-between gap-3">
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em', lineHeight: 1.3 }}>
            {faccao.nome}
          </h2>
          <span className="shrink-0 ddb-badge ddb-badge-dim mt-0.5" aria-label="Atualização em breve">Em Breve</span>
        </div>

        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.6)', fontSize: '0.88rem', lineHeight: 1.6, borderLeft: `2px solid ${rel.border}`, paddingLeft: '0.85rem' }}>
          {faccao.lema}
        </p>

        <div className="flex gap-3">
          <span className="shrink-0" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-light)', paddingTop: '0.1rem', minWidth: '4.5rem' }}>
            Ideologia
          </span>
          <span style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.87rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.7 }}>
            {faccao.ideologia}
          </span>
        </div>

        <div className="flex gap-3">
          <span className="shrink-0" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-light)', paddingTop: '0.1rem', minWidth: '4.5rem' }}>
            Liderança
          </span>
          <span style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.87rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.7 }}>
            {faccao.lider}
          </span>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-4" style={{ borderTop: '1px solid rgba(var(--gold-rgb),0.08)' }}>
          <div className="flex items-center gap-2.5">
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Relação
            </span>
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rel.color, border: `1px solid ${rel.border}`, background: rel.bg, padding: '0.2rem 0.6rem', borderRadius: 20 }}>
              {rel.label}
            </span>
          </div>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.45)', lineHeight: 1.5 }}>
            {faccao.relacao}
          </p>

          <div className="flex items-end justify-between gap-4 pt-1">
            <div>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, marginBottom: '0.25rem' }}>
                Gancho
              </p>
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.45)', lineHeight: 1.5 }}>
                {faccao.gancho}
              </p>
            </div>
            <span
              className="shrink-0 hk-btn"
              style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', borderRadius: 6, background: 'rgba(var(--text-muted-rgb),0.06)', borderColor: 'rgba(var(--text-muted-rgb),0.2)', color: 'rgba(var(--text-muted-rgb),0.35)', cursor: 'not-allowed', pointerEvents: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
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
    <ContentShell title="Facções">

      <section className="relative flex flex-col items-center text-center" aria-label="Cabeçalho da página">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gold-rgb),0.07) 0%, transparent 70%)' }} aria-hidden />

        <div className="relative flex flex-col items-center gap-4 px-6 pt-14 pb-12">
          <nav className="flex items-center gap-2" aria-label="Navegação estrutural" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">← Início</Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Facções</span>
          </nav>

          <OrnamentDivider />

          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Poderes que movem Kishar
          </p>

          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text)' }}>
            Facções
          </h1>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.85, maxWidth: 480 }}>
            Seis forças disputam o futuro do reino nas sombras.<br />
            Cada aliança tem seu preço — cada traição, suas consequências.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {(Object.entries(relacaoConfig) as [Relacao, typeof relacaoConfig[Relacao]][]).map(([, cfg]) => (
              <span key={cfg.label} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.52rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color, border: `1px solid ${cfg.border}`, background: cfg.bg, padding: '0.2rem 0.65rem', borderRadius: 20 }}>
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full divider-gold" aria-hidden />
      </section>

      <main className="flex-1 mx-auto w-full px-4 sm:px-6 py-16" style={{ maxWidth: 1200, background: 'var(--bg-secondary)' }}>
        <div className="flex flex-col items-center gap-3 mb-12">
          <p className="hk-divider" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.35em' }}>
            Seis Facções
          </p>
          <h2 className="section-heading-glow" style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
            As Forças de Kishar
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(var(--text-rgb),0.5)', fontSize: '0.92rem', maxWidth: 520, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
            Aliadas, inimigas ou algo entre os dois — nenhuma facção é simples o suficiente para um único rótulo.
          </p>
        </div>

        <div className="content-grid">
          {faccoes.map((faccao) => <FaccaoCard key={faccao.id} faccao={faccao} />)}
        </div>
      </main>
    </ContentShell>
  )
}
