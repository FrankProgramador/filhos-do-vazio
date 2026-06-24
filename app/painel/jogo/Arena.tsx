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
  isEnemy?: boolean
}

type Cell = { col: number; row: number }
type ReachableInfo = { dist: number; parent: string | null }

const COLS = 20
const ROWS = 14
const CELL = 40
const MOVE_DIRECTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const BANNER_DURATION = 1400

const WALL_COL = 9
const WALL_CELLS = new Set(Array.from({ length: 11 }, (_, row) => `${WALL_COL},${row}`))

type AttackOption = { id: string; label: string; range: number }

const ATTACK_OPTIONS: AttackOption[] = [
  { id: 'unarmed', label: 'Desarmado', range: 1 },
  { id: 'rock', label: 'Jogar pedra', range: 6 },
]

function manhattan(a: Cell, b: Cell) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row)
}

function isWalkable(tokens: ArenaToken[], ignoreId: string, col: number, row: number) {
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

/** Unlimited-range BFS to the nearest cell satisfying goalTest — used for enemy pathing around obstacles. */
function bfsPathTo(tokens: ArenaToken[], ignoreId: string, start: Cell, goalTest: (c: Cell) => boolean): Cell[] | null {
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
      if (!isWalkable(tokens, ignoreId, next.col, next.row)) continue
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
    { id: 'player', label: character.name.charAt(0).toUpperCase(), color: '#b8924a', col: 4, row: 7, movement: 5, movementUsed: 0, hp: 4, maxHp: 4 },
    { id: 'enemy', label: 'E', color: '#a34a4a', col: 15, row: 7, movement: 3, movementUsed: 0, hp: 4, maxHp: 4, isEnemy: true },
  ])
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [menuTokenId, setMenuTokenId] = useState<string | null>(null)
  const [attackMenuOpen, setAttackMenuOpen] = useState(false)
  const [selectedAttack, setSelectedAttack] = useState<{ tokenId: string; option: AttackOption } | null>(null)
  const [hoverCell, setHoverCell] = useState<Cell | null>(null)
  const [turn, setTurn] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [turnBanner, setTurnBanner] = useState<string | null>(() => `Turno de ${character.name}`)
  const tokensRef = useRef(tokens)
  const animatingRef = useRef(false)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    tokensRef.current = tokens
  }, [tokens])

  useEffect(() => {
    bannerTimeoutRef.current = setTimeout(() => setTurnBanner(null), BANNER_DURATION)
    return () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    }
  }, [])

  function showBanner(text: string, duration = BANNER_DURATION) {
    setTurnBanner(text)
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    bannerTimeoutRef.current = setTimeout(() => setTurnBanner(null), duration)
  }

  function closeMenus() {
    setMenuTokenId(null)
    setAttackMenuOpen(false)
  }

  const player = tokens.find(t => !t.isEnemy)!
  const enemy = tokens.find(t => t.isEnemy)!
  const selectedToken = tokens.find(t => t.id === selectedTokenId) ?? null
  const menuToken = tokens.find(t => t.id === menuTokenId) ?? null
  const reachable = useMemo(() => {
    if (!selectedToken) return null
    const remaining = selectedToken.movement - selectedToken.movementUsed
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
        const d = manhattan({ col: attacker.col, row: attacker.row }, { col: c, row: r })
        if (d > 0 && d <= selectedAttack.option.range) cells.push({ col: c, row: r })
      }
    }
    return cells
  }, [selectedAttack, tokens])

  function drawToken(ctx: CanvasRenderingContext2D, token: ArenaToken, col: number, row: number, isSelected: boolean) {
    const cx = col * CELL + CELL / 2
    const cy = row * CELL + CELL / 2
    const radius = CELL * 0.4

    ctx.fillStyle = token.color
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
    ctx.fillText(token.label.slice(0, 2), cx, cy + 1)
  }

  function draw(ctx: CanvasRenderingContext2D, overrideId?: string, overrideCol?: number, overrideRow?: number) {
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
  }, [tokens, reachable, selectedTokenId, previewPath, attackRange])

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
    if (animatingRef.current) return
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
        animatePath(id, path, 180, () => {
          setTokens(prev => prev.map(t => (t.id === id ? { ...t, col, row, movementUsed: t.movementUsed + info.dist } : t)))
        })
        return
      }
      setSelectedTokenId(null)
      return
    }

    if (selectedAttack) {
      const attacker = tokens.find(t => t.id === selectedAttack.tokenId)
      const inRange = attacker && manhattan({ col: attacker.col, row: attacker.row }, { col, row }) <= selectedAttack.option.range
      const target = inRange ? tokens.find(t => t.id !== attacker!.id && t.col === col && t.row === row) : undefined
      if (target) {
        setTokens(prev => prev.map(t => (t.id === target.id ? { ...t, hp: Math.max(0, t.hp - 1) } : t)))
        showBanner(`${selectedAttack.option.label} acertou! ${target.label} -1 de vida`)
      }
      setSelectedAttack(null)
      return
    }

    const clicked = tokens.find(t => t.col === col && t.row === row)
    if (clicked && !clicked.isEnemy) {
      setMenuTokenId(prev => (prev === clicked.id ? null : clicked.id))
      setAttackMenuOpen(false)
    } else {
      closeMenus()
    }
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
    if (!menuToken) return
    setSelectedTokenId(menuToken.id)
    setSelectedAttack(null)
    closeMenus()
  }

  function handleSelectAttack(option: AttackOption) {
    if (!menuToken) return
    setSelectedAttack({ tokenId: menuToken.id, option })
    closeMenus()
  }

  function handleEndTurn() {
    if (animatingRef.current) return
    closeMenus()
    setSelectedTokenId(null)
    setSelectedAttack(null)
    setHoverCell(null)
    showBanner('Turno do inimigo')

    const current = tokensRef.current
    const currentPlayer = current.find(t => !t.isEnemy)
    const currentEnemy = current.find(t => t.isEnemy)

    function finish(finalPos: Cell) {
      const attacked = currentPlayer ? manhattan(finalPos, { col: currentPlayer.col, row: currentPlayer.row }) === 1 : false
      setTokens(prev =>
        prev.map(t => {
          if (currentEnemy && t.id === currentEnemy.id) return { ...t, col: finalPos.col, row: finalPos.row }
          if (!t.isEnemy) return { ...t, movementUsed: 0, hp: attacked ? Math.max(0, t.hp - 1) : t.hp }
          return t
        })
      )
      setTurn(t => t + 1)
      if (attacked) {
        showBanner('O inimigo atacou! Você perde 1 de vida', 1600)
        setTimeout(() => showBanner(`Turno de ${character.name}`), 1700)
      } else {
        showBanner(`Turno de ${character.name}`)
      }
    }

    if (!currentPlayer || !currentEnemy) {
      setTokens(prev => prev.map(t => (t.isEnemy ? t : { ...t, movementUsed: 0 })))
      setTurn(t => t + 1)
      showBanner(`Turno de ${character.name}`)
      return
    }

    const isAdjacentToPlayer = (cell: Cell) => manhattan(cell, { col: currentPlayer.col, row: currentPlayer.row }) === 1
    const start = { col: currentEnemy.col, row: currentEnemy.row }
    const fullPath = bfsPathTo(current, currentEnemy.id, start, isAdjacentToPlayer)
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
            Clique no seu personagem para ver as opções de turno.
          </p>
        </div>
        <button type="button" className="hk-btn hk-btn-soul px-4 py-1.5 rounded text-xs shrink-0" onClick={onExit}>
          Voltar
        </button>
      </div>

      <div className="ddb-panel p-2 flex items-center gap-4 flex-wrap" style={{ width: 'fit-content' }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', color: 'var(--text)' }}>Turno {turn}</span>
        <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={handleEndTurn} disabled={isAnimating}>
          Finalizar turno
        </button>
        <HeartBar label={character.name} hp={player.hp} maxHp={player.maxHp} />
        <HeartBar label="Inimigo" hp={enemy.hp} maxHp={enemy.maxHp} />
      </div>

      <div className="ddb-panel p-3" style={{ width: 'fit-content', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoverCell(null)}
          style={{ display: 'block', cursor: 'pointer' }}
        />

        {menuToken && (
          <div
            className="ddb-panel parchment p-1.5 flex flex-col gap-1"
            style={{
              position: 'absolute',
              left: menuToken.col * CELL + CELL + 16,
              top: menuToken.row * CELL + 16,
              zIndex: 10,
              minWidth: 110,
            }}
          >
            <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={handleMoveOption}>
              Mover
            </button>
            <button type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs" onClick={() => setAttackMenuOpen(v => !v)}>
              Ataque
            </button>
          </div>
        )}

        {menuToken && attackMenuOpen && (
          <div
            className="ddb-panel parchment p-1.5 flex flex-col gap-1"
            style={{
              position: 'absolute',
              left: menuToken.col * CELL + CELL + 16 + 118,
              top: menuToken.row * CELL + 16,
              zIndex: 10,
              minWidth: 130,
            }}
          >
            {ATTACK_OPTIONS.map(option => (
              <button key={option.id} type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs" onClick={() => handleSelectAttack(option)}>
                {option.label}
              </button>
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
    </div>
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
