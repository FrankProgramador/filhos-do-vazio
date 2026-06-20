'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchItems, type Item } from '@/app/lib/gameData'

const TYPE_LABELS: Record<Item['type'], string> = {
  weapon: 'Arma', armor: 'Armadura', shield: 'Escudo', tool: 'Ferramenta',
  consumable: 'Consumível', accessory: 'Acessório', other: 'Outro',
}

export default function ItensPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<Item['type'] | 'all'>('all')

  useEffect(() => {
    fetchItems().then(setItems).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return items.filter(i =>
      (type === 'all' || i.type === type) &&
      (search.trim() === '' || i.name.toLowerCase().includes(search.trim().toLowerCase()))
    )
  }, [items, type, search])

  return (
    <ContentShell title="Itens">
      <main className="flex-1 w-full">
        <div className="mx-auto px-6 py-12" style={{ maxWidth: 1100 }}>
          <nav className="flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/como-jogar" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">← Como Jogar</Link>
            <span style={{ color: 'rgba(var(--gold-rgb),0.3)' }} aria-hidden>◈</span>
            <span style={{ color: 'rgba(var(--text-rgb),0.38)' }}>Itens</span>
          </nav>

          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Compêndio de Itens
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', marginBottom: '2rem', maxWidth: 640 }}>
            Armas, armaduras, ferramentas e consumíveis disponíveis para compra na criação de personagem.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="ddb-search"
              style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: 6, color: 'var(--text)' }}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as Item['type'] | 'all')}
              className="ddb-search"
              style={{ padding: '0.65rem 1rem', borderRadius: 6, color: 'var(--text)' }}
            >
              <option value="all">Todos os tipos</option>
              {(Object.keys(TYPE_LABELS) as Item['type'][]).map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Carregando itens...</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nenhum item encontrado com esses filtros.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(item => (
                <div key={item.id} className="card" style={{ padding: '1rem 1.125rem', borderRadius: 10 }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                    <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.46rem' }}>{TYPE_LABELS[item.type]}</span>
                    <span className="badge badge--gold" style={{ fontSize: '0.5rem' }}>{item.base_price} Geo</span>
                    {item.is_consumable && <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Consumível</span>}
                  </div>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                    {item.description}
                  </p>
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    Peso {item.weight}{item.durability !== null ? ` · Durabilidade ${item.durability}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ContentShell>
  )
}
