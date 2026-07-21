/**
 * Único ponto de acoplamento com a biblioteca de dados 3D usada hoje
 * (@3d-dice/dice-box-threejs, three.js + cannon-es). Trocar de motor no futuro
 * significa reescrever só `createDiceEngine` — quem consome `DiceEngine` (o
 * componente `Dice3D`) não muda.
 */

export type DieResult = {
  type: string
  sides: number
  value: number
}

export type DiceRollResult = {
  notation: string
  total: number
  dice: DieResult[]
}

/** Cor dos dados de um lote de rolagem — quem rolou os dados (ex: jogador A vs B), não um tema fixo da mesa. */
export type DiceColorset = {
  foreground: string
  background: string
}

/** Skin completa de um dado colecionável — cor + material + textura, uma por dado FÍSICO (não por lote). */
export type DiceAppearance = {
  foreground: string
  background: string
  material?: string
  texture?: string
  /** Face com pips (bolinhas ⬤, como um dado físico clássico) em vez de números — mesmo valor 1-6, só muda o desenho. */
  pipStyle?: boolean
}

export interface DiceEngine {
  roll(notation: string): Promise<DiceRollResult>
  /** Troca a cor dos PRÓXIMOS dados a serem rolados (a lib recarrega o tema antes do próximo spawn). */
  setColorset(colorset: DiceColorset): Promise<void>
  /**
   * Rola vários dados numa ÚNICA jogada, cada um com sua própria skin (cor+material+
   * textura), todos aparecendo juntos na mesma animação. `values.length` deve ser
   * igual a `appearances.length` — o dado físico #i usa `appearances[i]`.
   */
  rollMixed(values: number[], appearances: DiceAppearance[]): Promise<DiceRollResult>
  clear(): void
  destroy(): void
}

export type DiceEngineConfig = {
  /** Cor/tema das faces (ver temas disponíveis em node_modules/@3d-dice/dice-box-threejs/src/const.js). */
  colorset?: string
  /** Material das faces: glass | metal | wood | plastic. */
  material?: string
  /** Multiplicador de força do arremesso. */
  strength?: number
  /** Multiplicador de gravidade da mesa. */
  gravityMultiplier?: number
  /** Som de impacto dos dados (batida na mesa/entre dados) — off por padrão na lib. */
  sounds?: boolean
  /** Volume 0-100, só tem efeito com `sounds: true`. */
  volume?: number
}

/**
 * Monta um motor de dados 3D dentro do elemento indicado por `containerSelector`
 * (precisa já estar no DOM). Assets (texturas/sons) são servidos de
 * `/public/dice-box` — ver `predev`/README se precisar atualizar a versão.
 */
export async function createDiceEngine(
  containerSelector: string,
  config: DiceEngineConfig = {}
): Promise<DiceEngine> {
  const { default: DiceBox } = await import('@3d-dice/dice-box-threejs')

  const box = new DiceBox(containerSelector, {
    assetPath: '/dice-box/',
    theme_material: config.material ?? 'plastic',
    theme_colorset: config.colorset ?? 'white',
    // Precisa ser uma string explícita, nunca deixar a lib cair no default dela: o
    // `DiceColors.getColorSet()` da lib MUTA em memória o preset compartilhado (ex:
    // `eo.white`), trocando `texture: "none"` (string) por um objeto na primeira
    // chamada. Toda inicialização seguinte (StrictMode double-effect, resize do
    // Dice3D recriando o motor, nova navegação) lê esse objeto corrompido de volta e
    // monta uma URL de textura tipo "textures/[object Object].webp" (404). Passar
    // `theme_texture` explicitamente aqui garante que a lib sempre usa ESSA string,
    // nunca o valor (possivelmente corrompido) do preset cacheado.
    theme_texture: 'none',
    strength: config.strength ?? 1,
    gravity_multiplier: config.gravityMultiplier ?? 400,
    sounds: config.sounds ?? true,
    volume: config.volume ?? 100,
    onRollComplete: () => {},
  })

  await box.initialize()

  // A lib cacheia colorsets customizados pelo `name` (DiceColors.makeColorSet) — um
  // nome fixo faria toda cor nova reaproveitar o cache da primeira já criada, ignorando
  // as cores pedidas depois. Precisa ser único por combinação de cor+material+textura.
  function colorsetName(appearance: DiceAppearance): string {
    const material = appearance.material ?? 'plastic'
    const texture = appearance.texture ?? 'none'
    return `custom-${appearance.foreground.replace('#', '')}-${appearance.background.replace('#', '')}-${material}-${texture}`
  }

  // "dpip" é um tipo de dado embutido na lib — mesmo d6 por baixo (valores 1-6),
  // só troca o desenho da face pra pips (bolinhas) em vez de números.
  function dieToken(appearance: DiceAppearance): string {
    return appearance.pipStyle ? 'dpip' : 'd6'
  }

  async function applyAppearance(appearance: DiceAppearance): Promise<void> {
    const material = appearance.material ?? 'plastic'
    const texture = appearance.texture ?? 'none'
    await box.updateConfig({
      theme_material: material,
      theme_customColorset: { name: colorsetName(appearance), foreground: appearance.foreground, background: appearance.background, outline: appearance.background, texture },
    })
  }

  /**
   * Modo sequencial (só API pública, sempre seguro): joga um dado, espera assentar,
   * troca de tema, joga o próximo — em relé, não simultâneo. Usado como fallback se
   * o modo simultâneo (que mexe nos internals da lib) não funcionar.
   */
  async function rollSequentialMixed(values: number[], appearances: DiceAppearance[]): Promise<DiceRollResult> {
    await applyAppearance(appearances[0])
    const first = await box.roll(`1${dieToken(appearances[0])}@${values[0]}`)
    const dice: DieResult[] = first.sets.flatMap((set: { rolls: { sides: number; value: number }[]; type: string }) =>
      set.rolls.map(r => ({ type: set.type, sides: r.sides, value: r.value }))
    )

    // box.add() NÃO chama clearDice() — os dados já cravados na mesa continuam lá com
    // a textura que já tinham no spawn deles, só o dado novo nasce com o tema atual.
    for (let i = 1; i < values.length; i++) {
      await applyAppearance(appearances[i])
      const added = await box.add(`1${dieToken(appearances[i])}@${values[i]}`)
      added.forEach(d => dice.push({ type: d.type, sides: d.sides, value: d.value }))
    }

    return { notation: values.join(','), total: values.reduce((a, b) => a + b, 0), dice }
  }

  /**
   * Modo simultâneo — usa internals NÃO documentados/exportados da lib (arriscado,
   * pode quebrar numa atualização dela). A API pública (`roll`/`add`) só aplica UM
   * tema de cada vez a TODOS os dados de um lote, e só suporta UM arremesso em voo
   * por vez (o "running token" interno trava/perde a promise anterior se um segundo
   * arremesso começar antes do primeiro terminar — testado e confirmado lendo o
   * `animateThrow` da lib). Pra ter uma skin por dado físico na MESMA jogada, a
   * gente replica manualmente o que `rollDice()` faz por dentro, mas troca
   * `DiceFactory.applyColorSet()` (que é o que really define a cor/textura "assada"
   * em cada dado — não é por dado no `roll()`, é um estado só da fábrica) bem antes
   * de cada `spawnDice()` individual, tudo síncrono, então todos nascem na mesma
   * "tacada" e animam juntos numa única passada de física.
   */
  async function rollSimultaneousMixed(values: number[], appearances: DiceAppearance[]): Promise<DiceRollResult> {
    type RawDie = { getLastValue(): { value: number } }
    type Internals = {
      DiceColors: { makeColorSet(config: { name: string; foreground: string; background: string; outline: string; texture: string; material?: string }): Promise<unknown> }
      DiceFactory: { applyColorSet(colorData: unknown): void }
      notationVectors: { vectors: unknown[]; result?: number[]; error?: boolean }
      diceList: (RawDie | undefined)[]
      startClickThrow(notation: string): { vectors: unknown[]; result?: number[]; error?: boolean }
      clearDice(): void
      spawnDice(vector: unknown, existing?: unknown): void
      simulateThrow(): void
      swapDiceFace(die: unknown, value: number): void
      getDiceResults(): { notation: string; total: number; sets: { rolls: { sides: number; value: number }[]; type: string }[] }
      animateThrow(token: number, callback: () => void): void
      steps: number
      iteration: number
      rolling: boolean
      running: number | false
      last_time: number
    }
    const internals = box as unknown as Internals

    if (!internals.DiceColors || !internals.DiceFactory || !internals.startClickThrow) {
      throw new Error('internals esperados da lib não encontrados (versão incompatível?)')
    }

    // Só a resolução da textura (carregar a imagem) é assíncrona — precisa terminar
    // ANTES do laço de spawn, que tem que rodar 100% síncrono pra todos os dados
    // nascerem "ao mesmo tempo" (na mesma micro-tarefa, antes da física começar).
    const colorDataList = await Promise.all(appearances.map(appearance => {
      const material = appearance.material ?? 'plastic'
      const texture = appearance.texture ?? 'none'
      return internals.DiceColors.makeColorSet({
        name: colorsetName(appearance), foreground: appearance.foreground, background: appearance.background,
        outline: appearance.background, texture, material,
      })
    }))

    // A sintaxe "@lista" do parser da lib só existe UMA vez, no fim de tudo — ela
    // NÃO aceita "1d6@4+1dpip@5" (isso quebra: a lib faz um split ingênuo por "@" e
    // tudo depois do primeiro vira lixo, deixando só o 1º dado nascer de verdade).
    // O jeito certo é juntar os grupos de dado por "+" ANTES do "@" e mandar UMA
    // lista de valores no final, na mesma ordem dos grupos: "1d6+1dpip+1d6@4,5,2".
    const notation = `${values.map((_, i) => `1${dieToken(appearances[i])}`).join('+')}@${values.join(',')}`
    const notationVectors = internals.startClickThrow(notation)
    if (notationVectors.error) {
      throw new Error('notação inválida gerada pra rollMixed simultâneo')
    }
    internals.notationVectors = notationVectors

    internals.clearDice()
    notationVectors.vectors.forEach((vector, i) => {
      internals.DiceFactory.applyColorSet(colorDataList[i])
      internals.spawnDice(vector)
    })
    internals.simulateThrow()
    internals.steps = 0
    internals.iteration = 0
    internals.diceList.forEach((die, i) => {
      if (die) internals.spawnDice(notationVectors.vectors[i], die)
    })
    if (notationVectors.result?.length) {
      notationVectors.result.forEach((forcedValue, i) => {
        const die = internals.diceList[i]
        if (die && die.getLastValue().value !== forcedValue) internals.swapDiceFace(die, forcedValue)
      })
    }

    return new Promise((resolve) => {
      internals.rolling = true
      internals.running = Date.now()
      internals.last_time = 0
      internals.animateThrow(internals.running, () => {
        const raw = internals.getDiceResults()
        const dice: DieResult[] = raw.sets.flatMap(set => set.rolls.map(r => ({ type: set.type, sides: r.sides, value: r.value })))
        resolve({ notation: raw.notation, total: raw.total, dice })
      })
    })
  }

  return {
    async roll(notation: string): Promise<DiceRollResult> {
      const raw = await box.roll(notation)
      const dice: DieResult[] = raw.sets.flatMap((set: { rolls: { sides: number; value: number }[]; type: string }) =>
        set.rolls.map(r => ({ type: set.type, sides: r.sides, value: r.value }))
      )
      return { notation: raw.notation, total: raw.total, dice }
    },
    async setColorset(colorset: DiceColorset): Promise<void> {
      await applyAppearance(colorset)
    },
    async rollMixed(values: number[], appearances: DiceAppearance[]): Promise<DiceRollResult> {
      if (values.length === 0 || values.length !== appearances.length) {
        throw new Error('rollMixed: values e appearances precisam ter o mesmo tamanho (um por dado físico).')
      }

      try {
        return await rollSimultaneousMixed(values, appearances)
      } catch (err) {
        // A lib não expõe "uma skin por dado, tudo no mesmo arremesso" na API pública —
        // rollSimultaneousMixed entra nos internals dela pra conseguir isso (ver função
        // abaixo). Se algo não bater (ex: versão da lib mudou o formato interno), cai
        // pro modo sequencial — mais lento (um dado de cada vez), mas só usa API
        // pública, então não quebra o jogo por causa de um detalhe interno da lib.
        console.error('[Dice3D] rollMixed simultâneo falhou, caindo pro modo sequencial:', err)
        return rollSequentialMixed(values, appearances)
      }
    },
    clear() {
      box.clearDice()
    },
    destroy() {
      box.clearDice()
      // Sem isso, o WebGLRenderer interno (box.renderer) nunca libera seu
      // contexto WebGL — cada recriação do motor (troca de width/height,
      // resize da janela, Fast Refresh etc.) vaza mais um contexto vivo. O
      // navegador tem um teto de contextos WebGL simultâneos por processo; ao
      // bati-lo ele derruba silenciosamente o contexto mais antigo, fazendo os
      // dados 3D pararem de renderizar de forma aparentemente aleatória
      // (mais fácil de reproduzir com várias abas/telas abertas ao mesmo tempo).
      box.renderer?.forceContextLoss()
      box.renderer?.dispose()
      // Remove só o <canvas> que ESTE motor criou (nunca o container inteiro):
      // em StrictMode (dev) o efeito de Dice3D roda duas vezes, criando dois
      // DiceBox concorrentes no mesmo container antes do primeiro ser
      // descartado; se o descartado resolvesse DEPOIS do que ficou valendo,
      // limpar o container inteiro apagava o canvas ativo (invisível: o objeto
      // JS continuava "funcionando", só que sem canvas nenhum no DOM).
      box.renderer?.domElement?.remove()
    },
  }
}
