'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { fetchCharacters, type Character } from '@/app/lib/gameData'
import Arena from '@/app/painel/jogo/Arena'
import MultiplayerLobby from '@/app/painel/jogo/MultiplayerLobby'
import MultiplayerArena from '@/app/painel/jogo/MultiplayerArena'

type Mode = 'choice' | 'solo' | 'mp-lobby' | 'mp-arena'

export default function JogoPage() {
  const { token } = useAuth()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Character | null>(null)
  const [mode, setMode] = useState<Mode>('choice')
  const [matchId, setMatchId] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    fetchCharacters(token)
      .then(setCharacters)
      .catch(() => setCharacters([]))
      .finally(() => setLoading(false))
  }, [token])

  function backToCharacterPicker() {
    setSelected(null)
    setMode('choice')
    setMatchId(null)
  }

  if (selected && mode === 'solo') {
    return <Arena character={selected} onExit={() => setMode('choice')} />
  }

  if (selected && mode === 'mp-lobby') {
    return (
      <MultiplayerLobby
        character={selected}
        onBack={() => setMode('choice')}
        onMatchReady={id => {
          setMatchId(id)
          setMode('mp-arena')
        }}
      />
    )
  }

  if (selected && mode === 'mp-arena' && matchId) {
    return <MultiplayerArena matchId={matchId} onExit={() => setMode('choice')} />
  }

  if (selected && mode === 'choice') {
    return (
      <div className="flex flex-col gap-6" style={{ maxWidth: 600 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            {selected.name}
          </h1>
          <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={backToCharacterPicker}>
            Trocar personagem
          </button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          <button type="button" onClick={() => setMode('solo')} className="ddb-action-card" style={{ textAlign: 'left' }}>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>Treino (IA)</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Arena solo contra um inimigo controlado pelo turno automático.</p>
          </button>
          <button type="button" onClick={() => setMode('mp-lobby')} className="ddb-action-card void-accent" style={{ textAlign: 'left' }}>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>Multiplayer (mano a mano)</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Crie ou entre numa partida 1x1 contra outro jogador.</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div>
        <h1
          className="gold-glow"
          style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}
        >
          Jogo (teste)
        </h1>
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginTop: '0.25rem' }}>
          Escolha um personagem para entrar na arena de teste de movimentação.
        </p>
      </div>

      <div className="ddb-panel parchment manuscript-ruled p-5">
        {loading ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Carregando personagens...
          </p>
        ) : characters.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.5)' }}>
            Você ainda não criou nenhum personagem.
          </p>
        ) : (
          <div>
            {characters.map(c => (
              <button key={c.id} type="button" onClick={() => setSelected(c)} className="ddb-char-row" style={{ width: '100%', textAlign: 'left' }}>
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

                <span className="ddb-badge ddb-badge-gold">Selecionar</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
