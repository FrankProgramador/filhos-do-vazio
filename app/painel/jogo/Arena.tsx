'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  effortCost, fetchMyDiceSkins, updateCharacterResource,
  type Character, type CharacterResourceEntry, type OwnedDiceSkin,
} from '@/app/lib/gameData'
import { useAuth } from '@/app/lib/auth-context'
import type { DiceAppearance } from '@/app/lib/dice/diceEngine'
import { BattleLog, DICE_APPEARANCE_DEFAULT, defaultAppearances, SUCCESS_THRESHOLD } from './shared'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'
import { resolveAbilityEffects, type ResolvedEffect, type RollContext } from '@/app/lib/abilityResolver'
import {
  AbilityCard, FALLBACK_UNARMED_ABILITY, findResourceEntry, resolveHandActions, resourceValue, type ResolvedHandAction,
} from '@/components/CharacterSheetCard'
import ActionBar, { type ActionCardSpec } from '@/components/ActionBar'
import PartyStatusBar, { type PartyMemberStatus } from '@/components/PartyStatusBar'

type ArenaToken = {
  id: string
  label: string
  color: string
  col: number
  row: number
  movement: number
  movementUsed: number
  /** Casca "de combate" — desgasta durante a luta (absorve dano até esgotar), começa
   * igual ao atributo real mas diverge entre os dois lados conforme apanham. Vida
   * (Coração), Estamina e Alma NÃO ficam aqui — vêm de verdade de `resources`/
   * `shadowResources` (os recursos reais da ficha), não de um número sintético do token. */
  casca: number
  attacked: boolean
  isEnemy?: boolean
  avatar?: string | null
  /** Personagens/mobs de tamanho Grande ocupam 2 espaços (célula atual + a da direita). */
  large?: boolean
}

type Cell = { col: number; row: number }
type ReachableInfo = { dist: number; parent: string | null }

const COLS = 20
const ROWS = 14
const CELL = 40
const MOVE_DIRECTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const BANNER_DURATION = 1400

const WALL_DENSITY = 0.1
const FLOOR_SHADES = ['#1c1d21', '#1f2024', '#191a1e', '#212226', '#1a1b1f']
/** Zonas livres de paredes nos spawns, pra garantir espaço pra os dois lados aparecerem. */
const SAFE_ZONES: Array<{ minCol: number; maxCol: number; minRow: number; maxRow: number }> = [
  { minCol: 0, maxCol: 6, minRow: 5, maxRow: 9 },
  { minCol: COLS - 7, maxCol: COLS - 1, minRow: 5, maxRow: 9 },
]

function isInSafeZone(col: number, row: number) {
  return SAFE_ZONES.some(z => col >= z.minCol && col <= z.maxCol && row >= z.minRow && row <= z.maxRow)
}

/** BFS simples só com paredes (sem tokens) — usado pra garantir que os dois spawns ficam alcançáveis. */
function cellsConnected(walls: Set<string>, a: Cell, b: Cell): boolean {
  const startKey = `${a.col},${a.row}`
  const goalKey = `${b.col},${b.row}`
  if (startKey === goalKey) return true
  const visited = new Set([startKey])
  const queue: Cell[] = [a]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const [dc, dr] of MOVE_DIRECTIONS) {
      const nc = cur.col + dc
      const nr = cur.row + dr
      const key = `${nc},${nr}`
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue
      if (walls.has(key) || visited.has(key)) continue
      if (key === goalKey) return true
      visited.add(key)
      queue.push({ col: nc, row: nr })
    }
  }
  return false
}

/** Gera um layout de paredes aleatório, tentando algumas vezes até garantir que os spawns fiquem conectados. */
function generateRandomWalls(): Set<string> {
  const wallCount = Math.floor(COLS * ROWS * WALL_DENSITY)

  for (let attempt = 0; attempt < 25; attempt++) {
    const walls = new Set<string>()
    let safety = 0
    while (walls.size < wallCount && safety < wallCount * 20) {
      safety++
      const col = randomBetween(0, COLS - 1)
      const row = randomBetween(0, ROWS - 1)
      if (isInSafeZone(col, row)) continue
      walls.add(`${col},${row}`)
    }
    if (cellsConnected(walls, { col: 4, row: 7 }, { col: COLS - 5, row: 7 })) {
      return walls
    }
  }

  return new Set()
}

/** Tonalidade aleatória por célula do piso, pra dar variedade visual ao chão. */
function generateRandomFloors(): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => FLOOR_SHADES[Math.floor(Math.random() * FLOOR_SHADES.length)])
  )
}

const HIT_EFFECT_DURATION = 500
const DEFAULT_ZOOM = 1.5
const DRAG_THRESHOLD = 4
const VIEWPORT_HEIGHT = 'min(78vh, 760px)'

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** 1d6 por dado — sucesso em 5 ou 6, mesma regra de /como-jogar e do ArenaRules do backend. */
function rollDice(count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, () => 1 + Math.floor(Math.random() * 6))
}

/**
 * A casca do defensor funciona como um escudo que se desgasta: absorve o dano bruto
 * (já resolvido pelo motor real de habilidades — `resolveAbilityEffects`) até se
 * esgotar; o que passar disso ("excedente") é o dano real, aplicado à vida. Um
 * acerto sempre causa pelo menos 1 de dano real, mesmo que a casca absorva o resto.
 */
function applyCascaAbsorption(rawDamage: number, defenderCasca: number) {
  if (rawDamage <= 0) return { damage: 0, remainingCasca: defenderCasca }
  const cascaAbsorbed = Math.min(rawDamage, defenderCasca)
  const damage = Math.max(1, rawDamage - cascaAbsorbed)
  return { damage, remainingCasca: defenderCasca - cascaAbsorbed }
}

/** Soma só os efeitos de dano resolvidos (ignora aplicar-condição etc, fora de escopo aqui). */
function totalDamageFromEffects(effects: ResolvedEffect[]): number {
  return effects.filter(e => e.behaviorSlug === 'damage').reduce((sum, e) => sum + e.amount, 0)
}

/** Distância "de rei" (8 direções) — usada pra alcance de ataque, que pode acertar na diagonal. */
function chebyshev(a: Cell, b: Cell) {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row))
}

/** Células ocupadas por um token nessa posição — tokens Grandes ocupam um quadrado 2x2. */
function footprintCells(col: number, row: number, large: boolean): Cell[] {
  if (!large) return [{ col, row }]
  return [
    { col, row }, { col: col + 1, row },
    { col, row: row + 1 }, { col: col + 1, row: row + 1 },
  ]
}

function tokenCells(token: ArenaToken): Cell[] {
  return footprintCells(token.col, token.row, !!token.large)
}

function occupiesCell(token: ArenaToken, col: number, row: number): boolean {
  return tokenCells(token).some(c => c.col === col && c.row === row)
}

/**
 * Menor distância (Chebyshev — permite diagonal) entre qualquer célula do footprint do
 * atacante e a célula-alvo. Pra atacantes Grandes (2x2), a origem do ataque é "o quadrado
 * mais próximo do alvo", não só a célula âncora.
 */
function footprintDistanceToCell(cells: Cell[], target: Cell) {
  let min = Infinity
  for (const cell of cells) {
    const d = chebyshev(cell, target)
    if (d < min) min = d
  }
  return min
}

function isWalkable(tokens: ArenaToken[], ignoreId: string, col: number, row: number, walls: Set<string>, large = false) {
  return footprintCells(col, row, large).every(cell => {
    if (cell.col < 0 || cell.row < 0 || cell.col >= COLS || cell.row >= ROWS) return false
    if (walls.has(`${cell.col},${cell.row}`)) return false
    return !tokens.some(t => t.id !== ignoreId && occupiesCell(t, cell.col, cell.row))
  })
}

function computeReachable(tokens: ArenaToken[], token: ArenaToken, maxRange: number, walls: Set<string>) {
  const startKey = `${token.col},${token.row}`
  const info = new Map<string, ReachableInfo>([[startKey, { dist: 0, parent: null }]])
  const queue: [number, number][] = [[token.col, token.row]]

  while (queue.length > 0) {
    const [c, r] = queue.shift()!
    const key = `${c},${r}`
    const d = info.get(key)!.dist
    if (d >= maxRange) continue
    for (const [dc, dr] of MOVE_DIRECTIONS) {
      const nc = c + dc
      const nr = r + dr
      const nextKey = `${nc},${nr}`
      if (info.has(nextKey)) continue
      if (!isWalkable(tokens, token.id, nc, nr, walls, token.large)) continue
      info.set(nextKey, { dist: d + 1, parent: key })
      queue.push([nc, nr])
    }
  }

  return info
}

function getPath(info: Map<string, ReachableInfo>, fromKey: string, toKey: string): Cell[] {
  const path: Cell[] = []
  let key: string | null = toKey
  while (key) {
    const [c, r] = key.split(',').map(Number)
    path.unshift({ col: c, row: r })
    if (key === fromKey) break
    key = info.get(key)?.parent ?? null
  }
  return path
}

/** Unlimited-range BFS to the nearest cell satisfying goalTest — used for enemy pathing around obstacles. */
function bfsPathTo(tokens: ArenaToken[], ignoreId: string, start: Cell, goalTest: (c: Cell) => boolean, walls: Set<string>): Cell[] | null {
  if (goalTest(start)) return [start]
  const startKey = `${start.col},${start.row}`
  const parent = new Map<string, string | null>([[startKey, null]])
  const queue: Cell[] = [start]
  let foundKey: string | null = null

  while (queue.length > 0 && !foundKey) {
    const cur = queue.shift()!
    const curKey = `${cur.col},${cur.row}`
    for (const [dc, dr] of MOVE_DIRECTIONS) {
      const next = { col: cur.col + dc, row: cur.row + dr }
      const key = `${next.col},${next.row}`
      if (parent.has(key)) continue
      if (!isWalkable(tokens, ignoreId, next.col, next.row, walls)) continue
      parent.set(key, curKey)
      if (goalTest(next)) {
        foundKey = key
        break
      }
      queue.push(next)
    }
  }

  if (!foundKey) return null
  const path: Cell[] = []
  let k: string | null = foundKey
  while (k !== null) {
    const [c, r] = k.split(',').map(Number)
    path.unshift({ col: c, row: r })
    k = parent.get(k) ?? null
  }
  return path
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export default function Arena({ character, onExit }: { character: Character; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tokens, setTokens] = useState<ArenaToken[]>(() => [
    {
      id: 'player',
      label: character.name.charAt(0).toUpperCase(),
      color: '#b8924a',
      col: 4,
      row: 7,
      movement: 5,
      movementUsed: 0,
      casca: character.casca,
      attacked: false,
      avatar: character.avatar,
      large: character.size?.slug === 'grande',
    },
    {
      // A sombra é uma CÓPIA do próprio personagem (mesmos atributos/itens/habilidades,
      // ver `character` reaproveitado direto pra ela) — não um inimigo sintético
      // aleatório. Token bem mais escuro que o do jogador (#b8924a) pra diferenciar.
      id: 'shadow',
      label: character.name.charAt(0).toUpperCase(),
      color: '#241f2a',
      col: 15,
      row: 7,
      movement: 5,
      movementUsed: 0,
      casca: character.casca,
      isEnemy: true,
      attacked: false,
      avatar: character.avatar,
      large: character.size?.slug === 'grande',
    },
  ])
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [hoverCell, setHoverCell] = useState<Cell | null>(null)
  const [turn, setTurn] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [turnBanner, setTurnBanner] = useState<string | null>(() => `Turno de ${character.name}`)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [battleLog, setBattleLog] = useState<string[]>([`Turno 1 — vez de ${character.name}.`])
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const diceStage = useDiceStageContext()
  const { token } = useAuth()
  const [myDiceSkins, setMyDiceSkins] = useState<OwnedDiceSkin[]>([])

  useEffect(() => {
    fetchMyDiceSkins(token).then(setMyDiceSkins).catch(() => setMyDiceSkins([]))
  }, [token])

  /** Cicla pela coleção do jogador (ordem que ele escolheu) — branco padrão se ele ainda não tiver nenhuma skin. */
  /**
   * Um dado físico por skin possuída, na ordem escolhida — NÃO repete uma skin
   * escassa pra preencher os dados que sobrarem (ex: só 1 dado vermelho na coleção
   * → só 1 dos físicos sai vermelho, o resto sai branco padrão, nunca vermelho de novo).
   */
  function myAppearances(count: number): DiceAppearance[] {
    return Array.from({ length: count }, (_, i) => {
      const skin = myDiceSkins[i]
      if (!skin) return { ...DICE_APPEARANCE_DEFAULT }
      return { foreground: skin.foreground_color, background: skin.background_color, material: skin.material, texture: skin.texture, pipStyle: skin.pip_style }
    })
  }

  // Recursos do jogador (mesmo padrão da ficha — espelha `character.resources`,
  // persiste via API) e da sombra (cópia LOCAL própria, sem persistir — ela não é um
  // personagem de verdade no banco, só empresta os dados do jogador pra essa luta).
  const [resources, setResources] = useState<CharacterResourceEntry[]>(character.resources)
  const [shadowResources, setShadowResources] = useState<CharacterResourceEntry[]>(character.resources)

  function handleResourceToggle(slug: string, next: number) {
    setResources(prev => prev.map(r => (r.resource.slug === slug ? { ...r, current: next } : r)))
    updateCharacterResource(character.id, slug, next, token).catch(err => console.error('Falha ao atualizar recurso', err))
  }

  const unarmedAbility = character.abilities.find(a => a.slug === 'ataque-desarmado')
    ?? character.abilities.find(a => a.is_innate)
    ?? FALLBACK_UNARMED_ABILITY

  const mainHandItem = character.items.find(i => i.pivot.slot === 'main_hand') ?? null
  const offHandItem = character.items.find(i => i.pivot.slot === 'off_hand_1') ?? null
  const isTwoHanded = Boolean(mainHandItem?.is_two_handed)

  /** Mesmo padrão de `resolveHandActions`/`buildActionCards` da ficha — só ações de
   * ataque de mão nessa passada (sem passivas/outras habilidades na Arena ainda). */
  const handActions: ResolvedHandAction[] = isTwoHanded
    ? resolveHandActions(mainHandItem, unarmedAbility, 'Duas Mãos', 'both')
    : [
        ...resolveHandActions(mainHandItem, unarmedAbility, 'Mão Principal', 'main'),
        ...resolveHandActions(offHandItem, unarmedAbility, 'Mão Auxiliar', 'off'),
      ]

  // Vida de combate = o recurso Coração DE VERDADE (não um número sintético do
  // token) — Estamina/Alma também vêm daqui. `resources` é o do jogador (persiste na
  // ficha de verdade); `shadowResources` é a cópia local da sombra (não persiste).
  const playerCoracao = resourceValue(resources, 'coracao', Math.max(1, Math.round(character.coracao)))
  const shadowCoracao = resourceValue(shadowResources, 'coracao', Math.max(1, Math.round(character.coracao)))
  const battleOver = playerCoracao.current <= 0 || shadowCoracao.current <= 0

  /** Subtrai dano bruto (já resolvido pelo motor real) do recurso Coração de um dos
   * lados, passando primeiro pela absorção de casca (que continua um número "de
   * combate" à parte, desgastando independente pra cada token). */
  function applyDamageToCoracao(side: 'player' | 'shadow', rawDamage: number): number {
    if (rawDamage <= 0) return 0
    const targetToken = side === 'player' ? player : shadow
    const setTargetResources = side === 'player' ? setResources : setShadowResources
    const { damage, remainingCasca } = applyCascaAbsorption(rawDamage, targetToken.casca)

    setTokens(prev => prev.map(t => (t.id === targetToken.id ? { ...t, casca: remainingCasca } : t)))
    setTargetResources(prev => prev.map(r => (r.resource.slug === 'coracao' ? { ...r, current: Math.max(0, r.current - damage) } : r)))
    if (side === 'player') {
      updateCharacterResource(character.id, 'coracao', Math.max(0, playerCoracao.current - damage), token).catch(err => console.error('Falha ao atualizar recurso', err))
    }

    return damage
  }

  /** Aplica o dano resolvido (via `onResolved` do `AbilityCard`) na sombra — mesma
   * absorção de casca que a Arena já usava, só que a partir do dano REAL do motor de
   * habilidades em vez do dano fixo de `ATTACK_OPTIONS`. */
  function applyDamageToShadow(attackerLabel: string, abilityName: string, effects: ResolvedEffect[]) {
    const rawDamage = totalDamageFromEffects(effects)
    if (rawDamage <= 0) return
    const damage = applyDamageToCoracao('shadow', rawDamage)

    triggerHitEffect(shadow.id)
    showBanner(`${shadow.label} -${damage} de vida`)
    logEvent(`${attackerLabel} usa ${abilityName} — ${damage} de dano em ${shadow.label}.`)
  }

  const tokensRef = useRef(tokens)
  const animatingRef = useRef(false)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const avatarImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const avatarFailedRef = useRef<Set<string>>(new Set())
  const hitEffectsRef = useRef<Map<string, number>>(new Map())
  const hitLoopRunningRef = useRef(false)
  const dragStateRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null)
  const suppressClickRef = useRef(false)
  const [imagesVersion, setImagesVersion] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [wallCells] = useState<Set<string>>(() => generateRandomWalls())
  const [floorTiles] = useState<string[][]>(() => generateRandomFloors())

  /** Carrega e cacheia a imagem do avatar; redesenha o canvas quando ela terminar de carregar (ou cai no fallback se falhar). */
  function getAvatarImage(src: string): HTMLImageElement | null {
    if (avatarFailedRef.current.has(src)) return null

    const cache = avatarImagesRef.current
    const cached = cache.get(src)
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null

    const img = new Image()
    img.onload = () => setImagesVersion(v => v + 1)
    img.onerror = () => {
      avatarFailedRef.current.add(src)
      cache.delete(src)
      setImagesVersion(v => v + 1)
    }
    img.src = src
    cache.set(src, img)
    return null
  }

  useEffect(() => {
    tokensRef.current = tokens
  }, [tokens])

  // Garante que os listeners de arrastar (window) não fiquem pendurados se o componente desmontar.
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMouseMove)
      window.removeEventListener('mouseup', handleDragMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só cleanup no unmount
  }, [])

  useEffect(() => {
    bannerTimeoutRef.current = setTimeout(() => setTurnBanner(null), BANNER_DURATION)
    return () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    }
  }, [])

  /** Centraliza a vista no personagem do jogador ao abrir a arena (zoom inicial em 150%). */
  useEffect(() => {
    const viewport = canvasViewportRef.current
    const startingPlayer = tokensRef.current.find(t => !t.isEnemy)
    if (!viewport || !startingPlayer) return

    const focusCol = startingPlayer.large ? startingPlayer.col + 1 : startingPlayer.col + 0.5
    const focusRow = startingPlayer.large ? startingPlayer.row + 1 : startingPlayer.row + 0.5
    viewport.scrollLeft = focusCol * CELL * zoom - viewport.clientWidth / 2
    viewport.scrollTop = focusRow * CELL * zoom - viewport.clientHeight / 2
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só centraliza uma vez, no mount
  }, [])

  function showBanner(text: string, duration = BANNER_DURATION) {
    setTurnBanner(text)
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    bannerTimeoutRef.current = setTimeout(() => setTurnBanner(null), duration)
  }

  /** Loga um evento permanente na ficha de batalha (painel lateral). */
  function logEvent(text: string) {
    setBattleLog(prev => [...prev, text])
  }

  /**
   * Anima os dados 3D com os valores já sorteados por `rollDice` — o resultado
   * (dano, sucessos) já foi calculado antes desta chamada; aqui só reproduz
   * visualmente o mesmo resultado (notação `NdN@v1,v2,...`), sem sortear de novo.
   */
  /** Dispara a animação de tremida + flash vermelho num token atingido. */
  function triggerHitEffect(tokenId: string) {
    hitEffectsRef.current.set(tokenId, performance.now())
    if (!hitLoopRunningRef.current) {
      hitLoopRunningRef.current = true
      requestAnimationFrame(runHitEffectLoop)
    }
  }

  function runHitEffectLoop() {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) {
      hitLoopRunningRef.current = false
      return
    }
    const now = performance.now()
    let stillActive = false
    hitEffectsRef.current.forEach((startTime, id) => {
      if (now - startTime < HIT_EFFECT_DURATION) stillActive = true
      else hitEffectsRef.current.delete(id)
    })
    draw(ctx)
    if (stillActive) {
      requestAnimationFrame(runHitEffectLoop)
    } else {
      hitLoopRunningRef.current = false
    }
  }

  function clearSelection() {
    setSelectedTokenId(null)
  }

  const player = tokens.find(t => !t.isEnemy)!
  const shadow = tokens.find(t => t.isEnemy)!
  const selectedToken = tokens.find(t => t.id === selectedTokenId) ?? null
  const reachable = useMemo(() => {
    if (!selectedToken) return null
    const remaining = selectedToken.movement - selectedToken.movementUsed
    if (remaining <= 0) return null
    return computeReachable(tokens, selectedToken, remaining, wallCells)
  }, [selectedToken, tokens, wallCells])

  const previewPath = useMemo(() => {
    if (!selectedToken || !reachable || !hoverCell) return null
    const key = `${hoverCell.col},${hoverCell.row}`
    const info = reachable.get(key)
    if (!info || info.dist === 0) return null
    return getPath(reachable, `${selectedToken.col},${selectedToken.row}`, key)
  }, [selectedToken, reachable, hoverCell])

  /** Ataque exige corpo a corpo por enquanto (sem alcance à distância tipo Arremesso nessa
   * passada) — mesma exigência de adjacência que o resto da Arena já usa (IA da sombra, etc). */
  const isPlayerAdjacentToShadow = footprintDistanceToCell(tokenCells(player), { col: shadow.col, row: shadow.row }) === 1

  /** Só existe ação real quando o jogador está selecionado E adjacente à sombra —
   * mesmo card cheio (`AbilityCard`) e mesmo motor (`resolveAbilityEffects`) que a
   * ficha usa, com `onResolved` aplicando o dano de verdade na sombra. */
  const actionCards: ActionCardSpec[] = (!battleOver && selectedTokenId === 'player' && isPlayerAdjacentToShadow)
    ? handActions.map(action => {
        const resourceEntry = findResourceEntry(resources, action.ability.resource?.slug)
        const insufficientResource = resourceEntry ? resourceEntry.current < effortCost(action.ability.custo, 1) : false
        const disabledReason = player.attacked
          ? 'Já atacou nesse turno'
          : insufficientResource ? `${resourceEntry!.resource.name} insuficiente` : null

        return {
          key: action.key,
          icon: action.icon,
          name: action.name,
          disabled: disabledReason !== null,
          disabledReason,
          node: (
            <AbilityCard
              key={action.key}
              icon={action.icon}
              name={action.name}
              tipo={action.tipo}
              atributo={action.ability.atributo}
              atributos={character}
              resources={resources}
              resourceEntry={resourceEntry}
              description={action.ability.description}
              custo={action.ability.custo}
              ability={action.ability}
              itemRef={action.itemRef}
              characterName={character.name}
              locked={player.attacked}
              buildAppearances={myAppearances}
              onSpendResource={handleResourceToggle}
              onEffortUsed={() => setTokens(prev => prev.map(t => (t.id === 'player' ? { ...t, attacked: true } : t)))}
              onResolved={effects => applyDamageToShadow(player.label, action.ability.name, effects)}
            />
          ),
        }
      })
    : []

  function drawToken(ctx: CanvasRenderingContext2D, token: ArenaToken, col: number, row: number, isSelected: boolean) {
    const wide = !!token.large
    const baseCx = wide ? col * CELL + CELL : col * CELL + CELL / 2
    const baseCy = wide ? row * CELL + CELL : row * CELL + CELL / 2
    const radiusX = wide ? CELL * 0.85 : CELL * 0.4
    const radiusY = wide ? CELL * 0.85 : CELL * 0.4

    // Tremida + flash vermelho enquanto o token estiver "machucado" (ver triggerHitEffect).
    const hitStart = hitEffectsRef.current.get(token.id)
    let shakeX = 0
    let shakeY = 0
    let flashAlpha = 0
    if (hitStart !== undefined) {
      const elapsed = performance.now() - hitStart
      const progress = Math.min(1, elapsed / HIT_EFFECT_DURATION)
      const decay = 1 - progress
      shakeX = Math.sin(elapsed * 0.05) * 10 * decay
      shakeY = Math.cos(elapsed * 0.035) * 5 * decay
      flashAlpha = decay * 0.75
    }

    const cx = baseCx + shakeX
    const cy = baseCy + shakeY
    const avatarImg = token.avatar ? getAvatarImage(token.avatar) : null

    if (avatarImg) {
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatarImg, cx - radiusX, cy - radiusY, radiusX * 2, radiusY * 2)
      ctx.restore()

      ctx.strokeStyle = isSelected ? 'rgba(240, 209, 138, 0.95)' : 'rgba(0,0,0,0.55)'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = token.color
      ctx.strokeStyle = isSelected ? 'rgba(240, 209, 138, 0.95)' : 'rgba(0,0,0,0.55)'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = `${Math.round(CELL * 0.4)}px var(--font-cinzel), serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(token.label.slice(0, 2), cx, cy + 1)
    }

    if (flashAlpha > 0) {
      ctx.save()
      ctx.globalAlpha = flashAlpha
      ctx.fillStyle = '#ff3b3b'
      ctx.beginPath()
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function draw(ctx: CanvasRenderingContext2D, overrideId?: string, overrideCol?: number, overrideRow?: number) {
    const width = COLS * CELL
    const height = ROWS * CELL

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = floorTiles[r][c]
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL)
      }
    }

    ctx.strokeStyle = 'rgba(184, 146, 74, 0.25)'
    ctx.lineWidth = 1
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath()
      ctx.moveTo(c * CELL + 0.5, 0)
      ctx.lineTo(c * CELL + 0.5, height)
      ctx.stroke()
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath()
      ctx.moveTo(0, r * CELL + 0.5)
      ctx.lineTo(width, r * CELL + 0.5)
      ctx.stroke()
    }

    wallCells.forEach(key => {
      const [c, r] = key.split(',').map(Number)
      const x = c * CELL
      const y = r * CELL
      ctx.fillStyle = '#121215'
      ctx.fillRect(x, y, CELL, CELL)
      ctx.strokeStyle = 'rgba(184, 146, 74, 0.35)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + CELL, y + CELL)
      ctx.moveTo(x + CELL, y)
      ctx.lineTo(x, y + CELL)
      ctx.stroke()
    })

    if (reachable) {
      ctx.fillStyle = 'rgba(106, 130, 184, 0.35)'
      ctx.strokeStyle = 'rgba(106, 130, 184, 0.7)'
      reachable.forEach((info, key) => {
        if (info.dist === 0) return
        const [c, r] = key.split(',').map(Number)
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL)
        ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1)
      })
    }

    if (previewPath && previewPath.length > 1) {
      ctx.strokeStyle = 'rgba(240, 209, 138, 0.9)'
      ctx.lineWidth = 3
      ctx.setLineDash([6, 5])
      ctx.beginPath()
      previewPath.forEach((cell, i) => {
        const x = cell.col * CELL + CELL / 2
        const y = cell.row * CELL + CELL / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])
    }

    tokensRef.current.forEach(t => {
      const isOverride = t.id === overrideId
      const col = isOverride ? overrideCol! : t.col
      const row = isOverride ? overrideRow! : t.row
      drawToken(ctx, t, col, row, t.id === selectedTokenId)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = COLS * CELL
    canvas.height = ROWS * CELL
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw closes over these same deps, re-declared each render
  }, [tokens, reachable, selectedTokenId, previewPath, imagesVersion])

  function tweenStep(from: Cell, to: Cell, duration: number, onFrame: (col: number, row: number) => void, onDone: () => void) {
    const start = performance.now()
    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = easeInOutQuad(t)
      onFrame(from.col + (to.col - from.col) * eased, from.row + (to.row - from.row) * eased)
      if (t < 1) requestAnimationFrame(frame)
      else onDone()
    }
    requestAnimationFrame(frame)
  }

  function animatePath(id: string, path: Cell[], stepDuration: number, onDone: () => void) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || path.length < 2) {
      onDone()
      return
    }
    animatingRef.current = true
    setIsAnimating(true)

    let i = 0
    function step() {
      if (i >= path.length - 1) {
        animatingRef.current = false
        setIsAnimating(false)
        onDone()
        return
      }
      tweenStep(
        path[i],
        path[i + 1],
        stepDuration,
        (col, row) => {
          if (ctx) draw(ctx, id, col, row)
        },
        () => {
          i += 1
          step()
        }
      )
    }
    step()
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (animatingRef.current || battleOver) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS)
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return

    if (selectedToken && reachable) {
      const key = `${col},${row}`
      const info = reachable.get(key)
      if (info && info.dist > 0) {
        const id = selectedToken.id
        const path = getPath(reachable, `${selectedToken.col},${selectedToken.row}`, key)
        setSelectedTokenId(null)
        setHoverCell(null)
        animatePath(id, path, 180, () => {
          setTokens(prev => prev.map(t => (t.id === id ? { ...t, col, row, movementUsed: t.movementUsed + info.dist } : t)))
        })
        return
      }
      setSelectedTokenId(null)
      return
    }

    const clicked = tokens.find(t => occupiesCell(t, col, row))
    if (clicked && !clicked.isEnemy) {
      setSelectedTokenId(prev => (prev === clicked.id ? null : clicked.id))
    } else {
      clearSelection()
    }
  }

  function handleCanvasWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault()
    setZoom(z => Math.min(4, Math.max(0.5, z - e.deltaY * 0.002)))
  }

  /** Clique + arrastar pra mover a "câmera" — o scroll nativo fica travado (overflow: hidden). */
  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const viewport = canvasViewportRef.current
    if (!viewport) return
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    }
    setIsDragging(true)
    window.addEventListener('mousemove', handleDragMouseMove)
    window.addEventListener('mouseup', handleDragMouseUp)
  }

  function handleDragMouseMove(e: MouseEvent) {
    const state = dragStateRef.current
    const viewport = canvasViewportRef.current
    if (!state || !viewport) return
    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY
    if (!suppressClickRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) suppressClickRef.current = true
    viewport.scrollLeft = state.scrollLeft - dx
    viewport.scrollTop = state.scrollTop - dy
  }

  function handleDragMouseUp() {
    dragStateRef.current = null
    setIsDragging(false)
    window.removeEventListener('mousemove', handleDragMouseMove)
    window.removeEventListener('mouseup', handleDragMouseUp)
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!selectedToken || !reachable) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS)
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)
    setHoverCell(prev => (prev && prev.col === col && prev.row === row ? prev : { col, row }))
  }

  /**
   * IA básica da sombra: escolhe a primeira ação de ATAQUE disponível (mesmas mãos/
   * habilidades do jogador, já calculadas em `handActions` — é literalmente a mesma
   * pessoa), rola no nível de Esforço 1 fixo (sem escalar — "básica") e resolve pelo
   * MESMO motor real (`resolveAbilityEffects`), gastando do recurso próprio da sombra
   * (`shadowResources`, não o do jogador). Sem checagem de recurso suficiente — a IA
   * básica sempre tenta atacar.
   */
  function computeShadowAttack(): { rolls: number[]; abilityName: string; effects: ResolvedEffect[] } | null {
    const attackAction = handActions.find(a => a.tipo === 'Ataque')
    if (!attackAction) return null

    const ability = attackAction.ability
    const baseDice = Math.max(1, ability.atributo ? Math.round(character[ability.atributo]) : 1)
    const dice = rollDice(baseDice)
    const hits = dice.filter(d => d >= SUCCESS_THRESHOLD).length

    const itemRef = attackAction.itemRef
    const ctx: RollContext = {
      hits,
      weapon_base_damage: itemRef?.base_damage ?? null,
      weapon_block_value: itemRef?.block_value ?? null,
      weapon_weight: itemRef ? Number(itemRef.weight) : null,
    }
    const effects = resolveAbilityEffects(ability, character, shadowResources, ctx)

    const resourceEntry = findResourceEntry(shadowResources, ability.resource?.slug)
    if (resourceEntry) {
      const cost = effortCost(ability.custo, 1)
      setShadowResources(prev => prev.map(r => (r.resource.slug === resourceEntry.resource.slug ? { ...r, current: Math.max(0, r.current - cost) } : r)))
    }

    return { rolls: dice, abilityName: ability.name, effects }
  }

  function handleEndTurn() {
    if (animatingRef.current || battleOver) return
    clearSelection()
    setHoverCell(null)
    showBanner('Turno da sombra')
    logEvent(`Fim do turno de ${character.name}.`)

    const current = tokensRef.current
    const currentPlayer = current.find(t => !t.isEnemy)
    const currentShadow = current.find(t => t.isEnemy)

    function finish(finalPos: Cell) {
      const isAdjacent = currentPlayer ? footprintDistanceToCell(tokenCells(currentPlayer), finalPos) === 1 : false

      // Calculado uma vez fora do closure de setTokens (não depende de qual token o
      // .map() está visitando) — evita o TS perder a narrowing de um `let` reatribuído
      // dentro de uma closure passada pro setState.
      const attack = isAdjacent && currentPlayer && currentShadow
        ? (() => {
            const computed = computeShadowAttack()
            if (!computed) return null
            const rawDamage = totalDamageFromEffects(computed.effects)
            return { rolls: computed.rolls, abilityName: computed.abilityName, hit: rawDamage > 0, rawDamage }
          })()
        : null

      // Só posição/reset de turno aqui — o dano de verdade vai pro recurso Coração
      // via `applyDamageToCoracao` (que já mexe em `tokens`/`resources` sozinho).
      setTokens(prev =>
        prev.map(t => {
          if (currentShadow && t.id === currentShadow.id) return { ...t, col: finalPos.col, row: finalPos.row }
          if (t.isEnemy) return t
          return { ...t, movementUsed: 0, attacked: false }
        })
      )

      let shadowAttackMessage: string | null = null
      let shadowLogMessage: string | null = null
      let appliedDamage = 0

      if (attack?.hit) {
        appliedDamage = applyDamageToCoracao('player', attack.rawDamage)
        shadowAttackMessage = `A sombra atacou! Você perde ${appliedDamage} de vida`
        shadowLogMessage = `${currentShadow!.label} usa ${attack.abilityName} — ${appliedDamage} de dano em você.`
      } else if (attack) {
        shadowAttackMessage = 'A sombra atacou e errou!'
        shadowLogMessage = `${currentShadow!.label} usa ${attack.abilityName} e erra`
      }

      setTurn(t => t + 1)
      if (attack) {
        const resultText = attack.hit ? `Você sofreu ${appliedDamage} de dano.` : 'A sombra errou o ataque.'
        diceStage.showDiceRoll(attack.rolls, `${currentShadow?.label ?? 'Sombra'} usa ${attack.abilityName}`, resultText, defaultAppearances(attack.rolls.length))
        if (attack.hit && currentPlayer) triggerHitEffect(currentPlayer.id)
      }
      if (shadowLogMessage) logEvent(shadowLogMessage)
      logEvent(`Turno ${turn + 1} — vez de ${character.name}.`)
      if (shadowAttackMessage) {
        showBanner(shadowAttackMessage, 1900)
        setTimeout(() => showBanner(`Turno de ${character.name}`), 2000)
      } else {
        showBanner(`Turno de ${character.name}`)
      }
    }

    if (!currentPlayer || !currentShadow) {
      setTokens(prev => prev.map(t => (t.isEnemy ? t : { ...t, movementUsed: 0, attacked: false })))
      setTurn(t => t + 1)
      showBanner(`Turno de ${character.name}`)
      return
    }

    const isAdjacentToPlayer = (cell: Cell) => footprintDistanceToCell(tokenCells(currentPlayer), cell) === 1
    const start = { col: currentShadow.col, row: currentShadow.row }
    const fullPath = bfsPathTo(current, currentShadow.id, start, isAdjacentToPlayer, wallCells)
    const path = fullPath ? fullPath.slice(0, Math.min(currentShadow.movement, fullPath.length - 1) + 1) : null

    if (!path || path.length < 2) {
      finish(path ? path[0] : start)
      return
    }

    animatePath(currentShadow.id, path, 180, () => finish(path[path.length - 1]))
  }

  // UI de status compartilhada (vista por todo mundo) — jogador e sombra são "a mesma
  // pessoa", então usam os mesmos atributos completos (`character`); Coração/Estamina/
  // Alma vêm dos recursos DE VERDADE da ficha (`resources`/`shadowResources`), não de
  // um número sintético do token.
  const playerEstamina = resourceValue(resources, 'estamina', Math.max(1, Math.round(character.estamina)))
  const playerAlma = resourceValue(resources, 'alma', Math.max(1, Math.round(character.alma)))
  const shadowEstamina = resourceValue(shadowResources, 'estamina', Math.max(1, Math.round(character.estamina)))
  const shadowAlma = resourceValue(shadowResources, 'alma', Math.max(1, Math.round(character.alma)))

  const partyMembers: PartyMemberStatus[] = [
    {
      id: 'player', name: character.name, avatar: character.avatar, atributos: character,
      vitals: [
        { key: 'coracao', label: 'Coração', icon: '❤️', emptyIcon: '🤍', current: playerCoracao.current, max: playerCoracao.max, color: 'var(--error)' },
        { key: 'estamina', label: 'Estamina', icon: '⚡', emptyIcon: '◽', current: playerEstamina.current, max: playerEstamina.max, color: 'var(--gold)' },
        { key: 'alma', label: 'Alma', icon: '🔮', emptyIcon: '⚪', current: playerAlma.current, max: playerAlma.max, color: 'var(--void-glow)' },
      ],
    },
    {
      id: 'shadow', name: `Sombra de ${character.name}`, avatar: character.avatar, atributos: character,
      vitals: [
        { key: 'coracao', label: 'Coração', icon: '❤️', emptyIcon: '🤍', current: shadowCoracao.current, max: shadowCoracao.max, color: 'var(--error)' },
        { key: 'estamina', label: 'Estamina', icon: '⚡', emptyIcon: '◽', current: shadowEstamina.current, max: shadowEstamina.max, color: 'var(--gold)' },
        { key: 'alma', label: 'Alma', icon: '🔮', emptyIcon: '⚪', current: shadowAlma.current, max: shadowAlma.max, color: 'var(--void-glow)' },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            Lute contra você mesmo — {character.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Clique no seu personagem para mover; fique adjacente à sombra pra ver suas ações de ataque. Arraste o mapa pra navegar e use a roda do mouse pra dar zoom.
          </p>
        </div>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={onExit}>
          Voltar
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', color: 'var(--text)' }}>Turno {turn}</span>
      </div>
      <PartyStatusBar members={partyMembers} />

      <div className="flex gap-4 flex-wrap items-start">
        <div className="ddb-panel p-3 flex-1" style={{ minWidth: 320, position: 'relative' }}>
          <div
            ref={canvasViewportRef}
            style={{ width: '100%', height: VIEWPORT_HEIGHT, overflow: 'hidden' }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoverCell(null)}
              onWheel={handleCanvasWheel}
              style={{
                display: 'block',
                cursor: isDragging ? 'grabbing' : 'grab',
                width: COLS * CELL * zoom,
                height: ROWS * CELL * zoom,
                userSelect: 'none',
              }}
            />
          </div>

          {turnBanner && (
            <div
              className="ddb-panel parchment p-3 flex items-center justify-center"
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                minWidth: 200,
                textAlign: 'center',
              }}
            >
              <span className="gold-glow" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '0.03em' }}>
                {turnBanner}
              </span>
            </div>
          )}
        </div>

        <BattleLog entries={battleLog} height={ROWS * CELL + 24} />
      </div>

      <div
        className="ddb-panel parchment p-3 flex items-center gap-3 flex-wrap"
        style={{ position: 'sticky', bottom: 12, zIndex: 30 }}
      >
        {battleOver ? (
          <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.85rem', color: shadowCoracao.current <= 0 ? 'var(--gold)' : 'var(--error)' }}>
            {shadowCoracao.current <= 0 ? 'Você venceu! A sombra caiu.' : 'Você foi derrotado pela sua sombra...'}
          </span>
        ) : !selectedToken ? (
          <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Clique no seu personagem para mover ou atacar.
          </span>
        ) : selectedToken.id === 'player' ? (
          <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isPlayerAdjacentToShadow
              ? 'Clique numa célula destacada para mover, ou ataque pela barra de ação.'
              : 'Clique numa célula destacada para mover — fique adjacente à sombra pra atacar.'}
          </span>
        ) : null}
      </div>

      {/* Barra de ação — PRIVADA, só o jogador vê. "Cancelar seleção"/"Passar turno"
          ficam nas pontas, afastados dos ícones de habilidade no meio. */}
      <ActionBar
        isMyTurn={!isAnimating && !battleOver}
        mode="attack"
        actionCards={actionCards}
        onCancelSelection={selectedToken?.id === 'player' ? clearSelection : undefined}
        onEndTurn={handleEndTurn}
      />
    </div>
  )
}

