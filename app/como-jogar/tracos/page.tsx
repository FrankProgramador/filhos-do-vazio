'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchTags, fetchTraits, type GameTrait, type Tag, type TraitRarity } from '@/app/lib/gameData'

const RARITY_LABELS: Record<TraitRarity, string> = {
  common: 'Comum', remarkable: 'Marcante', rare: 'Raro', personality: 'Personalidade',
}

const RARITY_BADGE_CLASS: Record<TraitRarity, string> = {
  common: 'ddb-badge ddb-badge-dim',
  remarkable: 'ddb-badge ddb-badge-gold',
  rare: 'badge badge--gold',
  personality: 'badge badge--success',
}

export default function TracosPage() {
  const [traits, setTraits] = useState<GameTrait[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagId, setTagId] = useState<number | 'all'>('all')
  const [rarity, setRarity] = useState<TraitRarity | 'all'>('all')

  useEffect(() => {
    fetchTags('tracos').then(setTags)
    fetchTraits().then(setTraits).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return traits.filter(t =>
      (tagId === 'all' || t.tags.some(tag => tag.id === tagId)) &&
      (rarity === 'all' || t.rarity === rarity) &&
      (search.trim() === '' || t.name.toLowerCase().includes(search.trim().toLowerCase()))
    )
  }, [traits, tagId, rarity, search])

  return (
    <ContentShell title="Traços">
      <main className="flex-1 w-full">
        <div className="mx-auto px-6 py-12" style={{ maxWidth: 1100 }}>
          <nav className="flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/como-jogar" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">← Como Jogar</Link>
            <span style={{ color: 'rgba(var(--gold-rgb),0.3)' }} aria-hidden>◈</span>
            <span style={{ color: 'rgba(var(--text-rgb),0.38)' }}>Traços</span>
          </nav>

          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Compêndio de Traços
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', marginBottom: '2rem', maxWidth: 640 }}>
            Todos os traços disponíveis no sistema, com seus efeitos mecânicos e raridades. Use os filtros para encontrar o que procura.
          </p>

          {/* Filtros */}
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
              value={tagId}
              onChange={e => setTagId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="ddb-search"
              style={{ padding: '0.65rem 1rem', borderRadius: 6, color: 'var(--text)' }}
            >
              <option value="all">Todas as categorias</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.icon} {tag.name}</option>
              ))}
            </select>
            <select
              value={rarity}
              onChange={e => setRarity(e.target.value as TraitRarity | 'all')}
              className="ddb-search"
              style={{ padding: '0.65rem 1rem', borderRadius: 6, color: 'var(--text)' }}
            >
              <option value="all">Todas as raridades</option>
              {(Object.keys(RARITY_LABELS) as TraitRarity[]).map(r => (
                <option key={r} value={r}>{RARITY_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Carregando traços...</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nenhum traço encontrado com esses filtros.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(trait => (
                <div key={trait.id} className="card" style={{ padding: '1rem 1.125rem', borderRadius: 10 }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{trait.name}</span>
                    <span className={RARITY_BADGE_CLASS[trait.rarity]} style={{ fontSize: '0.46rem' }}>{RARITY_LABELS[trait.rarity]}</span>
                    {trait.tags.map(tag => (
                      <span key={tag.id} className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>{tag.icon} {tag.name}</span>
                    ))}
                    {trait.max_selections > 1 && (
                      <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>máx {trait.max_selections}×</span>
                    )}
                    {trait.prerequisite_trait_id !== null && (
                      <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>sub-traço</span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.6, marginBottom: trait.mechanical_effect ? '0.5rem' : 0 }}>
                    {trait.description}
                  </p>
                  {trait.mechanical_effect && (
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--gold-light)', lineHeight: 1.5 }}>
                      {trait.mechanical_effect}
                    </p>
                  )}
                  {trait.roleplay_obligation && (
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Obrigação:</strong> {trait.roleplay_obligation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ContentShell>
  )
}
