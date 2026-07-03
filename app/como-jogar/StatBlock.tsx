export type StatBlockAttack = {
  name: string
  test: string
  dice: string
  acerto: string
  dano?: string
  efeito?: string
  custo?: string
  observacao?: string
}

export type StatBlockData = {
  name: string
  icon?: string
  tamanho?: string
  funcao?: string
  attributes: { label: string; value: number }[]
  resources: { label: string; value: string }[]
  attacks: StatBlockAttack[]
  defense?: string[]
  behavior?: string[]
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', letterSpacing: '0.05em', color: 'var(--gold-light)', margin: '1rem 0 0.4rem' }}>
      {children}
    </p>
  )
}

export default function StatBlock({ data }: { data: StatBlockData }) {
  const { name, icon, tamanho, funcao, attributes, resources, attacks, defense, behavior } = data

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: 12, marginBottom: '1.5rem', background: 'var(--bg-secondary)' }}>
      <h4 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.7rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>
        {icon ? `${icon} ` : ''}{name}
      </h4>
      {(tamanho || funcao) && (
        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {tamanho && <>Tamanho: {tamanho}</>}
          {tamanho && funcao && ' · '}
          {funcao && <>Função: {funcao}</>}
        </p>
      )}

      <Label>Atributos</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {attributes.map(a => (
          <span
            key={a.label}
            style={{
              fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)',
              padding: '0.3rem 0.7rem', borderRadius: 6, background: 'rgba(var(--gold-rgb),0.06)',
              border: '1px solid rgba(var(--gold-rgb),0.15)',
            }}
          >
            {a.label}: <strong>{a.value}</strong>
          </span>
        ))}
      </div>

      <Label>Recursos</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {resources.map(r => (
          <span
            key={r.label}
            style={{
              fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)',
              padding: '0.3rem 0.7rem', borderRadius: 6, background: 'rgba(var(--gold-rgb),0.06)',
              border: '1px solid rgba(var(--gold-rgb),0.15)',
            }}
          >
            {r.label}: <strong>{r.value}</strong>
          </span>
        ))}
      </div>

      <Label>Ataques</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {attacks.map(atk => (
          <div key={atk.name} style={{ padding: '0.7rem 0.9rem', borderRadius: 8, background: 'rgba(var(--gold-rgb),0.04)', border: '1px solid rgba(var(--gold-rgb),0.1)' }}>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{atk.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.7)', lineHeight: 1.6, margin: 0 }}>
              Teste: {atk.test} · Dados: {atk.dice} · Acerto: {atk.acerto}
              {atk.dano && <> · Dano: {atk.dano}</>}
              {atk.custo && <> · Custo: {atk.custo}</>}
            </p>
            {atk.efeito && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.7)', lineHeight: 1.6, margin: '0.2rem 0 0' }}>Efeito: {atk.efeito}</p>
            )}
            {atk.observacao && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, margin: '0.2rem 0 0' }}>Obs.: {atk.observacao}</p>
            )}
          </div>
        ))}
      </div>

      {defense && defense.length > 0 && (
        <>
          <Label>Defesa</Label>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {defense.map((d, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.75)' }}>{d}</li>
            ))}
          </ul>
        </>
      )}

      {behavior && behavior.length > 0 && (
        <>
          <Label>Comportamento</Label>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {behavior.map((b, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.75)' }}>{b}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
