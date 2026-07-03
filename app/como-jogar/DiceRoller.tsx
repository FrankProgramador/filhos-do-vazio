'use client'

import { useState } from 'react'

export default function DiceRoller({
  label, diceCount, threshold = 5, requiredSuccesses = 1, successContent, failContent, revealBoth = false,
}: {
  label: string
  diceCount: number
  threshold?: number
  requiredSuccesses?: number
  successContent: React.ReactNode
  failContent: React.ReactNode
  revealBoth?: boolean
}) {
  const [dice, setDice] = useState<number[] | null>(null)

  function roll() {
    setDice(Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6)))
  }

  const successes = dice ? dice.filter(d => d >= threshold).length : 0
  const success = successes >= requiredSuccesses

  return (
    <div className="card no-print" style={{ padding: '1.25rem 1.5rem', borderRadius: 10, margin: '1.5rem 0', textAlign: 'center' }}>
      {!dice ? (
        <button
          type="button"
          onClick={roll}
          className="hk-btn hk-btn-soul"
          style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', borderRadius: 8 }}
        >
          🎲 {label}
        </button>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {dice.map((d, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 8, fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '1.2rem',
                  border: d >= threshold ? '2px solid var(--gold)' : '2px solid rgba(var(--text-rgb),0.15)',
                  color: d >= threshold ? 'var(--gold)' : 'var(--text-muted)',
                  background: d >= threshold ? 'rgba(var(--gold-rgb),0.12)' : 'transparent',
                  boxShadow: d >= threshold ? '0 0 14px rgba(var(--gold-rgb),0.35)' : 'none',
                }}
              >
                {d}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', letterSpacing: '0.05em', color: success ? 'var(--gold-light)' : 'var(--text-muted)', marginBottom: '1rem' }}>
            {success ? '✓ Sucesso' : '✕ Falha'} ({successes}/{requiredSuccesses} necessário{requiredSuccesses > 1 ? 's' : ''})
          </p>
          {revealBoth ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  textAlign: 'left', padding: '0.9rem 1.1rem', borderRadius: 8,
                  opacity: success ? 1 : 0.5,
                  border: success ? '1px solid rgba(var(--gold-rgb),0.35)' : '1px solid rgba(var(--text-rgb),0.1)',
                  background: success ? 'rgba(var(--gold-rgb),0.05)' : 'transparent',
                }}
              >
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.4rem' }}>
                  ✓ Se tiver sucesso
                </p>
                {successContent}
              </div>
              <div
                style={{
                  textAlign: 'left', padding: '0.9rem 1.1rem', borderRadius: 8,
                  opacity: success ? 0.5 : 1,
                  border: success ? '1px solid rgba(var(--text-rgb),0.1)' : '1px solid rgba(var(--gold-rgb),0.35)',
                  background: success ? 'transparent' : 'rgba(var(--gold-rgb),0.05)',
                }}
              >
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  ✕ Se falhar
                </p>
                {failContent}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              {success ? successContent : failContent}
            </div>
          )}
          <button
            type="button"
            onClick={() => setDice(null)}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', textDecoration: 'underline', cursor: 'pointer' }}
          >
            🔄 Rolar novamente
          </button>
        </>
      )}
    </div>
  )
}
