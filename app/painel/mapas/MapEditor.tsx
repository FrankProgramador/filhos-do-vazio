'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

type Stroke = {
  color: string
  width: number
  points: { x: number; y: number }[]
}

type Token = {
  id: string
  col: number
  row: number
  size: 1 | 2
  color: string
  label: string
}

type MapData = {
  id: string
  name: string
  updatedAt: number
  cols: number
  rows: number
  cellSize: number
  cells: (string | null)[]
  walls: boolean[]
  strokes: Stroke[]
  tokens: Token[]
}

type Tool = 'floor' | 'eraseFloor' | 'wallBlock' | 'wallLine' | 'wallRect' | 'wallCircle' | 'eraseWall' | 'token' | 'eraseToken'

type Point = { x: number; y: number }

const STORAGE_KEY = 'fdv-mapas'
const STORAGE_EVENT = 'fdv-mapas-updated'

const TERRAIN_PALETTE: { label: string; color: string }[] = [
  { label: 'Pedra', color: '#7d7567' },
  { label: 'Grama', color: '#4f6b3f' },
  { label: 'Água', color: '#355f86' },
  { label: 'Madeira', color: '#7a5430' },
  { label: 'Areia', color: '#b59a63' },
]

const MOB_PALETTE: { label: string; color: string }[] = [
  { label: 'Vermelho', color: '#a34a4a' },
  { label: 'Azul', color: '#3a6ea5' },
  { label: 'Verde', color: '#4f7a3f' },
  { label: 'Roxo', color: '#6a4a8a' },
  { label: 'Dourado', color: '#b8924a' },
]

const DEFAULT_COLS = 40
const DEFAULT_ROWS = 26
const DEFAULT_CELL_SIZE = 32
const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.5
const WALL_ERASE_RADIUS = 10

function emptyMap(name: string, cols = DEFAULT_COLS, rows = DEFAULT_ROWS): MapData {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: Date.now(),
    cols,
    rows,
    cellSize: DEFAULT_CELL_SIZE,
    cells: new Array(cols * rows).fill(null),
    walls: new Array(cols * rows).fill(false),
    strokes: [],
    tokens: [],
  }
}

function normalizeMap(m: MapData): MapData {
  const size = m.cols * m.rows
  return {
    ...m,
    walls: Array.isArray(m.walls) && m.walls.length === size ? m.walls : new Array(size).fill(false),
    tokens: Array.isArray(m.tokens) ? m.tokens : [],
  }
}

function subscribeToSavedMaps(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(STORAGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(STORAGE_EVENT, callback)
  }
}

function getSavedMapsSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? '[]'
}

function getSavedMapsServerSnapshot() {
  return '[]'
}

function persistMaps(maps: MapData[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(maps))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function buildRectPoints(a: Point, b: Point): Point[] {
  const x1 = Math.min(a.x, b.x)
  const x2 = Math.max(a.x, b.x)
  const y1 = Math.min(a.y, b.y)
  const y2 = Math.max(a.y, b.y)
  return [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }, { x: x1, y: y1 }]
}

function buildCirclePoints(a: Point, b: Point, segments = 48): Point[] {
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2
  const rx = Math.abs(b.x - a.x) / 2
  const ry = Math.abs(b.y - a.y) / 2
  const points: Point[] = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    points.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) })
  }
  return points
}

export default function MapEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [map, setMap] = useState<MapData>(() => emptyMap('Mapa sem título'))
  const [tool, setTool] = useState<Tool>('floor')
  const [floorColor, setFloorColor] = useState(TERRAIN_PALETTE[0].color)
  const [tokenColor, setTokenColor] = useState(MOB_PALETTE[0].color)
  const [tokenSize, setTokenSize] = useState<1 | 2>(1)
  const [tokenLabel, setTokenLabel] = useState('M')
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [nameInput, setNameInput] = useState(map.name)
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef<Stroke | null>(null)
  const draggingTokenIdRef = useRef<string | null>(null)
  const shapeStartRef = useRef<Point | null>(null)

  const savedMapsRaw = useSyncExternalStore(subscribeToSavedMaps, getSavedMapsSnapshot, getSavedMapsServerSnapshot)
  const savedMaps = useMemo<MapData[]>(() => {
    try {
      const parsed = JSON.parse(savedMapsRaw) as MapData[]
      return parsed.map(normalizeMap)
    } catch {
      return []
    }
  }, [savedMapsRaw])

  const cell = map.cellSize * zoom

  function drawScene(ctx: CanvasRenderingContext2D) {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    ctx.fillStyle = '#1c1d21'
    ctx.fillRect(0, 0, width, height)

    map.cells.forEach((color, index) => {
      if (!color) return
      const col = index % map.cols
      const row = Math.floor(index / map.cols)
      ctx.fillStyle = color
      ctx.fillRect(col * cell, row * cell, cell, cell)
    })

    map.walls.forEach((isWall, index) => {
      if (!isWall) return
      const col = index % map.cols
      const row = Math.floor(index / map.cols)
      drawWallBlock(ctx, col * cell, row * cell, cell)
    })

    if (showGrid) {
      ctx.strokeStyle = 'rgba(184, 146, 74, 0.25)'
      ctx.lineWidth = 1
      for (let c = 0; c <= map.cols; c++) {
        ctx.beginPath()
        ctx.moveTo(c * cell + 0.5, 0)
        ctx.lineTo(c * cell + 0.5, height)
        ctx.stroke()
      }
      for (let r = 0; r <= map.rows; r++) {
        ctx.beginPath()
        ctx.moveTo(0, r * cell + 0.5)
        ctx.lineTo(width, r * cell + 0.5)
        ctx.stroke()
      }
    }

    map.strokes.forEach(stroke => drawStroke(ctx, stroke, zoom))
    map.tokens.forEach(token => drawToken(ctx, token, cell))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = Math.round(map.cols * cell)
    canvas.height = Math.round(map.rows * cell)
    drawScene(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drawScene closes over these same deps, re-declared each render
  }, [map, showGrid, cell, zoom])

  function drawWallBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#121215'
    ctx.fillRect(x, y, size, size)
    ctx.strokeStyle = 'rgba(184, 146, 74, 0.35)'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y + size)
    ctx.moveTo(x + size, y)
    ctx.lineTo(x, y + size)
    ctx.stroke()
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, scale: number) {
    if (stroke.points.length < 2) return
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width * scale
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale)
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale)
    }
    ctx.stroke()
  }

  function drawToken(ctx: CanvasRenderingContext2D, token: Token, cellPx: number) {
    const size = token.size * cellPx
    const cx = token.col * cellPx + size / 2
    const cy = token.row * cellPx + size / 2
    const radius = size * 0.46

    ctx.fillStyle = token.color
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = `${Math.max(10, size * 0.3)}px var(--font-cinzel), serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(token.label.slice(0, 3), cx, cy + 1)
  }

  function getCellCoords(x: number, y: number) {
    return { col: Math.floor(x / cell), row: Math.floor(y / cell) }
  }

  function getCellIndex(x: number, y: number) {
    const { col, row } = getCellCoords(x, y)
    if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) return -1
    return row * map.cols + col
  }

  function paintFloorAt(x: number, y: number) {
    const index = getCellIndex(x, y)
    if (index === -1) return
    setMap(prev => {
      const cells = [...prev.cells]
      cells[index] = tool === 'floor' ? floorColor : null
      return { ...prev, cells }
    })
  }

  function paintWallBlockAt(x: number, y: number) {
    const index = getCellIndex(x, y)
    if (index === -1) return
    setMap(prev => {
      if (prev.walls[index]) return prev
      const walls = [...prev.walls]
      walls[index] = true
      return { ...prev, walls }
    })
  }

  function eraseWallAt(x: number, y: number) {
    const index = getCellIndex(x, y)
    if (index !== -1 && map.walls[index]) {
      setMap(prev => {
        const walls = [...prev.walls]
        walls[index] = false
        return { ...prev, walls }
      })
      return
    }

    const lx = x / zoom
    const ly = y / zoom
    setMap(prev => {
      const strokes = prev.strokes.filter(stroke => {
        for (let i = 0; i < stroke.points.length - 1; i++) {
          const a = stroke.points[i]
          const b = stroke.points[i + 1]
          if (distanceToSegment(lx, ly, a.x, a.y, b.x, b.y) < WALL_ERASE_RADIUS) return false
        }
        return true
      })
      if (strokes.length === prev.strokes.length) return prev
      return { ...prev, strokes }
    })
  }

  function findTokenAt(col: number, row: number) {
    return map.tokens.find(t => col >= t.col && col < t.col + t.size && row >= t.row && row < t.row + t.size)
  }

  function placeOrDragTokenAt(x: number, y: number, startNew: boolean) {
    const { col, row } = getCellCoords(x, y)
    if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) return

    if (startNew) {
      const existing = findTokenAt(col, row)
      if (existing) {
        draggingTokenIdRef.current = existing.id
        return
      }
      const clampedCol = Math.min(col, map.cols - tokenSize)
      const clampedRow = Math.min(row, map.rows - tokenSize)
      const token: Token = {
        id: crypto.randomUUID(),
        col: clampedCol,
        row: clampedRow,
        size: tokenSize,
        color: tokenColor,
        label: tokenLabel.trim() || 'M',
      }
      draggingTokenIdRef.current = token.id
      setMap(prev => ({ ...prev, tokens: [...prev.tokens, token] }))
      return
    }

    const id = draggingTokenIdRef.current
    if (!id) return
    setMap(prev => {
      const tokens = prev.tokens.map(t => {
        if (t.id !== id) return t
        const clampedCol = Math.max(0, Math.min(col, prev.cols - t.size))
        const clampedRow = Math.max(0, Math.min(row, prev.rows - t.size))
        return { ...t, col: clampedCol, row: clampedRow }
      })
      return { ...prev, tokens }
    })
  }

  function eraseTokenAt(x: number, y: number) {
    const { col, row } = getCellCoords(x, y)
    setMap(prev => {
      const tokens = prev.tokens.filter(t => !(col >= t.col && col < t.col + t.size && row >= t.row && row < t.row + t.size))
      if (tokens.length === prev.tokens.length) return prev
      return { ...prev, tokens }
    })
  }

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const { x, y } = getCanvasPoint(e)

    if (tool === 'floor' || tool === 'eraseFloor') {
      paintFloorAt(x, y)
    } else if (tool === 'wallBlock') {
      paintWallBlockAt(x, y)
    } else if (tool === 'wallLine') {
      currentStrokeRef.current = { color: '#0c0c0e', width: 4, points: [{ x: x / zoom, y: y / zoom }] }
    } else if (tool === 'wallRect' || tool === 'wallCircle') {
      shapeStartRef.current = { x: x / zoom, y: y / zoom }
    } else if (tool === 'eraseWall') {
      eraseWallAt(x, y)
    } else if (tool === 'token') {
      placeOrDragTokenAt(x, y, true)
    } else if (tool === 'eraseToken') {
      eraseTokenAt(x, y)
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const { x, y } = getCanvasPoint(e)

    if (tool === 'floor' || tool === 'eraseFloor') {
      paintFloorAt(x, y)
    } else if (tool === 'wallBlock') {
      paintWallBlockAt(x, y)
    } else if (tool === 'wallLine' && currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x: x / zoom, y: y / zoom })
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) drawStroke(ctx, currentStrokeRef.current, zoom)
    } else if ((tool === 'wallRect' || tool === 'wallCircle') && shapeStartRef.current) {
      const current = { x: x / zoom, y: y / zoom }
      const points = tool === 'wallRect' ? buildRectPoints(shapeStartRef.current, current) : buildCirclePoints(shapeStartRef.current, current)
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        drawScene(ctx)
        drawStroke(ctx, { color: '#0c0c0e', width: 4, points }, zoom)
      }
    } else if (tool === 'eraseWall') {
      eraseWallAt(x, y)
    } else if (tool === 'token') {
      placeOrDragTokenAt(x, y, false)
    } else if (tool === 'eraseToken') {
      eraseTokenAt(x, y)
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false
    draggingTokenIdRef.current = null

    if (tool === 'wallLine' && currentStrokeRef.current) {
      const stroke = currentStrokeRef.current
      currentStrokeRef.current = null
      if (stroke.points.length > 1) {
        setMap(prev => ({ ...prev, strokes: [...prev.strokes, stroke] }))
      }
    } else if ((tool === 'wallRect' || tool === 'wallCircle') && shapeStartRef.current) {
      const { x, y } = getCanvasPoint(e)
      const current = { x: x / zoom, y: y / zoom }
      const start = shapeStartRef.current
      shapeStartRef.current = null
      const points = tool === 'wallRect' ? buildRectPoints(start, current) : buildCirclePoints(start, current)
      setMap(prev => ({ ...prev, strokes: [...prev.strokes, { color: '#0c0c0e', width: 4, points }] }))
    }
  }

  function handleNewMap() {
    if (!window.confirm('Criar um novo mapa em branco? As alterações não salvas serão perdidas.')) return
    const fresh = emptyMap('Mapa sem título')
    setMap(fresh)
    setNameInput(fresh.name)
    setZoom(1)
  }

  function handleSave() {
    const toSave: MapData = { ...map, name: nameInput.trim() || 'Mapa sem título', updatedAt: Date.now() }
    const others = savedMaps.filter(m => m.id !== toSave.id)
    const next = [toSave, ...others].sort((a, b) => b.updatedAt - a.updatedAt)
    persistMaps(next)
    setMap(toSave)
    setNameInput(toSave.name)
  }

  function handleLoad(id: string) {
    const found = savedMaps.find(m => m.id === id)
    if (!found) return
    setMap(found)
    setNameInput(found.name)
    setZoom(1)
  }

  function handleDelete(id: string) {
    if (!window.confirm('Excluir este mapa salvo?')) return
    const next = savedMaps.filter(m => m.id !== id)
    persistMaps(next)
  }

  function handleClearCanvas() {
    if (!window.confirm('Limpar todo o conteúdo deste mapa?')) return
    setMap(prev => ({
      ...prev,
      cells: new Array(prev.cols * prev.rows).fill(null),
      walls: new Array(prev.cols * prev.rows).fill(false),
      strokes: [],
      tokens: [],
    }))
  }

  function handleExport() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${map.name || 'mapa'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function handleZoom(delta: number) {
    setZoom(prev => Math.round(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)) * 100) / 100)
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row" style={{ alignItems: 'flex-start' }}>
      <aside className="ddb-panel parchment p-4 flex flex-col gap-4" style={{ width: '100%', maxWidth: 280, flexShrink: 0 }}>
        <div>
          <label style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Nome do mapa
          </label>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="w-full mt-1 px-2 py-1.5 rounded text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.25)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex gap-2">
          <button type="button" className="hk-btn hk-btn-gold px-3 py-1.5 rounded text-xs flex-1" onClick={handleSave}>
            Salvar
          </button>
          <button type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs flex-1" onClick={handleNewMap}>
            Novo
          </button>
        </div>

        <div>
          <p className="ddb-section-title" style={{ fontSize: '0.78rem' }}>Ferramentas</p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <ToolButton label="Pincel de piso" active={tool === 'floor'} onClick={() => setTool('floor')} />
            <ToolButton label="Borracha de piso" active={tool === 'eraseFloor'} onClick={() => setTool('eraseFloor')} />
            <ToolButton label="Parede (bloco)" active={tool === 'wallBlock'} onClick={() => setTool('wallBlock')} />
            <ToolButton label="Parede (linha)" active={tool === 'wallLine'} onClick={() => setTool('wallLine')} />
            <ToolButton label="Parede (retângulo)" active={tool === 'wallRect'} onClick={() => setTool('wallRect')} />
            <ToolButton label="Parede (círculo)" active={tool === 'wallCircle'} onClick={() => setTool('wallCircle')} />
            <ToolButton label="Borracha de parede" active={tool === 'eraseWall'} onClick={() => setTool('eraseWall')} />
            <ToolButton label="Marcador de mob" active={tool === 'token'} onClick={() => setTool('token')} />
            <ToolButton label="Borracha de mob" active={tool === 'eraseToken'} onClick={() => setTool('eraseToken')} />
          </div>
        </div>

        {tool === 'floor' && (
          <div>
            <p className="ddb-section-title" style={{ fontSize: '0.78rem' }}>Terreno</p>
            <div className="flex gap-2 flex-wrap">
              {TERRAIN_PALETTE.map(t => (
                <button
                  key={t.color}
                  type="button"
                  title={t.label}
                  onClick={() => setFloorColor(t.color)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: t.color,
                    border: floorColor === t.color ? '2px solid var(--gold-bright)' : '2px solid transparent',
                    boxShadow: floorColor === t.color ? '0 0 8px rgba(var(--gold-rgb),0.6)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {tool === 'token' && (
          <div className="flex flex-col gap-3">
            <div>
              <p className="ddb-section-title" style={{ fontSize: '0.78rem' }}>Cor do mob</p>
              <div className="flex gap-2 flex-wrap">
                {MOB_PALETTE.map(t => (
                  <button
                    key={t.color}
                    type="button"
                    title={t.label}
                    onClick={() => setTokenColor(t.color)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      background: t.color,
                      border: tokenColor === t.color ? '2px solid var(--gold-bright)' : '2px solid transparent',
                      boxShadow: tokenColor === t.color ? '0 0 8px rgba(var(--gold-rgb),0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="ddb-section-title" style={{ fontSize: '0.78rem' }}>Tamanho</p>
              <div className="flex gap-2">
                <ToolButton label="1x1" active={tokenSize === 1} onClick={() => setTokenSize(1)} />
                <ToolButton label="2x2" active={tokenSize === 2} onClick={() => setTokenSize(2)} />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Rótulo
              </label>
              <input
                value={tokenLabel}
                onChange={e => setTokenLabel(e.target.value.slice(0, 3))}
                className="w-full mt-1 px-2 py-1.5 rounded text-sm"
                style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.25)', color: 'var(--text)' }}
              />
            </div>
          </div>
        )}

        <label className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
          Mostrar grade
        </label>

        <div className="flex gap-2">
          <button type="button" className="hk-btn hk-btn-void px-3 py-1.5 rounded text-xs flex-1" onClick={handleClearCanvas}>
            Limpar mapa
          </button>
          <button type="button" className="hk-btn hk-btn-soul px-3 py-1.5 rounded text-xs flex-1" onClick={handleExport}>
            Exportar PNG
          </button>
        </div>

        {savedMaps.length > 0 && (
          <div>
            <p className="ddb-section-title" style={{ fontSize: '0.78rem' }}>Mapas salvos</p>
            <div className="flex flex-col gap-1.5" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {savedMaps.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded"
                  style={{ background: 'rgba(var(--bg-secondary-rgb),0.6)', border: m.id === map.id ? '1px solid rgba(var(--gold-rgb),0.5)' : '1px solid transparent' }}
                >
                  <button
                    type="button"
                    onClick={() => handleLoad(m.id)}
                    className="text-left flex-1 truncate"
                    style={{ fontSize: '0.78rem', color: 'var(--text)' }}
                  >
                    {m.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    style={{ fontSize: '0.7rem', color: 'var(--error)' }}
                    aria-label={`Excluir ${m.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="flex flex-col gap-2" style={{ minWidth: 0, flex: 1 }}>
        <div className="ddb-panel p-2 flex items-center gap-2" style={{ width: 'fit-content' }}>
          <button type="button" className="hk-btn hk-btn-soul px-2.5 py-1 rounded text-xs" onClick={() => handleZoom(-0.2)}>
            −
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 42, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" className="hk-btn hk-btn-soul px-2.5 py-1 rounded text-xs" onClick={() => handleZoom(0.2)}>
            +
          </button>
          <button type="button" className="hk-btn hk-btn-soul px-2.5 py-1 rounded text-xs" onClick={() => setZoom(1)}>
            Redefinir
          </button>
        </div>

        <div className="ddb-panel p-3" style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '75vh' }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}

function ToolButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hk-btn ${active ? 'hk-btn-gold' : 'hk-btn-soul'} px-2 py-1.5 rounded text-xs`}
    >
      {label}
    </button>
  )
}
