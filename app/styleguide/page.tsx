import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Style Guide – Filhos do Vazio',
  robots: { index: false, follow: false },
}

/* Página interna de referência visual — não aparece no menu.
   Usada para testar novos componentes contra a paleta atual. */

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-full rounded-md"
        style={{ height: 56, background: `var(${varName})`, border: '1px solid rgba(var(--border-rgb),0.6)' }}
      />
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', color: 'var(--text)' }}>{name}</span>
      <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{varName}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 py-10" style={{ borderBottom: '1px solid rgba(var(--border-rgb),0.6)' }}>
      <h2
        style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function StyleGuidePage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader />

      <main
        className="flex-1 mx-auto w-full px-6"
        style={{ maxWidth: 1100, paddingTop: 84, paddingBottom: 64 }}
      >
        <h1
          className="gold-glow"
          style={{
            fontFamily: 'var(--font-cinzel-decorative)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: '0.5rem',
          }}
        >
          Style Guide
        </h1>
        <p style={{ color: 'rgba(var(--text-rgb),0.6)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', maxWidth: 560 }}>
          Referência viva da paleta e dos componentes compartilhados (app/globals.css). Página interna — sem link no menu.
        </p>

        {/* ── Paleta ──────────────────────────────────── */}
        <Section title="Paleta — Neutros">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            <Swatch name="Fundo principal" varName="--bg" />
            <Swatch name="Fundo secundário" varName="--bg-secondary" />
            <Swatch name="Card" varName="--card" />
            <Swatch name="Borda" varName="--border" />
            <Swatch name="Separador" varName="--divider" />
            <Swatch name="Texto principal" varName="--text" />
            <Swatch name="Texto secundário" varName="--text-muted" />
          </div>
        </Section>

        <Section title="Paleta — Ouro (identidade primária)">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            <Swatch name="Ouro velho" varName="--gold-dark" />
            <Swatch name="Ouro antigo" varName="--gold" />
            <Swatch name="Ouro real" varName="--gold-light" />
            <Swatch name="Ouro luminoso" varName="--gold-bright" />
          </div>
        </Section>

        <Section title="Paleta — Vazio (acento temático secundário)">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            <Swatch name="Roxo abissal" varName="--void-dark" />
            <Swatch name="Roxo profundo" varName="--void" />
            <Swatch name="Ametista" varName="--void-light" />
            <Swatch name="Lilás fantasma" varName="--void-glow" />
          </div>
        </Section>

        <Section title="Paleta — Luz (acento temático)">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            <Swatch name="Ouro claro" varName="--luz-dim" />
            <Swatch name="Ouro solar" varName="--luz" />
            <Swatch name="Marfim luminoso" varName="--luz-bright" />
            <Swatch name="Branco dourado" varName="--luz-glow" />
          </div>
        </Section>

        <Section title="Paleta — Estados">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            <Swatch name="Sucesso" varName="--success" />
            <Swatch name="Aviso" varName="--warning" />
            <Swatch name="Erro" varName="--error" />
            <Swatch name="Informação" varName="--info" />
          </div>
        </Section>

        {/* ── Tipografia / glows ──────────────────────── */}
        <Section title="Glows de texto">
          <div className="flex flex-wrap gap-8">
            <span className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>.gold-glow</span>
            <span className="void-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>.void-glow</span>
            <span className="section-heading-glow" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: 'var(--text)' }}>.section-heading-glow</span>
          </div>
        </Section>

        {/* ── Botões ──────────────────────────────────── */}
        <Section title="Botões">
          <div className="flex flex-wrap items-center gap-4">
            <button className="hk-btn hk-btn-soul px-5 py-2 rounded-md">.hk-btn-soul (primário)</button>
            <button className="hk-btn hk-btn-gold px-5 py-2 rounded-md">.hk-btn-gold (ênfase)</button>
            <button className="hk-btn hk-btn-void px-5 py-2 rounded-md">.hk-btn-void (vazio)</button>
            <button className="btn-hero">✦ .btn-hero (CTA)</button>
          </div>
        </Section>

        {/* ── Badges ──────────────────────────────────── */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <span className="badge badge--gold">.badge--gold</span>
            <span className="badge badge--void">.badge--void</span>
            <span className="badge badge--success">.badge--success</span>
            <span className="badge badge--error">.badge--error</span>
            <span className="badge badge--dim">.badge--dim</span>
            <span className="ddb-badge ddb-badge-soul">.ddb-badge-soul</span>
            <span className="ddb-badge ddb-badge-gold">.ddb-badge-gold</span>
            <span className="ddb-badge ddb-badge-dim">.ddb-badge-dim</span>
          </div>
        </Section>

        {/* ── Alerts ──────────────────────────────────── */}
        <Section title="Alertas">
          <div className="flex flex-col gap-3" style={{ maxWidth: 480 }}>
            <div className="alert alert--error">Limite de traços alcançado.</div>
            <div className="alert alert--warning">Esta seção ainda não foi implementada.</div>
          </div>
        </Section>

        {/* ── Cards ───────────────────────────────────── */}
        <Section title="Cards de seleção">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            <div className="card p-4 rounded-lg" style={{ background: 'var(--card)' }}>
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem' }}>.card</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>não selecionado</p>
            </div>
            <div className="card card--selected p-4 rounded-lg" style={{ background: 'var(--card)' }}>
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem' }}>.card--selected</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>marcial / ouro</p>
            </div>
            <div className="card card--selected card--void p-4 rounded-lg" style={{ background: 'var(--card)' }}>
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem' }}>.card--selected.card--void</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>místico / vazio</p>
            </div>
            <div className="card card--disabled p-4 rounded-lg" style={{ background: 'var(--card)' }}>
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem' }}>.card--disabled</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>indisponível</p>
            </div>
          </div>
        </Section>

        <Section title="Cards — variantes de página">
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            <div className="lnd-card p-4">
              <div className="lnd-card-img">preview</div>
              <p style={{ color: 'var(--text)', padding: '0.75rem 1rem 1rem', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>.lnd-card</p>
            </div>
            <div className="rules-card">
              <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>.rules-card</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Card de regras/sistema.</p>
            </div>
            <div className="ddb-panel p-4">
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>.ddb-panel</p>
            </div>
            <a href="#" className="ddb-action-card">
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>.ddb-action-card</p>
            </a>
            <a href="#" className="ddb-action-card void-accent">
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>.ddb-action-card.void-accent</p>
            </a>
          </div>
        </Section>

        {/* ── Step indicator / counters ─────────────────── */}
        <Section title="Indicador de progresso (criar-personagem)">
          <div className="flex items-center gap-2">
            {(['done', 'done', 'active', 'pending', 'pending'] as const).map((state, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`step-indicator step-indicator--${state} rounded-full flex items-center justify-center`}
                  style={{ width: 32, height: 32, fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem' }}
                >
                  {i + 1}
                </div>
                {i < 4 && (
                  <div
                    className={`step-connector ${state === 'done' ? 'step-connector--done' : ''}`}
                    style={{ width: 32, height: 2 }}
                  />
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Botões de contador">
          <div className="flex items-center gap-3">
            <button className="counter-btn counter-btn--dec w-8 h-8" style={{ color: 'var(--gold)' }}>−</button>
            <span style={{ color: 'var(--text)' }}>3</span>
            <button className="counter-btn counter-btn--inc w-8 h-8" style={{ color: 'var(--gold)' }}>+</button>
            <button className="counter-btn counter-btn--dec w-8 h-8" style={{ color: 'var(--gold)' }} disabled>−</button>
            <span style={{ color: 'var(--text-muted)' }}>(desabilitado)</span>
          </div>
        </Section>

        {/* ── Divisores / breadcrumb ─────────────────────── */}
        <Section title="Divisores & breadcrumb">
          <div className="flex flex-col gap-4" style={{ maxWidth: 480 }}>
            <div className="divider-gold" />
            <div className="divider-void" />
            <p className="hk-divider" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.3em' }}>hk-divider</p>
            <nav className="flex items-center gap-2" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--gold-light)' }}>← Início</span>
              <span className="breadcrumb-sep">◈</span>
              <span className="breadcrumb-current">Página atual</span>
            </nav>
          </div>
        </Section>

        {/* ── Partículas ──────────────────────────────────── */}
        <Section title="Partículas">
          <div className="flex gap-6 items-center">
            <span className="particle-gold rounded-full" style={{ width: 8, height: 8, display: 'inline-block' }} />
            <span className="particle-void rounded-full" style={{ width: 8, height: 8, display: 'inline-block' }} />
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  )
}
