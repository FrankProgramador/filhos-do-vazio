'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { IconBook, IconMap, IconQuestion, IconScroll } from '@/components/dashboard/icons'
import { fetchCharacters, type Character } from '@/app/lib/gameData'

const quickActions = [
  { href: '/criar-personagem', label: 'Criar Personagem', desc: 'Inicie a criação de uma nova ficha.', icon: IconScroll },
  { href: '/locais', label: 'Explorar o Mundo', desc: 'Conheça os locais de Kishar.', icon: IconMap },
  { href: '/historia', label: 'Ler a História', desc: 'Mergulhe no legado do reino.', icon: IconBook, accent: 'void' },
  { href: '/como-jogar', label: 'Como Jogar', desc: 'Revise as regras do sistema.', icon: IconQuestion },
]

const MAX_CHARACTERS = 3

export default function PainelPage() {
  const { user, token } = useAuth()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loadingChars, setLoadingChars] = useState(true)

  useEffect(() => {
    if (!token) return
    fetchCharacters(token)
      .then(setCharacters)
      .catch(() => setCharacters([]))
      .finally(() => setLoadingChars(false))
  }, [token])

  return (
    <div className="flex flex-col gap-8" style={{ maxWidth: 1100 }}>
      <div>
        <h1
          className="gold-glow"
          style={{
            fontFamily: 'var(--font-cinzel-decorative)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: '0.4rem',
          }}
        >
          Bem-vindo(a), {user?.name}
        </h1>
        <p style={{ color: 'rgba(var(--text-rgb),0.6)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Kishar aguarda. Escolha seu próximo passo.
        </p>
      </div>

      {/* Meus Personagens */}
      <div className="ddb-panel parchment manuscript-ruled p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="ddb-section-title" style={{ flex: 1 }}>Meus Personagens</h2>
          <div className="flex items-center gap-2 shrink-0">
            {characters.length > 0 && (
              <Link href="/painel/personagens" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs">
                Ver todos
              </Link>
            )}
            {characters.length < MAX_CHARACTERS && (
              <Link href="/criar-personagem" className="hk-btn hk-btn-gold px-4 py-1.5 rounded text-xs">
                + Novo Personagem
              </Link>
            )}
          </div>
        </div>

        {loadingChars ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Carregando personagens...
          </p>
        ) : characters.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.45)' }}>
            Você ainda não criou nenhum personagem. Comece sua jornada criando o primeiro.
          </p>
        ) : (
          <div>
            {characters.slice(0, 3).map(c => (
              <Link key={c.id} href={`/painel/personagens/${c.id}`} className="ddb-char-row">
                <div
                  className="shrink-0 rounded flex items-center justify-center"
                  style={{ width: 44, height: 44, background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.25)', overflow: 'hidden' }}
                >
                  {c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar} alt={`Avatar de ${c.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1rem', color: 'var(--gold)' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: 'var(--text)', letterSpacing: '0.02em' }} className="truncate">
                    {c.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
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

      <div>
        <h2 className="ddb-section-title">Ações Rápidas</h2>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {quickActions.map(({ href, label, desc, icon: Icon, accent }) => (
            <Link key={href} href={href} className={`ddb-action-card ${accent === 'void' ? 'void-accent' : ''}`}>
              <Icon className="dash-nav-icon" />
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>{label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="ddb-panel p-5">
        <h2 className="ddb-section-title">Atividade Recente</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Nenhuma atividade por aqui ainda. Suas fichas e campanhas aparecerão neste espaço.
        </p>
      </div>
    </div>
  )
}
