/**
 * @3d-dice/dice-box-threejs não publica tipos. Só o que `diceEngine.ts`
 * realmente usa está tipado aqui — o resto do surface da lib é `any`.
 */
declare module '@3d-dice/dice-box-threejs' {
  export type DiceBoxRollSet = {
    type: string
    rolls: { sides: number; value: number }[]
    total: number
  }

  export type DiceBoxRollResult = {
    notation: string
    sets: DiceBoxRollSet[]
    modifier: number
    total: number
  }

  export type DiceBoxConfig = {
    assetPath?: string
    theme_material?: string
    theme_colorset?: string
    theme_texture?: string
    strength?: number
    gravity_multiplier?: number
    sounds?: boolean
    volume?: number
    onRollComplete?: (result: DiceBoxRollResult) => void
  }

  export type DiceBoxCustomColorset = {
    name?: string
    foreground: string
    background: string
    outline?: string
    texture?: string
  }

  export type DiceBoxSingleDieResult = {
    type: string
    sides: number
    value: number
  }

  export default class DiceBox {
    constructor(containerSelector: string, config?: DiceBoxConfig)
    initialize(): Promise<void>
    roll(notation: string): Promise<DiceBoxRollResult>
    /** Adiciona dado(s) novo(s) à mesa SEM remover os que já estão rolados (ao contrário de roll(), não chama clearDice()). */
    add(notation: string): Promise<DiceBoxSingleDieResult[]>
    clearDice(): void
    /** Recarrega o tema (cor/material) aplicado aos PRÓXIMOS dados a serem gerados. */
    updateConfig(config: { theme_customColorset?: DiceBoxCustomColorset; theme_colorset?: string; theme_material?: string }): Promise<void>
    /** THREE.WebGLRenderer interno — só exposto aqui pra poder liberar o contexto WebGL e remover seu <canvas> próprio no destroy(). */
    renderer?: { forceContextLoss(): void; dispose(): void; domElement?: HTMLCanvasElement }
  }
}
