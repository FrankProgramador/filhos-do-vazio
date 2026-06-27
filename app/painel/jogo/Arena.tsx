'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Character } from '@/app/lib/gameData'

type ArenaToken = {
  id: string
  label: string
  color: string
  col: number
  row: number
  movement: number
  movementUsed: number
  hp: number
  maxHp: number
  poder: number
  casca: number
  estaminaMax: number
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

type AttackOption = { id: string; label: string; range: number; baseDamage: number }

const ATTACK_OPTIONS: AttackOption[] = [
  { id: 'unarmed', label: 'Desarmado', range: 1, baseDamage: 1 },
  { id: 'rock', label: 'Jogar pedra', range: 6, baseDamage: 1 },
]

const SUCCESS_THRESHOLD = 5
const HIT_EFFECT_DURATION = 500
const DICE_DISPLAY_DURATION = 1700
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
 * 1º sucesso aplica o dano base da opção de ataque; cada sucesso extra soma +1 — esse é o dano bruto.
 * A casca do defensor funciona como um escudo que se desgasta: absorve o dano bruto até se
 * esgotar; o que passar disso ("excedente") é o dano real, aplicado à vida. Um acerto sempre
 * causa pelo menos 1 de dano real, mesmo que a casca absorva todo o resto.
 */
function resolveDamage(rolls: number[], baseDamage: number, defenderCasca: number) {
  const successes = rolls.filter(roll => roll >= SUCCESS_THRESHOLD).length

  if (successes === 0) {
    return { successes: 0, rawDamage: 0, damage: 0, hit: false, remainingCasca: defenderCasca }
  }

  const rawDamage = baseDamage + (successes - 1)
  const cascaAbsorbed = Math.min(rawDamage, defenderCasca)
  const overflow = rawDamage - cascaAbsorbed
  const damage = Math.max(1, overflow)

  return { successes, rawDamage, damage, hit: true, remainingCasca: defenderCasca - cascaAbsorbed }
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
      hp: 4,
      maxHp: 4,
      poder: character.poder,
      casca: character.casca,
      estaminaMax: character.estamina,
      attacked: false,
      avatar: character.avatar,
      large: character.size?.slug === 'grande',
    },
    {
      id: 'enemy',
      label: 'E',
      color: '#a34a4a',
      col: 15,
      row: 7,
      movement: 3,
      movementUsed: 0,
      hp: 4,
      maxHp: 4,
      isEnemy: true,
      poder: randomBetween(2, 3),
      casca: randomBetween(2, 3),
      estaminaMax: randomBetween(2, 3),
      attacked: false,
    },
  ])
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [pendingAttackOption, setPendingAttackOption] = useState<{ tokenId: string; option: AttackOption } | null>(null)
  const [selectedAttack, setSelectedAttack] = useState<{ tokenId: string; option: AttackOption; stamina: number } | null>(null)
  const [hoverCell, setHoverCell] = useState<Cell | null>(null)
  const [turn, setTurn] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [turnBanner, setTurnBanner] = useState<string | null>(() => `Turno de ${character.name}`)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [battleLog, setBattleLog] = useState<string[]>([`Turno 1 — vez de ${character.name}.`])
  const [diceDisplay, setDiceDisplay] = useState<{ rolls: number[]; key: number } | null>(null)
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const tokensRef = useRef(tokens)
  const animatingRef = useRef(false)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const diceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  /** Mostra os dados rolados sobre o campo por alguns instantes. */
  function showDiceRoll(rolls: number[]) {
    setDiceDisplay({ rolls, key: Date.now() })
    if (diceTimeoutRef.current) clearTimeout(diceTimeoutRef.current)
    diceTimeoutRef.current = setTimeout(() => setDiceDisplay(null), DICE_DISPLAY_DURATION)
  }

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
    setPendingAttackOption(null)
    setSelectedAttack(null)
  }

  const player = tokens.find(t => !t.isEnemy)!
  const enemy = tokens.find(t => t.isEnemy)!
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

  const attackRange = useMemo(() => {
    if (!selectedAttack) return null
    const attacker = tokens.find(t => t.id === selectedAttack.tokenId)
    if (!attacker) return null
    const attackerCells = tokenCells(attacker)
    const cells: Cell[] = []
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (wallCells.has(`${c},${r}`)) continue
        if (occupiesCell(attacker, c, r)) continue
        const d = footprintDistanceToCell(attackerCells, { col: c, row: r })
        if (d <= selectedAttack.option.range) cells.push({ col: c, row: r })
      }
    }
    return cells
  }, [selectedAttack, tokens, wallCells])

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

    if (attackRange) {
      ctx.fillStyle = 'rgba(163, 74, 74, 0.35)'
      ctx.strokeStyle = 'rgba(163, 74, 74, 0.75)'
      attackRange.forEach(({ col, row }) => {
        ctx.fillRect(col * CELL, row * CELL, CELL, CELL)
        ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1)
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
  }, [tokens, reachable, selectedTokenId, previewPath, attackRange, imagesVersion])

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
    if (animatingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS)
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return

    if (selectedAttack) {
      const attacker = tokens.find(t => t.id === selectedAttack.tokenId)
      const inRange = attacker && footprintDistanceToCell(tokenCells(attacker), { col, row }) <= selectedAttack.option.range
      const target = inRange ? tokens.find(t => t.id !== attacker!.id && occupiesCell(t, col, row)) : undefined
      if (target && attacker) {
        const rolls = rollDice(selectedAttack.stamina + attacker.poder)
        const result = resolveDamage(rolls, selectedAttack.option.baseDamage, target.casca)
        const rollsText = rolls.join(', ')

        setTokens(prev =>
          prev.map(t => {
            if (t.id === attacker.id) return { ...t, attacked: true }
            if (t.id === target.id && result.hit) {
              return { ...t, hp: Math.max(0, t.hp - result.damage), casca: result.remainingCasca }
            }
            return t
          })
        )

        showDiceRoll(rolls)
        if (result.hit) triggerHitEffect(target.id)

        const message = result.hit
          ? `${attacker.label} usa ${selectedAttack.option.label}: ${result.successes} sucesso(s) [${rollsText}] — ${result.damage} de dano em ${target.label} (casca restante: ${result.remainingCasca})`
          : `${attacker.label} usa ${selectedAttack.option.label} e erra [${rollsText}]`
        showBanner(result.hit ? `${target.label} -${result.damage} de vida` : 'Errou!')
        logEvent(message)
      }
      setSelectedAttack(null)
      return
    }

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
      setPendingAttackOption(null)
      setSelectedAttack(null)
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

  function handleSelectAttack(option: AttackOption) {
    if (!selectedToken) return
    setPendingAttackOption({ tokenId: selectedToken.id, option })
  }

  function handleSelectStamina(stamina: number) {
    if (!pendingAttackOption) return
    setSelectedAttack({ tokenId: pendingAttackOption.tokenId, option: pendingAttackOption.option, stamina })
    setPendingAttackOption(null)
  }

  function handleEndTurn() {
    if (animatingRef.current) return
    clearSelection()
    setHoverCell(null)
    showBanner('Turno do inimigo')
    logEvent(`Fim do turno de ${character.name}.`)

    const current = tokensRef.current
    const currentPlayer = current.find(t => !t.isEnemy)
    const currentEnemy = current.find(t => t.isEnemy)

    function finish(finalPos: Cell) {
      const isAdjacent = currentPlayer ? footprintDistanceToCell(tokenCells(currentPlayer), finalPos) === 1 : false
      let enemyAttackMessage: string | null = null
      let enemyLogMessage: string | null = null
      let enemyRolls: number[] | null = null
      let enemyHitTargetId: string | null = null

      setTokens(prev =>
        prev.map(t => {
          if (currentEnemy && t.id === currentEnemy.id) return { ...t, col: finalPos.col, row: finalPos.row }
          if (t.isEnemy) return t

          const resetToken = { ...t, movementUsed: 0, attacked: false }
          if (!isAdjacent || !currentEnemy) return resetToken

          const rolls = rollDice(currentEnemy.estaminaMax + currentEnemy.poder)
          const result = resolveDamage(rolls, 1, t.casca)
          const rollsText = rolls.join(', ')
          enemyRolls = rolls

          if (!result.hit) {
            enemyAttackMessage = 'O inimigo atacou e errou!'
            enemyLogMessage = `${currentEnemy.label} ataca e erra [${rollsText}]`
            return resetToken
          }

          enemyAttackMessage = `O inimigo atacou! Você perde ${result.damage} de vida`
          enemyLogMessage = `${currentEnemy.label} ataca: ${result.successes} sucesso(s) [${rollsText}] — ${result.damage} de dano em ${t.label} (casca restante: ${result.remainingCasca})`
          enemyHitTargetId = t.id
          return { ...resetToken, hp: Math.max(0, t.hp - result.damage), casca: result.remainingCasca }
        })
      )
      setTurn(t => t + 1)
      if (enemyRolls) showDiceRoll(enemyRolls)
      if (enemyHitTargetId) triggerHitEffect(enemyHitTargetId)
      if (enemyLogMessage) logEvent(enemyLogMessage)
      logEvent(`Turno ${turn + 1} — vez de ${character.name}.`)
      if (enemyAttackMessage) {
        showBanner(enemyAttackMessage, 1900)
        setTimeout(() => showBanner(`Turno de ${character.name}`), 2000)
      } else {
        showBanner(`Turno de ${character.name}`)
      }
    }

    if (!currentPlayer || !currentEnemy) {
      setTokens(prev => prev.map(t => (t.isEnemy ? t : { ...t, movementUsed: 0, attacked: false })))
      setTurn(t => t + 1)
      showBanner(`Turno de ${character.name}`)
      return
    }

    const isAdjacentToPlayer = (cell: Cell) => footprintDistanceToCell(tokenCells(currentPlayer), cell) === 1
    const start = { col: currentEnemy.col, row: currentEnemy.row }
    const fullPath = bfsPathTo(current, currentEnemy.id, start, isAdjacentToPlayer, wallCells)
    const path = fullPath ? fullPath.slice(0, Math.min(currentEnemy.movement, fullPath.length - 1) + 1) : null

    if (!path || path.length < 2) {
      finish(path ? path[0] : start)
      return
    }

    animatePath(currentEnemy.id, path, 180, () => finish(path[path.length - 1]))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            Arena de teste — {character.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Clique no seu personagem para mover ou atacar. Arraste o mapa pra navegar e use a roda do mouse pra dar zoom.
          </p>
        </div>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={onExit}>
          Voltar
        </button>
      </div>

      <div className="ddb-panel p-2 flex items-center gap-4 flex-wrap" style={{ width: 'fit-content' }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', color: 'var(--text)' }}>Turno {turn}</span>
        <HeartBar label={character.name} hp={player.hp} maxHp={player.maxHp} />
        <StatLine poder={player.poder} casca={player.casca} estamina={player.estaminaMax} />
        <HeartBar label="Inimigo" hp={enemy.hp} maxHp={enemy.maxHp} />
        <StatLine poder={enemy.poder} casca={enemy.casca} estamina={enemy.estaminaMax} />
      </div>

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

          {diceDisplay && (
            <div
              key={diceDisplay.key}
              className="dice-tray"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 25,
                display: 'flex',
                gap: 6,
                padding: 10,
                borderRadius: 10,
                background: 'rgba(var(--bg-rgb),0.85)',
                border: '1px solid rgba(var(--gold-rgb),0.35)',
              }}
            >
              {diceDisplay.rolls.map((roll, i) => (
                <span
                  key={i}
                  className="die-face"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    background: roll >= SUCCESS_THRESHOLD ? 'rgba(var(--success-rgb),0.18)' : 'rgba(var(--bg-secondary-rgb),0.9)',
                    borderColor: roll >= SUCCESS_THRESHOLD ? 'var(--success)' : 'rgba(var(--gold-rgb),0.3)',
                    color: roll >= SUCCESS_THRESHOLD ? 'var(--success)' : 'var(--text)',
                  }}
                >
                  {roll}
                </span>
              ))}
            </div>
          )}

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

        <BattleLog entries={battleLog} />
      </div>

      <div
        className="ddb-panel parchment p-3 flex items-center gap-3 flex-wrap"
        style={{ position: 'sticky', bottom: 12, zIndex: 30 }}
      >
        {!selectedToken && (
          <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Clique no seu personagem para mover ou atacar.
          </span>
        )}

        {selectedToken && !pendingAttackOption && !selectedAttack && (
          <>
            <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Clique numa célula destacada para mover, ou ataque:
            </span>
            {ATTACK_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs"
                onClick={() => handleSelectAttack(option)}
                disabled={selectedToken.attacked}
              >
                {option.label}
              </button>
            ))}
            {selectedToken.attacked && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(já atacou neste turno)</span>
            )}
            <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={clearSelection}>
              Cancelar seleção
            </button>
          </>
        )}

        {pendingAttackOption && (() => {
          const attacker = tokens.find(t => t.id === pendingAttackOption.tokenId)
          if (!attacker) return null
          return (
            <>
              <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Quanta estamina gastar?
              </span>
              {Array.from({ length: attacker.estaminaMax }, (_, i) => i + 1).map(stamina => (
                <button
                  key={stamina}
                  type="button"
                  className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs"
                  onClick={() => handleSelectStamina(stamina)}
                >
                  {stamina} {stamina === 1 ? 'ponto' : 'pontos'} · {stamina + attacker.poder} dados
                </button>
              ))}
              <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={() => setPendingAttackOption(null)}>
                Cancelar
              </button>
            </>
          )
        })()}

        {selectedAttack && (
          <>
            <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Clique no alvo destacado em vermelho para atacar com {selectedAttack.option.label}.
            </span>
            <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={() => setSelectedAttack(null)}>
              Cancelar
            </button>
          </>
        )}

        <button
          type="button"
          className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs ml-auto"
          onClick={handleEndTurn}
          disabled={isAnimating}
        >
          Pular turno
        </button>
      </div>
    </div>
  )
}

function BattleLog({ entries }: { entries: string[] }) {
  return (
    <div className="ddb-panel parchment p-3 flex flex-col gap-2" style={{ width: 280, maxHeight: ROWS * CELL + 24 }}>
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
      <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: ROWS * CELL - 24 }}>
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

function StatLine({ poder, casca, estamina }: { poder: number; casca: number; estamina: number }) {
  return (
    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
      Poder {poder} · Casca {casca} · Estamina {estamina}
    </span>
  )
}

function HeartBar({ label, hp, maxHp }: { label: string; hp: number; maxHp: number }) {
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
