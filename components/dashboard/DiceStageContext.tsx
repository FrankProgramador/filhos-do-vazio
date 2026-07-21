'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Dice3D, { type Dice3DHandle } from '@/components/Dice3D'
import type { DiceAppearance, DiceColorset } from '@/app/lib/dice/diceEngine'
import { defaultAppearances, DICE_RESULT_DELAY, DiceResultModal } from '@/app/painel/jogo/shared'

type DiceResultState = { rolls: number[]; title?: string; resultText?: string }

type DiceStageContextValue = {
  /** Anima os dados já decididos (pelo cliente no solo, pelo servidor no mano a
   * mano — nunca sorteados de novo aqui) e agenda o modal de resultado.
   * `title`: cabeçalho do modal (ex: "re56 rolou Ataque com Arma — Ferrão (Mão
   * Principal)") — quem rolou o quê, sempre em destaque no topo, nunca dentro do
   * corpo do texto. `resultText`: corpo opcional (descrição da habilidade, dano
   * calculado etc). `colorsetOrAppearances`: um único `DiceColorset` tinge TODOS
   * os dados dessa rolagem com uma cor só (ex: azul pro jogador A, vermelho pro
   * B — uso atual); um array de `DiceAppearance` (mesmo tamanho de `rolls`) dá
   * uma skin própria (cor+material+textura) pra CADA dado físico, todos na
   * mesma animação. */
  showDiceRoll: (rolls: number[], title?: string, resultText?: string, colorsetOrAppearances?: DiceColorset | DiceAppearance[]) => void
  /** true desde `showDiceRoll` até o "OK" do modal — use pra esconder outra UI
   * (ex: menu de ações) enquanto a rolagem não terminou de vez. */
  resolving: boolean
}

const DiceStageContext = createContext<DiceStageContextValue | null>(null)

/**
 * Monta o palco de dados 3D UMA ÚNICA VEZ, aqui no shell do painel — nunca é
 * desmontado ao trocar de página (arena solo, mano a mano, etc). Isso elimina de
 * vez qualquer bug de timing de montagem/desmontagem do motor 3D por página; as
 * páginas só chamam `useDiceStageContext().showDiceRoll(...)`, nunca criam o
 * próprio `<Dice3D>`.
 */
export function DiceStageProvider({ children }: { children: ReactNode }) {
  const diceBoxRef = useRef<Dice3DHandle>(null)
  const [diceStageSize, setDiceStageSize] = useState({ width: 480, height: 320 })
  const [diceResult, setDiceResult] = useState<DiceResultState | null>(null)
  const [resolving, setResolving] = useState(false)
  const diceResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    function updateDiceStageSize() {
      setDiceStageSize({ width: window.innerWidth, height: window.innerHeight })
    }
    function onResize() {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(updateDiceStageSize, 300)
    }
    updateDiceStageSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (debounceTimer) clearTimeout(debounceTimer)
      if (diceResultTimeoutRef.current) clearTimeout(diceResultTimeoutRef.current)
    }
  }, [])

  function showDiceRoll(rolls: number[], title?: string, resultText?: string, colorsetOrAppearances?: DiceColorset | DiceAppearance[]) {
    setResolving(true)
    if (diceResultTimeoutRef.current) clearTimeout(diceResultTimeoutRef.current)

    const promise = Array.isArray(colorsetOrAppearances)
      ? diceBoxRef.current?.rollMixed(rolls, colorsetOrAppearances)
      : diceBoxRef.current?.roll(`${rolls.length}d6@${rolls.join(',')}`, colorsetOrAppearances)

    // `roll()`/`rollMixed()` só resolvem quando os dados JÁ pararam de fisicamente
    // assentar — então o modal espera essa resolução de verdade, em vez de um atraso
    // fixo. Um atraso fixo (a forma antiga) funcionava por coincidência pra uma
    // rolagem simultânea só, mas quebrava o `rollMixed`: aí cada dado extra nasce em
    // sequência (a lib só suporta uma jogada de cada vez), então rolagens de 2+ dados
    // com skins diferentes demoram bem mais que a estimativa fixa — o timer antigo
    // disparava o modal antes dos dados seguintes nem terem nascido, e o `clear()` do
    // "OK" apagava a mesa no meio da sequência, fazendo os dados "sumirem".
    promise
      ?.then(() => {
        diceResultTimeoutRef.current = setTimeout(() => setDiceResult({ rolls, title, resultText }), DICE_RESULT_DELAY)
      })
      .catch(err => {
        console.error('[Dice3D] rolagem falhou:', err)
        setResolving(false)
      })
  }

  function closeDiceResult() {
    setDiceResult(null)
    setResolving(false)
    diceBoxRef.current?.clear()
  }

  return (
    <DiceStageContext.Provider value={{ showDiceRoll, resolving }}>
      {children}
      <Dice3D ref={diceBoxRef} portal width={diceStageSize.width} height={diceStageSize.height} />
      {diceResult && <DiceResultModal rolls={diceResult.rolls} title={diceResult.title} resultText={diceResult.resultText} onClose={closeDiceResult} />}

      {/* Botão de teste temporário — rola dados no branco padrão (mesmo fallback usado
          quando alguém não tem skin nenhuma na coleção), sem precisar passar pelo
          fluxo de ataque. */}
      <button
        type="button"
        onClick={() => {
          const rolls = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6))
          showDiceRoll(rolls, 'Teste', undefined, defaultAppearances(rolls.length))
        }}
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 10001,
          fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', padding: '0.6rem 1rem', borderRadius: 8,
          background: 'rgba(184,146,74,0.9)', color: '#1a1a1a', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        🎲 Testar dados
      </button>
    </DiceStageContext.Provider>
  )
}

export function useDiceStageContext(): DiceStageContextValue {
  const ctx = useContext(DiceStageContext)
  if (!ctx) throw new Error('useDiceStageContext precisa ser usado dentro de <DiceStageProvider>.')
  return ctx
}
