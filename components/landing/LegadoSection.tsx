import Link from 'next/link'

const steps = [
  {
    n: 1,
    title: 'Escolha sua Base',
    desc: 'Pequeno, Médio ou Grande definem seus atributos iniciais e as possibilidades de crescimento do seu personagem.',
  },
  {
    n: 2,
    title: 'Distribua Atributos',
    desc: 'Ajuste Poder, Graça, Casca e Saber com traços para moldar quem seu personagem é em combate e na exploração.',
  },
  {
    n: 3,
    title: 'Adquira Traços',
    desc: 'Adicione armas naturais, habilidades especiais e peculiaridades únicas que tornam seu inseto inconfundível.',
  },
  {
    n: 4,
    title: 'Defina suas Trilhas',
    desc: 'Escolha um caminho marcial ou místico para definir seu estilo de luta e os poderes que desenvolverá.',
  },
]

const SoulSvg = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto .5rem' }} aria-hidden>
    <circle cx="16" cy="16" r="13" fill="rgba(74,158,255,.08)" stroke="rgba(74,158,255,.35)" strokeWidth="1" />
    <ellipse cx="16" cy="16" rx="4" ry="6" fill="none" stroke="rgba(74,158,255,.5)" strokeWidth="1.2" />
    <circle cx="16" cy="16" r="1.8" fill="rgba(74,158,255,.7)" />
  </svg>
)

export default function LegadoSection() {
  return (
    <section id="legado" aria-labelledby="legado-title" style={{ background: 'var(--hk-void)', padding: '5rem 0' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="lnd-label" aria-hidden>Criação de Personagem</p>
        <h2
          id="legado-title"
          className="text-center mb-4"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--hk-pale)', textShadow: '0 0 24px rgba(74,158,255,.18)' }}
        >
          🦋 Crie seu Legado
        </h2>
        <p className="text-center mb-12" style={{ color: 'rgba(216,228,248,.55)', fontSize: '.95rem', maxWidth: 560, margin: '0 auto 3rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Quatro passos simples para dar vida a um inseto que habitará as lendas de Hallownest.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Pré-visualização de ficha */}
          <div
            className="sheet-preview"
            role="img"
            aria-label="Pré-visualização de uma ficha de personagem com atributos e traços"
          >
            <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
              <SoulSvg />
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--hk-dim)' }}>
                Exemplo de Ficha
              </p>
            </div>
            {/* Mock de linhas */}
            <div className="flex flex-col gap-2" style={{ width: '75%' }} aria-hidden>
              <div style={{ height: 10, width: '70%', borderRadius: 4, background: 'rgba(212,168,67,.08)', border: '1px solid rgba(212,168,67,.15)' }} />
              <div style={{ height: 10, width: '55%', borderRadius: 4, background: 'rgba(74,158,255,.1)', border: '1px solid rgba(74,158,255,.12)' }} />
              <div style={{ height: 10, width: '85%', borderRadius: 4, background: 'rgba(74,158,255,.1)', border: '1px solid rgba(74,158,255,.12)' }} />
              <div className="grid grid-cols-2 gap-1.5 mt-1" style={{ width: '100%' }}>
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={{ height: 34, borderRadius: 6, background: 'rgba(74,158,255,.06)', border: '1px solid rgba(74,158,255,.1)' }} />
                ))}
              </div>
              <div style={{ height: 10, width: '60%', borderRadius: 4, marginTop: 4, background: 'rgba(74,158,255,.1)', border: '1px solid rgba(74,158,255,.12)' }} />
              <div style={{ height: 10, width: '55%', borderRadius: 4, background: 'rgba(74,158,255,.1)', border: '1px solid rgba(74,158,255,.12)' }} />
              <div style={{ height: 10, width: '75%', borderRadius: 4, background: 'rgba(74,158,255,.1)', border: '1px solid rgba(74,158,255,.12)' }} />
            </div>
          </div>

          {/* Passos */}
          <div>
            <ol className="flex flex-col gap-5" role="list">
              {steps.map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4 items-start">
                  <div className="step-num" aria-hidden>{n}</div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '.85rem', fontWeight: 600, color: 'var(--hk-pale)', marginBottom: '.25rem', letterSpacing: '.04em' }}>
                      {title}
                    </p>
                    <p style={{ color: 'rgba(216,228,248,.55)', fontSize: '.87rem', lineHeight: 1.65, fontFamily: 'var(--font-im-fell)' }}>
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <Link href="#" className="hk-btn hk-btn-gold" style={{ fontSize: '.8rem', padding: '.85rem 2.2rem', borderRadius: 8 }}>
                🦋 Começar a Criar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
