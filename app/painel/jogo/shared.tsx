'use client'

import { useEffect, useState } from 'react'
import type { DiceAppearance } from '@/app/lib/dice/diceEngine'

/** Dado ≥5 é sucesso — mesma regra de /como-jogar e do ArenaRules do backend. */
export const SUCCESS_THRESHOLD = 5

/**
 * Aparência usada quando quem rolou não tem nenhuma skin na coleção (ou é a IA,
 * que não tem coleção nenhuma) — branco liso, mesmo default histórico do motor de
 * dados. Mesmos valores do `ArenaRules::DEFAULT_DICE_APPEARANCE` no backend.
 */
export const DICE_APPEARANCE_DEFAULT: DiceAppearance = { foreground: '#000000', background: '#ffffff', material: 'plastic', texture: 'none' }

/** Repete o default branco N vezes — pra quando ainda não se sabe a coleção de ninguém (ex: IA). */
export function defaultAppearances(count: number): DiceAppearance[] {
  return Array.from({ length: count }, () => DICE_APPEARANCE_DEFAULT)
}
/**
 * Pequena pausa depois que a promise da rolagem JÁ resolveu (os dados já assentaram
 * de verdade) até mostrar o modal — só um respiro visual, não uma estimativa de
 * quanto tempo a física leva (isso quem garante é aguardar a promise mesmo).
 */
export const DICE_RESULT_DELAY = 400
/** Intervalo entre a revelação de cada dado no modal de resultado. */
export const DICE_REVEAL_STAGGER = 280

/**
 * Custo de estamina pra comprar N dados extras de ataque é triangular, não linear:
 * o 1º dado custa 1, o 2º custa mais 2 (total 3), o 3º custa mais 3 (total 6), o 4º
 * custa mais 4 (total 10)... cada dado a mais fica proporcionalmente mais caro que
 * o anterior. Mesma fórmula usada pelo backend (ArenaRules::triangularCost).
 */
export function triangularCost(diceCount: number): number {
  return (diceCount * (diceCount + 1)) / 2
}

export function HeartBar({ label, hp, maxHp }: { label: string; hp: number; maxHp: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>{label}</span>
      <span style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: maxHp }, (_, i) => (
          <span key={i} style={{ fontSize: '0.95rem', color: i < hp ? '#a34a4a' : 'rgba(163, 74, 74, 0.25)' }}>
            ♥
          </span>
        ))}
      </span>
    </div>
  )
}

export function StatLine({ poder, casca, estamina }: { poder: number; casca: number; estamina: number }) {
  return (
    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
      Poder {poder} · Casca {casca} · Estamina {estamina}
    </span>
  )
}

export function BattleLog({ entries, height }: { entries: string[]; height: number }) {
  return (
    <div className="ddb-panel parchment p-3 flex flex-col gap-2" style={{ width: 280, height, flexShrink: 0 }}>
      <span
        style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.62rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}
      >
        Log de batalha
      </span>
      <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
        {entries.map((entry, i) => (
          <p
            key={i}
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: i === entries.length - 1 ? 'var(--text)' : 'rgba(var(--text-rgb),0.55)',
            }}
          >
            {entry}
          </p>
        ))}
      </div>
    </div>
  )
}

/**
 * Modal que aparece um pouco depois da animação física dos dados assentar —
 * revela os resultados um a um (sucesso ≥5 pisca verde, falha treme e fica
 * vermelha), depois mostra o total de sucessos. "OK" fecha (quem chama deve
 * limpar os dados físicos da mesa em `onClose`).
 */
export function DiceResultModal({ rolls, resultText, onClose }: { rolls: number[]; resultText?: string; onClose: () => void }) {
  const [revealCount, setRevealCount] = useState(0)
  const successes = rolls.filter(roll => roll >= SUCCESS_THRESHOLD).length

  // Cada abertura do modal é uma montagem nova (quem chama só renderiza isto
  // quando há um resultado), então revealCount já começa em 0 sozinho.
  useEffect(() => {
    const timers = rolls.map((_, i) => setTimeout(() => setRevealCount(c => c + 1), i * DICE_REVEAL_STAGGER))
    return () => timers.forEach(clearTimeout)
  }, [rolls])

  const allRevealed = revealCount >= rolls.length

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
    >
      <div className="ddb-panel parchment p-4" style={{ minWidth: 300, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {rolls.map((roll, i) => {
            const shown = i < revealCount
            const success = roll >= SUCCESS_THRESHOLD
            return (
              <span
                key={i}
                className={shown ? (success ? 'die-face die-face--success' : 'die-face die-face--fail') : 'die-face'}
                style={{ opacity: shown ? 1 : 0 }}
              >
                {shown ? roll : ''}
              </span>
            )
          })}
        </div>

        {allRevealed && (
          <>
            <p
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: successes > 0 ? 'var(--success)' : 'var(--error)',
                marginBottom: '1.25rem',
              }}
            >
              {successes} sucesso{successes !== 1 ? 's' : ''}
            </p>
            {resultText && (
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                {resultText}
              </p>
            )}
            <button type="button" className="hk-btn hk-btn-gold px-4 py-1.5 rounded text-xs" onClick={onClose}>
              OK
            </button>
          </>
        )}
      </div>
    </div>
  )
}
