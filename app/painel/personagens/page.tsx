'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { fetchCharacters, type Character } from '@/app/lib/gameData'

const MAX_CHARACTERS = 3

export default function PersonagensPage() {
  const { token } = useAuth()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetchCharacters(token)
      .then(setCharacters)
      .catch(() => setCharacters([]))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            Meus Personagens
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginTop: '0.25rem' }}>
            {characters.length} / {MAX_CHARACTERS} fichas criadas.
          </p>
        </div>
        {characters.length < MAX_CHARACTERS && (
          <Link href="/criar-personagem" className="hk-btn hk-btn-gold px-4 py-1.5 rounded text-xs shrink-0">
            + Novo Personagem
          </Link>
        )}
      </div>

      <div className="ddb-panel parchment manuscript-ruled p-5">
        {loading ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Carregando personagens...
          </p>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center py-6">
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.5)' }}>
              Você ainda não criou nenhum personagem.
            </p>
            <Link href="/criar-personagem" className="btn-hero" style={{ fontSize: '0.72rem', padding: '0.65rem 1.6rem' }}>
              Criar meu primeiro personagem
            </Link>
          </div>
        ) : (
          <div>
            {characters.map(c => (
              <Link key={c.id} href={`/painel/personagens/${c.id}`} className="ddb-char-row">
                <div
                  className="shrink-0 rounded flex items-center justify-center"
                  style={{ width: 52, height: 52, background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.25)', overflow: 'hidden' }}
                >
                  {c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar} alt={`Avatar de ${c.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.2rem', color: 'var(--gold)' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '0.02em' }} className="truncate">
                    {c.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {[c.species, c.size?.name].filter(Boolean).join(' · ') || 'Sem espécie definida'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="ddb-badge ddb-badge-gold">Nv {c.level}</span>
                  <span className="ddb-badge ddb-badge-dim">{c.trilha?.nome}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
