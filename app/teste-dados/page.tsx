'use client'

import { useRef, useState } from 'react'
import Dice3D, { type Dice3DHandle } from '@/components/Dice3D'
import type { DiceRollResult } from '@/app/lib/dice/diceEngine'

export default function TesteDadosPage() {
  const diceRef = useRef<Dice3DHandle>(null)
  const [result, setResult] = useState<DiceRollResult | null>(null)
  const [rolling, setRolling] = useState(false)

  async function roll(notation: string) {
    setRolling(true)
    try {
      const r = await diceRef.current?.roll(notation)
      if (r) setResult(r)
    } finally {
      setRolling(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text)' }}>Teste — Dice3D</h1>

      <div className="card" style={{ borderRadius: 10, overflow: 'hidden' }}>
        <Dice3D ref={diceRef} height={360} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => roll('2d6')} disabled={rolling} className="btn-hero" style={{ padding: '0.6rem 1.2rem' }}>
          Rolar 2d6
        </button>
        <button onClick={() => roll('6d6')} disabled={rolling} className="btn-hero" style={{ padding: '0.6rem 1.2rem' }}>
          Rolar 6d6
        </button>
        <button onClick={() => roll('2d6@1,1')} disabled={rolling} className="hk-btn hk-btn-soul" style={{ padding: '0.6rem 1.2rem' }}>
          Rolar 2d6 predeterminado (1,1)
        </button>
        <button onClick={() => diceRef.current?.clear()} className="hk-btn hk-btn-soul" style={{ padding: '0.6rem 1.2rem' }}>
          Limpar
        </button>
      </div>

      {result && (
        <pre style={{ color: 'var(--text)', fontSize: '0.75rem', background: 'var(--card)', padding: '1rem', borderRadius: 8 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
