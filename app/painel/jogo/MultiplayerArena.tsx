'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { attackArenaToken, endArenaTurn, fetchArenaMatch, moveArenaToken, type ArenaDiceSkinAppearance, type ArenaMatchState, type ArenaToken } from '@/app/lib/arenaApi'
import type { DiceAppearance } from '@/app/lib/dice/diceEngine'
import { BattleLog, HeartBar, triangularCost } from './shared'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'

/** Servidor manda snake_case (`pip_style`); o motor de dados espera camelCase (`pipStyle`). */
function toDiceAppearances(skins: ArenaDiceSkinAppearance[]): DiceAppearance[] {
  return skins.map(s => ({ foreground: s.foreground, background: s.background, material: s.material, texture: s.texture, pipStyle: s.pip_style }))
}

type Cell = { col: number; row: number }
type ReachableInfo = { dist: number; parent: string | null }
type AttackOption = { id: string; label: string; range: number }

const COLS = 20
const ROWS = 14
const CELL = 40
const MOVE_DIRECTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const POLL_MS = 1300
const BANNER_DURATION = 1800
const MIN_ZOOM = 0.6
const MAX_ZOOM = 2.5

const WALL_COL = 9
const WALL_CELLS = new Set(Array.from({ length: 11 }, (_, row) => `${WALL_COL},${row}`))

const ATTACK_OPTIONS: AttackOption[] = [
  { id: 'unarmed', label: 'Desarmado', range: 1 },
  { id: 'rock', label: 'Jogar pedra', range: 6 },
]

/** Distância "de rei" (8 direções) — mesma regra do backend (ArenaRules::chebyshev) pro alcance de ataque, que acerta na diagonal. */
function chebyshev(a: Cell, b: Cell) {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row))
}

function isWalkable(tokens: ArenaToken[], ignoreId: number, col: number, row: number) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false
  if (WALL_CELLS.has(`${col},${row}`)) return false
  if (tokens.some(t => t.id !== ignoreId && t.col === col && t.row === row)) return false
  return true
}

function computeReachable(tokens: ArenaToken[], token: ArenaToken, maxRange: number) {
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
      if (!isWalkable(tokens, token.id, nc, nr)) continue
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

/** Unlimited-range BFS to a specific cell — used to animate a remote player's move along a sensible route. */
function bfsPathTo(tokens: ArenaToken[], ignoreId: number, start: Cell, goal: Cell): Cell[] {
  if (start.col === goal.col && start.row === goal.row) return [start]
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
      if (!isWalkable(tokens, ignoreId, next.col, next.row) && key !== `${goal.col},${goal.row}`) continue
      parent.set(key, curKey)
      if (next.col === goal.col && next.row === goal.row) {
        foundKey = key
        break
      }
      queue.push(next)
    }
  }

  if (!foundKey) return [start, goal]
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

export default function MultiplayerArena({ matchId, onExit }: { matchId: number; onExit: () => void }) {
  const { token, user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [match, setMatch] = useState<ArenaMatchState | null>(null)
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [attackMenuOpen, setAttackMenuOpen] = useState(false)
  const [pendingAttack, setPendingAttack] = useState<{ tokenId: number; option: AttackOption } | null>(null)
  const [selectedAttack, setSelectedAttack] = useState<{ tokenId: number; option: AttackOption; stamina: number } | null>(null)
  const [hoverCell, setHoverCell] = useState<Cell | null>(null)
  const [actionBanner, setActionBanner] = useState<string | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>(['Aguardando o início da partida...'])
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)

  const diceStage = useDiceStageContext()
  const matchRef = useRef<ArenaMatchState | null>(null)
  const lastPositionsRef = useRef<Record<number, Cell>>({})
  const lastSeenTurnRef = useRef<number | null>(null)
  const lastSeenAttackSequenceRef = useRef<number | null>(null)
  const animatingRef = useRef(false)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const justPannedRef = useRef(false)

  function logEvent(text: string) {
    setBattleLog(prev => [...prev, text])
  }

  function showActionBanner(text: string) {
    setActionBanner(text)
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    bannerTimeoutRef.current = setTimeout(() => setActionBanner(null), BANNER_DURATION)
  }

  function closeMenus() {
    setAttackMenuOpen(false)
    setPendingAttack(null)
  }

  const tokens = useMemo(() => match?.tokens ?? [], [match])
  const myToken = tokens.find(t => t.user_id === user?.id) ?? null
  const opponentToken = tokens.find(t => t.user_id !== user?.id) ?? null
  const isMyTurn = !!myToken && match?.current_token_id === myToken.id && match?.status === 'active'

  const selectedToken = tokens.find(t => t.id === selectedTokenId) ?? null
  const reachable = useMemo(() => {
    if (!selectedToken) return null
    const remaining = selectedToken.movement - selectedToken.movement_used
    if (remaining <= 0) return null
    return computeReachable(tokens, selectedToken, remaining)
  }, [selectedToken, tokens])

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
    const cells: Cell[] = []
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (WALL_CELLS.has(`${c},${r}`)) continue
        const d = chebyshev({ col: attacker.col, row: attacker.row }, { col: c, row: r })
        if (d > 0 && d <= selectedAttack.option.range) cells.push({ col: c, row: r })
      }
    }
    return cells
  }, [selectedAttack, tokens])

  function drawToken(ctx: CanvasRenderingContext2D, t: ArenaToken, col: number, row: number, isSelected: boolean, isCurrentTurn: boolean) {
    const cx = col * CELL + CELL / 2
    const cy = row * CELL + CELL / 2
    const radius = CELL * 0.4

    if (isCurrentTurn) {
      ctx.save()
      ctx.shadowColor = 'rgba(109, 159, 109, 0.9)'
      ctx.shadowBlur = 14
      ctx.strokeStyle = 'rgba(109, 159, 109, 0.9)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    ctx.fillStyle = t.color
    ctx.strokeStyle = isSelected ? 'rgba(240, 209, 138, 0.95)' : 'rgba(0,0,0,0.55)'
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = `${Math.round(CELL * 0.4)}px var(--font-cinzel), serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(t.label.slice(0, 2), cx, cy + 1)
  }

  function draw(ctx: CanvasRenderingContext2D, overrideId?: number, overrideCol?: number, overrideRow?: number) {
    const width = COLS * CELL
    const height = ROWS * CELL

    ctx.fillStyle = '#1c1d21'
    ctx.fillRect(0, 0, width, height)

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

    WALL_CELLS.forEach(key => {
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

    ;(matchRef.current?.tokens ?? []).forEach(t => {
      const isOverride = t.id === overrideId
      const col = isOverride ? overrideCol! : t.col
      const row = isOverride ? overrideRow! : t.row
      drawToken(ctx, t, col, row, t.id === selectedTokenId, t.id === matchRef.current?.current_token_id)
    })
  }

  // O <canvas> só existe no DOM depois que `match` carrega (antes disso o componente
  // retorna a tela de "Carregando..."), então o tamanho não pode ser setado só uma vez
  // num efeito com deps [] — só re-seta se ainda não estiver correto, pra não resetar
  // o contexto 2D à toa a cada redraw (a cada poll).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== COLS * CELL || canvas.height !== ROWS * CELL) {
      canvas.width = COLS * CELL
      canvas.height = ROWS * CELL
    }
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw closes over these same deps, re-declared each render
  }, [match, reachable, selectedTokenId, previewPath, attackRange])

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

  function animatePath(id: number, path: Cell[], stepDuration: number, onDone: () => void) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || path.length < 2) {
      onDone()
      return
    }
    animatingRef.current = true

    let i = 0
    function step() {
      if (i >= path.length - 1) {
        animatingRef.current = false
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

  /** Nomeia um token pela perspectiva do jogador local, pro log/banner ficarem legíveis. */
  function nameFor(t: { user_id: number } | undefined): string {
    if (!t) return 'Alguém'
    return t.user_id === user?.id ? 'Você' : 'Oponente'
  }

  /**
   * `skipAttackNotification`: quem acabou de atacar já sabe o resultado (tem os
   * dados/dano na mão, sem precisar comparar attack_sequence) e dispara o dado 3D
   * direto, sem depender desse gate — só o oponente (via poll) passa por ele.
   */
  function applyMatch(next: ArenaMatchState, skipAttackNotification = false) {
    const prevPositions = lastPositionsRef.current
    const changed = next.tokens.find(t => {
      const prev = prevPositions[t.id]
      return prev && (prev.col !== t.col || prev.row !== t.row)
    })

    const updatedPositions: Record<number, Cell> = {}
    next.tokens.forEach(t => {
      updatedPositions[t.id] = { col: t.col, row: t.row }
    })

    matchRef.current = next
    setMatch(next)

    if (changed && !animatingRef.current) {
      const from = prevPositions[changed.id]
      lastPositionsRef.current = updatedPositions
      const path = bfsPathTo(next.tokens, changed.id, from, { col: changed.col, row: changed.row })
      animatePath(changed.id, path, 160, () => {})
    } else {
      lastPositionsRef.current = updatedPositions
    }

    // Pula na primeira carga (senão logaria um "turno mudou" falso ao entrar na partida).
    if (lastSeenTurnRef.current !== null && next.turn_number !== lastSeenTurnRef.current) {
      const activeToken = next.tokens.find(t => t.id === next.current_token_id)
      logEvent(`Turno ${next.turn_number} — vez de ${nameFor(activeToken)}.`)
    }
    lastSeenTurnRef.current = next.turn_number

    // Resultado de ataque persistido no match — usado pelo oponente (via poll) pra
    // saber que algo aconteceu; quem atacou já dispara isso direto (ver skipAttackNotification).
    if (
      !skipAttackNotification &&
      lastSeenAttackSequenceRef.current !== null &&
      next.attack_sequence !== lastSeenAttackSequenceRef.current &&
      next.last_attack_result
    ) {
      const r = next.last_attack_result
      const attacker = next.tokens.find(t => t.id === r.attacker_token_id)
      const target = next.tokens.find(t => t.id === r.target_token_id)
      const optionLabel = ATTACK_OPTIONS.find(o => o.id === r.option)?.label ?? r.option
      const iAmAttacker = attacker?.user_id === user?.id

      const resultText = r.hit
        ? (iAmAttacker ? `Você causou ${r.damage} de dano em ${nameFor(target)}.` : `${nameFor(attacker)} causou ${r.damage} de dano em você.`)
        : (iAmAttacker ? 'Você errou o ataque.' : `${nameFor(attacker)} errou o ataque.`)
      diceStage.showDiceRoll(r.rolls, resultText, toDiceAppearances(r.dice_skins))

      const message = r.hit
        ? `${nameFor(attacker)} usa ${optionLabel}: ${r.successes} sucesso(s) — ${r.damage} de dano em ${nameFor(target)}.`
        : `${nameFor(attacker)} usa ${optionLabel} e erra.`
      logEvent(message)
      showActionBanner(r.hit ? `${nameFor(target)} -${r.damage} de vida` : 'Errou!')
    }
    lastSeenAttackSequenceRef.current = next.attack_sequence
  }

  useEffect(() => {
    if (!token) return
    let active = true

    fetchArenaMatch(matchId, token).then(m => {
      if (active) applyMatch(m)
    }).catch(() => {})

    const interval = setInterval(() => {
      if (!token) return
      fetchArenaMatch(matchId, token).then(m => {
        if (active) applyMatch(m)
      }).catch(() => {})
    }, POLL_MS)

    return () => {
      active = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyMatch closes over refs only, stable across renders
  }, [matchId, token])

  /** Zoom com o scroll, ancorado no ponteiro (o ponto do mapa sob o cursor fica parado). */
  function handleMapWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const pointerX = e.clientX - rect.left
    const pointerY = e.clientY - rect.top
    setView(prev => {
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * factor))
      const worldX = (pointerX - prev.x) / prev.scale
      const worldY = (pointerY - prev.y) / prev.scale
      return { scale: nextScale, x: pointerX - worldX * nextScale, y: pointerY - worldY * nextScale }
    })
  }

  function handleMapPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return
    panStateRef.current = { startX: e.clientX, startY: e.clientY, originX: view.x, originY: view.y, moved: false }
    setIsPanning(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleMapPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const pan = panStateRef.current
    if (!pan) return
    const dx = e.clientX - pan.startX
    const dy = e.clientY - pan.startY
    if (!pan.moved && Math.hypot(dx, dy) > 4) pan.moved = true
    if (pan.moved) setView(prev => ({ ...prev, x: pan.originX + dx, y: pan.originY + dy }))
  }

  function handleMapPointerUp() {
    const pan = panStateRef.current
    panStateRef.current = null
    setIsPanning(false)
    // Um clique de verdade (sem arrastar) ainda deve selecionar célula/token — só
    // suprime o click que vem logo depois de um arraste real (pan do mapa).
    if (pan?.moved) justPannedRef.current = true
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (justPannedRef.current) {
      justPannedRef.current = false
      return
    }
    if (animatingRef.current || busy || !token || !myToken) return
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
        closeMenus()
        setHoverCell(null)
        setBusy(true)
        animatePath(id, path, 180, async () => {
          try {
            const next = await moveArenaToken(matchId, id, col, row, token)
            lastPositionsRef.current[id] = { col, row }
            applyMatch(next)
          } catch (err) {
            showActionBanner(err instanceof ApiError ? err.message : 'Movimento inválido.')
            try {
              const fresh = await fetchArenaMatch(matchId, token)
              applyMatch(fresh)
            } catch {
              /* ignore resync failure */
            }
          } finally {
            setBusy(false)
          }
        })
        return
      }
      setSelectedTokenId(null)
      return
    }

    if (selectedAttack) {
      const attacker = tokens.find(t => t.id === selectedAttack.tokenId)
      const inRange = attacker && chebyshev({ col: attacker.col, row: attacker.row }, { col, row }) <= selectedAttack.option.range
      const target = inRange ? tokens.find(t => t.id !== attacker!.id && t.col === col && t.row === row) : undefined
      const { option, stamina, tokenId: attackerId } = selectedAttack
      setSelectedAttack(null)
      if (target) {
        setBusy(true)
        const optionLabel = option.label
        attackArenaToken(matchId, attackerId, target.id, option.id, stamina, token)
          .then(next => {
            // Sincroniza o tabuleiro sem o gate de "attack_sequence novo" — quem
            // atacou já sabe o resultado, dispara os dados 3D direto abaixo,
            // igual ao solo (sem depender de comparar sequência nenhuma).
            applyMatch(next, true)

            const r = next.last_attack_result
            if (!r) return

            diceStage.showDiceRoll(r.rolls, r.hit ? `Você causou ${r.damage} de dano em ${target.label}.` : 'Você errou o ataque.', toDiceAppearances(r.dice_skins))

            const message = r.hit
              ? `${attacker!.label} usa ${optionLabel}: ${r.successes} sucesso(s) — ${r.damage} de dano em ${target.label}.`
              : `${attacker!.label} usa ${optionLabel} e erra.`
            logEvent(message)
            showActionBanner(r.hit ? `${target.label} -${r.damage} de vida` : 'Errou!')
          })
          .catch(err => showActionBanner(err instanceof ApiError ? err.message : 'Ataque inválido.'))
          .finally(() => setBusy(false))
      } else {
        showActionBanner('Nenhum alvo nessa célula.')
      }
      return
    }

    closeMenus()
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

  function handleMoveOption() {
    if (!myToken) return
    setSelectedTokenId(myToken.id)
    setSelectedAttack(null)
    closeMenus()
  }

  function handleSelectAttack(option: AttackOption) {
    if (!myToken) return
    setPendingAttack({ tokenId: myToken.id, option })
    setAttackMenuOpen(false)
  }

  function handleSelectStamina(stamina: number) {
    if (!pendingAttack) return
    setSelectedAttack({ ...pendingAttack, stamina })
    setPendingAttack(null)
  }

  async function handleEndTurn() {
    if (!token || !myToken || busy) return
    setBusy(true)
    closeMenus()
    setSelectedTokenId(null)
    setSelectedAttack(null)
    setHoverCell(null)
    try {
      const next = await endArenaTurn(matchId, myToken.id, token)
      applyMatch(next)
    } catch (err) {
      showActionBanner(err instanceof ApiError ? err.message : 'Não foi possível finalizar o turno.')
    } finally {
      setBusy(false)
    }
  }

  if (!match || !myToken) {
    return (
      <div className="flex flex-col gap-4">
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Carregando partida...</p>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" style={{ width: 'fit-content' }} onClick={onExit}>
          Voltar
        </button>
      </div>
    )
  }

  const winner = match.status === 'finished' ? tokens.find(t => t.id === match.winner_token_id) : null

  return (
    <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: 'var(--text)' }}>
            Mano a mano — partida #{match.id}
          </h1>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {match.status === 'finished'
              ? winner ? `${nameFor(winner)} venceu!` : 'Partida encerrada.'
              : !isMyTurn ? 'Vez do oponente. Aguardando...'
              : selectedToken ? 'Clique numa célula destacada pra mover.'
              : selectedAttack ? 'Clique no alvo em vermelho pra atacar.'
              : 'Sua vez — escolha uma ação junto ao seu personagem.'}
          </p>
        </div>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={onExit}>
          Voltar
        </button>
      </div>

      <div className="ddb-panel p-2 flex items-center gap-4 flex-wrap" style={{ width: 'fit-content', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', color: 'var(--text)' }}>Turno {match.turn_number}</span>
        <div className={isMyTurn ? 'arena-turn-glow' : undefined} style={{ borderRadius: 8, padding: '0.15rem 0.5rem' }}>
          <HeartBar label="Você" hp={myToken.hp} maxHp={myToken.max_hp} />
        </div>
        {opponentToken && (
          <div className={!isMyTurn && match.status === 'active' ? 'arena-turn-glow' : undefined} style={{ borderRadius: 8, padding: '0.15rem 0.5rem' }}>
            <HeartBar label="Oponente" hp={opponentToken.hp} maxHp={opponentToken.max_hp} />
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-1" style={{ minHeight: 0 }}>
        <div className="ddb-panel p-3" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Arrastar (pointer) faz pan, scroll faz zoom ancorado no cursor — só o
              <canvas> escuta esses eventos (não o wrapper inteiro), senão o
              setPointerCapture do pan rouba o clique dos botões do menu ao lado. */}
          <div style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0', width: COLS * CELL, height: ROWS * CELL, position: 'relative' }}>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoverCell(null)}
              onWheel={handleMapWheel}
              onPointerDown={handleMapPointerDown}
              onPointerMove={handleMapPointerMove}
              onPointerUp={handleMapPointerUp}
              onPointerLeave={handleMapPointerUp}
              style={{ display: 'block', touchAction: 'none', cursor: isPanning ? 'grabbing' : 'grab' }}
            />

            {/* Menu de ações ao lado do token — só aparece (translúcido) pra quem está na
                vez, sem precisar clicar; "Finalizar turno" mora aqui, não solto no mapa.
                Some enquanto mira (mover/atacar) e enquanto uma ação ainda está sendo
                resolvida (rolando os dados / modal de resultado aberto), só volta depois. */}
            {isMyTurn && !selectedToken && !selectedAttack && !busy && !diceStage.resolving && (
              <div
                className="flex flex-col gap-1.5 p-2 arena-action-menu"
                style={{
                  position: 'absolute',
                  left: myToken.col * CELL + CELL + 12,
                  top: myToken.row * CELL,
                  zIndex: 10,
                  minWidth: 150,
                  background: 'rgba(30,38,50,0.72)',
                  border: '1px solid rgba(184,146,74,0.3)',
                  borderRadius: 8,
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                {!pendingAttack && !attackMenuOpen && (
                  <>
                    <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={handleMoveOption}>
                      Mover
                    </button>
                    <button type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs" onClick={() => setAttackMenuOpen(true)}>
                      Ataque
                    </button>
                  </>
                )}

                {attackMenuOpen && !pendingAttack && (
                  <>
                    {ATTACK_OPTIONS.map(option => (
                      <button key={option.id} type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={() => handleSelectAttack(option)}>
                        {option.label}
                      </button>
                    ))}
                    <button type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs" onClick={() => setAttackMenuOpen(false)}>
                      Cancelar
                    </button>
                  </>
                )}

                {pendingAttack && (
                  <>
                    {Array.from({ length: 20 }, (_, i) => i + 1)
                      .filter(diceCount => triangularCost(diceCount) <= (myToken.character?.estamina ?? 0))
                      .map(diceCount => {
                        const cost = triangularCost(diceCount)
                        return (
                          <button key={diceCount} type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs" onClick={() => handleSelectStamina(cost)}>
                            {cost} {cost === 1 ? 'ponto' : 'pontos'} · {diceCount + (myToken.character?.poder ?? 0)} dados
                          </button>
                        )
                      })}
                    <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={() => setPendingAttack(null)}>
                      Cancelar
                    </button>
                  </>
                )}

                <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={handleEndTurn} disabled={busy}>
                  Finalizar turno
                </button>
              </div>
            )}
          </div>

          {actionBanner && (
            <div
              className="ddb-panel parchment p-3 flex items-center justify-center"
              style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20, minWidth: 200, textAlign: 'center' }}
            >
              <span className="gold-glow" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '0.03em' }}>
                {actionBanner}
              </span>
            </div>
          )}
        </div>

        <BattleLog entries={battleLog} height={ROWS * CELL + 24} />
      </div>
    </div>
  )
}
