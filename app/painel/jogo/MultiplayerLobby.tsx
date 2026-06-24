'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { createArenaMatch, fetchArenaMatch, joinArenaMatch } from '@/app/lib/arenaApi'
import type { Character } from '@/app/lib/gameData'

const POLL_INTERVAL_MS = 1500

export default function MultiplayerLobby({ character, onMatchReady, onBack }: { character: Character; onMatchReady: (matchId: number) => void; onBack: () => void }) {
  const { token } = useAuth()
  const [mode, setMode] = useState<'choice' | 'waiting' | 'joining'>('choice')
  const [matchId, setMatchId] = useState<number | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  function startPolling(id: number) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      if (!token) return
      fetchArenaMatch(id, token).then(match => {
        if (match.status === 'active') {
          if (pollRef.current) clearInterval(pollRef.current)
          onMatchReady(id)
        }
      }).catch(() => {})
    }, POLL_INTERVAL_MS)
  }

  async function handleCreate() {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      const match = await createArenaMatch(character.id, token)
      setMatchId(match.id)
      setMode('waiting')
      startPolling(match.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a partida.')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    if (!token) return
    const id = Number(joinCode.trim())
    if (!id) {
      setError('Informe o código da partida.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const match = await joinArenaMatch(id, character.id, token)
      onMatchReady(match.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar na partida.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div className="flex items-center justify-between">
        <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
          Lobby multiplayer
        </h1>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={onBack}>
          Voltar
        </button>
      </div>

      <div className="ddb-panel parchment p-5 flex flex-col gap-4">
        {error && (
          <p style={{ color: 'var(--error)', fontSize: '0.8rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>{error}</p>
        )}

        {mode === 'choice' && (
          <>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Crie uma partida e compartilhe o código, ou entre numa partida existente para um mano a mano com {character.name}.
            </p>
            <button type="button" className="hk-btn hk-btn-gold px-4 py-2 rounded text-xs" onClick={handleCreate} disabled={busy}>
              Criar partida
            </button>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Código da partida"
                className="flex-1 px-2 py-1.5 rounded text-sm"
                style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.25)', color: 'var(--text)' }}
              />
              <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs" onClick={handleJoin} disabled={busy}>
                Entrar
              </button>
            </div>
          </>
        )}

        {mode === 'waiting' && matchId && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Aguardando o segundo jogador entrar. Compartilhe o código abaixo:
            </p>
            <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '1.1rem', padding: '0.5rem 1.2rem' }}>
              {matchId}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
