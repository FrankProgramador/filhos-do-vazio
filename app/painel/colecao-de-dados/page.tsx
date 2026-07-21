'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { drawDailyDiceSkin, fetchMyDiceSkins, reorderMyDiceSkins, type DiceSkinRarityValue, type OwnedDiceSkin } from '@/app/lib/gameData'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'

const RARITY_LABELS: Record<DiceSkinRarityValue, string> = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' }

function randomDie() {
  return 1 + Math.floor(Math.random() * 6)
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list]
  const swapIndex = index + dir
  if (swapIndex < 0 || swapIndex >= next.length) return list
  ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  return next
}

export default function ColecaoDeDadosPage() {
  const { token } = useAuth()
  const diceStage = useDiceStageContext()
  const [skins, setSkins] = useState<OwnedDiceSkin[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [drawMessage, setDrawMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => fetchMyDiceSkins(token).then(setSkins).catch(() => setSkins([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  async function handleDraw() {
    setDrawing(true)
    setDrawMessage(null)
    setError(null)
    try {
      const result = await drawDailyDiceSkin(token)
      setDrawMessage(result.message)
      if (result.skin) await load()
    } catch (err) {
      setDrawMessage(err instanceof ApiError ? err.message : 'Não foi possível sortear agora.')
    } finally {
      setDrawing(false)
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const reordered = moveItem(skins, index, dir)
    if (reordered === skins) return
    setSkins(reordered)
    try {
      await reorderMyDiceSkins(token, reordered.map(s => s.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao reordenar.')
      await load()
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            Coleção de Dados
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginTop: '0.25rem' }}>
            A ordem abaixo é a ordem de rotação: numa rolagem de vários dados, cada dado físico usa a skin seguinte da lista, ciclando.
          </p>
        </div>
        <button onClick={handleDraw} disabled={drawing} className="btn-hero" style={{ fontSize: '0.72rem', padding: '0.65rem 1.4rem' }}>
          {drawing ? 'Sorteando...' : '🎲 Sortear dado de hoje'}
        </button>
      </div>

      {drawMessage && (
        <div className="alert" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          {drawMessage}
        </div>
      )}
      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      <div className="ddb-panel parchment manuscript-ruled p-5">
        {loading ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Carregando coleção...
          </p>
        ) : skins.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(var(--text-rgb),0.5)', textAlign: 'center', padding: '1.5rem 0' }}>
            Você ainda não tem nenhum dado. Volte amanhã pro sorteio grátis.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {skins.map((skin, index) => (
              <div
                key={skin.id}
                className="flex items-center gap-3 p-2"
                style={{ border: '1px solid rgba(var(--gold-rgb),0.15)', borderRadius: 8, background: 'var(--bg-secondary)' }}
              >
                <div className="flex flex-col" style={{ gap: 2 }}>
                  <button onClick={() => move(index, -1)} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === skins.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>▼</button>
                </div>

                <span
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: skin.background_color, border: `2px solid ${skin.foreground_color}`,
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)' }}>{skin.name}</p>
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {skin.material} · {skin.texture}{skin.pip_style ? ' · pips' : ''}
                  </p>
                </div>

                <span className="ddb-badge ddb-badge-gold">{RARITY_LABELS[skin.rarity]}</span>
                {skin.quantity > 1 && <span className="ddb-badge ddb-badge-dim">x{skin.quantity}</span>}

                <button
                  onClick={() => diceStage.showDiceRoll([randomDie()], undefined, undefined, [{
                    foreground: skin.foreground_color, background: skin.background_color, material: skin.material, texture: skin.texture, pipStyle: skin.pip_style,
                  }])}
                  className="ddb-badge ddb-badge-dim"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  🎲 Testar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
