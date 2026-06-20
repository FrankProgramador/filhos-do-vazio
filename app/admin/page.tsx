import Link from 'next/link'

const cards = [
  { href: '/admin/tamanhos', label: 'Tamanhos', desc: 'Pequeno, Médio, Grande e seus atributos base.' },
  { href: '/admin/tracos', label: 'Traços', desc: 'Comuns, marcantes, raros e de personalidade — com seus modificadores.' },
  { href: '/admin/itens', label: 'Itens', desc: 'Armas, armaduras, ferramentas e consumíveis.' },
  { href: '/admin/pacotes', label: 'Pacotes de Equipamento', desc: 'Conjuntos iniciais de itens para a criação de personagem.' },
  { href: '/admin/trilhas', label: 'Trilhas', desc: 'Caminhos marciais e místicos.' },
]

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }}>
          Painel Administrativo
        </h1>
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Gerencie os catálogos do jogo usados na criação de personagem.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {cards.map(c => (
          <Link
            key={c.href}
            href={c.href}
            className="card"
            style={{ padding: '1.25rem', borderRadius: 10, textDecoration: 'none', display: 'block' }}
          >
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              {c.label}
            </h2>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {c.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
