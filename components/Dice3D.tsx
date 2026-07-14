'use client'

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { createDiceEngine, type DiceAppearance, type DiceColorset, type DiceEngine, type DiceEngineConfig, type DiceRollResult } from '@/app/lib/dice/diceEngine'

export type Dice3DHandle = {
  /** `colorset`, se informado, troca a cor dos dados antes de rolar (ex: azul pro jogador A, vermelho pro B). */
  roll: (notation: string, colorset?: DiceColorset) => Promise<DiceRollResult>
  /** Rola vários dados numa única jogada, cada um com sua própria skin (cor+material+textura) — ver DiceEngine.rollMixed. */
  rollMixed: (values: number[], appearances: DiceAppearance[]) => Promise<DiceRollResult>
  clear: () => void
}

interface Props {
  /** Tema/material/força do arremesso — ver DiceEngineConfig. */
  config?: DiceEngineConfig
  height?: number | string
  className?: string
  /**
   * Renderiza direto em `document.body` via portal, em vez de no lugar onde o
   * componente foi declarado. Usado por palcos que precisam ficar por cima de
   * tudo sem herdar nenhum stacking context de ancestrais (evita bugs de
   * z-index causados por `position`/contexto de pilha em pais intermediários).
   *
   * Importante: o motor de física/câmera da lib foi calibrado pra caixas
   * modestas (algumas centenas de px) — esticar pra tela cheia (100vw/100vh)
   * quebra a câmera/mundo físico e nada é desenhado. Em modo portal o palco
   * fica centralizado com um tamanho fixo razoável (ver `width`/`height`), não
   * a tela inteira.
   */
  portal?: boolean
  width?: number | string
}

/**
 * Palco de dados 3D reutilizável — qualquer tela que precise "rolar dados de
 * verdade" (single ou multiplayer) monta um `<Dice3D ref={...} />` e chama
 * `ref.current.roll('2d6')` (ou `'2d6@3,5'` pra repetir um resultado já
 * decidido em outro lugar, ex: pelo servidor numa partida multiplayer).
 *
 * Motor de dados 3D isolado em `app/lib/dice/diceEngine.ts` — trocar de
 * biblioteca no futuro não deve exigir mudanças aqui.
 */
const Dice3D = forwardRef<Dice3DHandle, Props>(function Dice3D({ config, height = 260, width = 480, className, portal = false }, ref) {
  // useId (não Math.random) — precisa ser idêntico entre SSR e hidratação, senão
  // vira mismatch; ':' do useId é inválido num seletor CSS puro, então some com ele.
  const rawId = useId()
  const idRef = useRef(`dice-box-${rawId.replace(/:/g, '')}`)
  const engineRef = useRef<DiceEngine | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Portal só pode ser montado depois de existir `document.body` no cliente —
  // no SSR/primeiro paint renderiza in-place mesmo (evita mismatch de hidratação).
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    let cancelled = false
    setReady(false)

    createDiceEngine(`#${idRef.current}`, config)
      .then(engine => {
        if (cancelled) {
          engine.destroy()
          return
        }
        engineRef.current = engine
        setReady(true)
      })
      .catch(err => {
        console.error('[Dice3D] Falha ao inicializar o motor 3D:', err)
        setError('Não foi possível carregar os dados 3D.')
      })

    return () => {
      cancelled = true
      engineRef.current?.destroy()
      engineRef.current = null
    }
    // A lib mede container.clientWidth/clientHeight só na criação — precisa recriar
    // o motor quando width/height mudam de verdade (ex: tamanho real da tela só
    // fica disponível depois do primeiro mount), senão a câmera fica com o
    // tamanho errado mesmo que a caixa CSS já esteja do tamanho novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  useImperativeHandle(ref, () => ({
    roll: async (notation: string, colorset?: DiceColorset) => {
      if (!engineRef.current) return Promise.reject(new Error('Motor de dados ainda não carregado.'))
      if (colorset) await engineRef.current.setColorset(colorset)
      return engineRef.current.roll(notation)
    },
    rollMixed: async (values: number[], appearances: DiceAppearance[]) => {
      if (!engineRef.current) return Promise.reject(new Error('Motor de dados ainda não carregado.'))
      return engineRef.current.rollMixed(values, appearances)
    },
    clear: () => engineRef.current?.clear(),
  }), [])

  // Em modo portal, o palco fica centralizado num tamanho fixo razoável — NÃO
  // tela cheia (100vw/100vh quebra a câmera/mundo físico da lib, feita pra
  // caixas modestas, e nada é desenhado). isolation+transform força sua
  // própria camada de composição, senão o WebGL (canvas com alpha) do dado
  // pode ficar atrás de outro <canvas> 2D da página mesmo com z-index maior.
  const wrapperStyle: CSSProperties = portal
    ? {
        position: 'fixed', top: '50%', left: '50%', width, height,
        transform: 'translate(-50%, -50%) translateZ(0)',
        zIndex: 9999, pointerEvents: 'none', isolation: 'isolate',
      }
    : { position: 'relative', width: '100%', height }

  const content = (
    <div style={wrapperStyle} className={className}>
      <div id={idRef.current} style={{ width: '100%', height: '100%' }} />
      {!ready && !error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', color: 'var(--text-muted)', pointerEvents: 'none',
        }}>
          Carregando dados...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', color: 'var(--error)', pointerEvents: 'none',
        }}>
          {error}
        </div>
      )}
    </div>
  )

  if (portal && mounted) return createPortal(content, document.body)
  return content
})

export default Dice3D
