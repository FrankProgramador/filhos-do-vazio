'use client'

import { useState } from 'react'

export type CombatAttack = {
  name: string
  attribute: 'poder' | 'graca'
  dice: number
  damage: number
  staminaCost: number
  note?: string
  /** Exige distância 0 (adjacente) para ser usado. */
  meleeOnly?: boolean
  /** Alcance base (em quadrados) sem custo extra. Quadrados além disso custam Estamina em acúmulo triangular. */
  baseRange?: number
  /** Consumido após o primeiro uso (ex: item de acesso rápido de uso único). */
  singleUse?: boolean
}

export type CombatLines = {
  start?: string[]
  onHit?: string[]
  onDamaged?: string[]
  onNearDefeat?: string[]
}

export type CombatantConfig = {
  name: string
  icon: string
  poder: number
  graca: number
  casca: number
  maxCoracoes: number
  maxEstamina: number
  attacks: CombatAttack[]
  defenseDice: number
  /** Trilha Pressão: cada acerto empilha um marcador (máx. 2) que ignora 1 de Casca do alvo por marcador. */
  trilhaPressao?: boolean
  lines?: CombatLines
}

type Phase = 'player-turn' | 'awaiting-defense' | 'victory' | 'defeat'

type LogEntry = { id: number; node: React.ReactNode; kind?: 'hit' | 'miss' | 'info' | 'flavor' }

type EnemyState = {
  coracoes: number
  estamina: number
  pressure: number
  defeated: boolean
  attackedThisRound: boolean
}

type PendingAttack = { enemyIndex: number; attack: CombatAttack; dice: number[]; successes: number }

function triangular(n: number) {
  return (n * (n + 1)) / 2
}

function rollDice(n: number): number[] {
  return Array.from({ length: Math.max(0, n) }, () => 1 + Math.floor(Math.random() * 6))
}

function countSuccesses(dice: number[]) {
  return dice.filter(d => d >= 5).length
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickLine(lines?: string[]): string | null {
  if (!lines || lines.length === 0) return null
  return pickRandom(lines)
}

function Dice({ values }: { values: number[] }) {
  if (values.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {values.map((d, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.95rem',
            border: d >= 5 ? '2px solid var(--gold)' : '2px solid rgba(var(--text-rgb),0.15)',
            color: d >= 5 ? 'var(--gold)' : 'var(--text-muted)',
            background: d >= 5 ? 'rgba(var(--gold-rgb),0.12)' : 'transparent',
          }}
        >
          {d}
        </span>
      ))}
    </div>
  )
}

function StatusBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
        <span>{label}</span>
        <span>{Math.max(0, value)}/{max}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'rgba(var(--text-rgb),0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

export default function CombatSimulator({
  player, enemies: enemyConfigs, initialDistance = 0, maxDistance,
}: {
  player: CombatantConfig
  enemies: CombatantConfig[]
  initialDistance?: number
  maxDistance?: number
}) {
  const distanceCap = maxDistance ?? initialDistance

  const [playerCoracoes, setPlayerCoracoes] = useState(player.maxCoracoes)
  const [playerEstamina, setPlayerEstamina] = useState(player.maxEstamina)
  const [distance, setDistance] = useState(initialDistance)
  const [usedAttacks, setUsedAttacks] = useState<Set<number>>(new Set())
  const [enemies, setEnemies] = useState<EnemyState[]>(
    enemyConfigs.map(e => ({ coracoes: e.maxCoracoes, estamina: e.maxEstamina, pressure: 0, defeated: false, attackedThisRound: false })),
  )
  const [round, setRound] = useState(1)
  const [roundDefenses, setRoundDefenses] = useState(0)
  const [phase, setPhase] = useState<Phase>('player-turn')
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, node: pickLine(enemyConfigs[0]?.lines?.start) ?? 'O combate começa!', kind: 'info' },
  ])
  const [selectedAttack, setSelectedAttack] = useState(0)
  const [selectedTarget, setSelectedTarget] = useState(0)
  const [enemyQueue, setEnemyQueue] = useState<number[]>([])
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null)
  const [hasAttackedThisTurn, setHasAttackedThisTurn] = useState(false)

  const enemyLabel = (i: number) => (enemyConfigs.length > 1 ? `${enemyConfigs[i].name} #${i + 1}` : enemyConfigs[i].name)

  function pushLog(node: React.ReactNode, kind?: LogEntry['kind']) {
    setLog(prev => [...prev, { id: prev.length, node, kind }])
  }

  function pushFlavor(lines?: string[]) {
    const line = pickLine(lines)
    if (line) pushLog(`"${line}"`, 'flavor')
  }

  function maxAffordableEsforco() {
    let n = 0
    while (triangular(n + 2) <= playerEstamina) n++
    return n
  }

  /** Custo de um ataque. Armas corpo a corpo usam a escala de Esforço (1, 1+2, 1+2+3...); armas de alcance somam o custo extra por distância. */
  function attackCostFor(atk: CombatAttack, esforcoValue: number) {
    if (atk.baseRange !== undefined) {
      const rangeExtra = distance > atk.baseRange ? triangular(distance - atk.baseRange) : 0
      return atk.staminaCost + rangeExtra
    }
    return triangular(esforcoValue + 1)
  }

  function goToEnemyPhase(aliveOverride?: number[]) {
    const aliveIndexes = aliveOverride ?? enemies.map((e, i) => (e.defeated ? -1 : i)).filter(i => i >= 0)
    if (aliveIndexes.length === 0) return
    const [first, ...rest] = aliveIndexes
    setEnemyQueue(rest)
    rollEnemyAttack(first)
    setPhase('awaiting-defense')
  }

  function rollEnemyAttack(enemyIndex: number) {
    const config = enemyConfigs[enemyIndex]
    const currentEstamina = enemies[enemyIndex].estamina
    const affordable = config.attacks.filter(a => a.staminaCost <= currentEstamina)
    const options = affordable.length > 0 ? affordable : config.attacks
    const atk = pickRandom(options)
    const dice = rollDice(atk.dice)
    const successes = countSuccesses(dice)
    setEnemies(prev => prev.map((e, i) => (i === enemyIndex ? { ...e, estamina: e.estamina - atk.staminaCost } : e)))
    setPendingAttack({ enemyIndex, attack: atk, dice, successes })
    pushLog(`${enemyLabel(enemyIndex)} ataca com ${atk.name} (${dice.join(', ')}).`, 'info')
  }

  function endRound() {
    setPlayerEstamina(player.maxEstamina)
    setEnemies(prev => prev.map((e, i) => (e.defeated ? e : { ...e, estamina: enemyConfigs[i].maxEstamina, pressure: e.attackedThisRound ? e.pressure : 0, attackedThisRound: false })))
    setRoundDefenses(0)
    setRound(r => r + 1)
    setHasAttackedThisTurn(false)
    pushLog(`— Fim da rodada. Estamina ⚡ recuperada. —`, 'info')
    setPhase('player-turn')
  }

  /** Ataques de oportunidade de todos os inimigos vivos (sem defesa possível, só reduz Casca). Retorna true se Orin caiu. */
  function opportunityAttacks(): boolean {
    let hp = playerCoracoes
    enemies.forEach((enemyState, i) => {
      if (enemyState.defeated || hp <= 0) return
      const config = enemyConfigs[i]
      const atk = pickRandom(config.attacks)
      const dice = rollDice(atk.dice)
      const successes = countSuccesses(dice)
      if (successes < 1) {
        pushLog(`Ataque de Oportunidade de ${enemyLabel(i)} (${dice.join(', ')}) — erra.`, 'miss')
        return
      }
      const raw = atk.damage + (successes - 1)
      const dano = Math.max(1, raw - player.casca)
      hp -= dano
      pushLog(`Ataque de Oportunidade de ${enemyLabel(i)} (${dice.join(', ')}) — Orin não pode reagir e sofre ${dano} de dano.`, 'hit')
      pushFlavor(config.lines?.onHit)
    })
    setPlayerCoracoes(Math.max(0, hp))
    if (hp <= 0) {
      pushLog(`${player.name} cai em combate. Derrota...`, 'info')
      setPhase('defeat')
      return true
    }
    return false
  }

  function performAttack(esforcoValue: number) {
    if (hasAttackedThisTurn) return
    const atk = player.attacks[selectedAttack]
    if (atk.singleUse && usedAttacks.has(selectedAttack)) return
    if (atk.meleeOnly && distance !== 0) return
    const target = enemies[selectedTarget]
    if (!target || target.defeated) return

    const cost = attackCostFor(atk, esforcoValue)
    if (cost > playerEstamina) return

    const extraDice = atk.baseRange === undefined ? esforcoValue : 0
    const attackerDice = rollDice(atk.dice + extraDice)
    const attackerSuccesses = countSuccesses(attackerDice)
    const targetConfig = enemyConfigs[selectedTarget]
    const defenseDice = rollDice(targetConfig.defenseDice)
    const defenseSuccesses = countSuccesses(defenseDice)
    const effective = Math.max(0, attackerSuccesses - defenseSuccesses)

    const nextEstamina = playerEstamina - cost
    setPlayerEstamina(nextEstamina)
    setHasAttackedThisTurn(true)
    if (atk.singleUse) {
      setUsedAttacks(prev => new Set(prev).add(selectedAttack))
      const nextAvailable = player.attacks.findIndex((a, i) => i !== selectedAttack && !(a.singleUse && usedAttacks.has(i)))
      if (nextAvailable >= 0) setSelectedAttack(nextAvailable)
    }

    const pressureIgnored = player.trilhaPressao ? target.pressure : 0
    const targetLabel = enemyLabel(selectedTarget)

    let nextCoracoes = target.coracoes
    let defeated = false
    if (effective < 1) {
      pushLog(`${player.name} ataca ${targetLabel} com ${atk.name} (${attackerDice.join(', ')}) — ela se defende (${defenseDice.join(', ')}) e o ataque não passa.`, 'miss')
    } else {
      const raw = atk.damage + (effective - 1)
      const dano = Math.max(1, raw - Math.max(0, targetConfig.casca - pressureIgnored))
      nextCoracoes = target.coracoes - dano
      defeated = nextCoracoes <= 0
      pushLog(
        <>
          {player.name} ataca {targetLabel} com {atk.name} ({attackerDice.join(', ')}) — ela se defende ({defenseDice.join(', ')}) e sofre {dano} de dano.
          {pressureIgnored > 0 && (
            <span style={{ color: 'var(--void-glow)' }}> (Pressão ignora {pressureIgnored} de Casca)</span>
          )}
        </>,
        'hit',
      )
      pushFlavor(targetConfig.lines?.onDamaged)
      pushFlavor(player.lines?.onHit)
      if (!defeated && nextCoracoes <= Math.ceil(targetConfig.maxCoracoes / 3)) {
        pushFlavor(targetConfig.lines?.onNearDefeat)
      }
      if (defeated) {
        pushLog(`${targetLabel} não resiste.`, 'info')
      }
    }

    setEnemies(prev => prev.map((e, i) => {
      if (i !== selectedTarget) return e
      const nextPressure = effective < 1 ? e.pressure : (player.trilhaPressao ? Math.min(2, e.pressure + 1) : e.pressure)
      return { ...e, coracoes: Math.max(0, nextCoracoes), defeated, pressure: nextPressure, attackedThisRound: true }
    }))

    const aliveAfter = enemies.map((e, i) => (i === selectedTarget ? defeated : e.defeated))
    const aliveIndexes = aliveAfter.map((isDead, i) => (isDead ? -1 : i)).filter(i => i >= 0)

    if (aliveIndexes.length === 0) {
      pushLog('Vitória!', 'info')
      setPhase('victory')
      return
    }
    // Se o alvo escolhido morreu, foca automaticamente no próximo vivo.
    if (defeated && !aliveIndexes.includes(selectedTarget)) {
      setSelectedTarget(aliveIndexes[0])
    }

    if (nextEstamina <= 0) {
      goToEnemyPhase(aliveIndexes)
    }
  }

  function performApproach() {
    if (distance <= 0 || playerEstamina < 1) return
    const nextEstamina = playerEstamina - 1
    setPlayerEstamina(nextEstamina)
    setDistance(d => Math.max(0, d - 1))
    pushLog(`${player.name} avança 1 quadrado em direção ao inimigo.`, 'info')
    if (nextEstamina <= 0) goToEnemyPhase()
  }

  function performRetreat() {
    if (distance >= distanceCap || playerEstamina < 1) return
    const wasAdjacent = distance === 0
    const nextEstamina = playerEstamina - 1
    setPlayerEstamina(nextEstamina)
    pushLog(`${player.name} se afasta 1 quadrado.`, 'info')
    if (wasAdjacent) {
      const died = opportunityAttacks()
      if (died) return
    }
    setDistance(d => Math.min(distanceCap, d + 1))
    if (nextEstamina <= 0) goToEnemyPhase()
  }

  function performDisengage() {
    if (distance !== 0 || playerEstamina < 1) return
    const nextEstamina = playerEstamina - 1
    setPlayerEstamina(nextEstamina)
    pushLog(`${player.name} se desvincula e salta 2 quadrados para trás.`, 'info')
    const died = opportunityAttacks()
    if (died) return
    setDistance(d => Math.min(distanceCap, d + 2))
    if (nextEstamina <= 0) goToEnemyPhase()
  }

  function endTurn() {
    pushLog(`${player.name} encerra o turno.`, 'info')
    goToEnemyPhase()
  }

  function resolveDefense(type: 'esquiva' | 'aparo' | 'nenhuma') {
    if (!pendingAttack) return
    const { enemyIndex, attack: atk } = pendingAttack
    const cost = type === 'nenhuma' ? 0 : triangular(roundDefenses + 1)
    if (cost > playerEstamina) return

    const defenseAttr = type === 'esquiva' ? player.graca : type === 'aparo' ? player.poder : 0
    const defenseDice = type === 'nenhuma' ? [] : rollDice(defenseAttr)
    const defenseSuccesses = countSuccesses(defenseDice)
    const effective = Math.max(0, pendingAttack.successes - defenseSuccesses)

    if (type !== 'nenhuma') {
      setPlayerEstamina(e => e - cost)
      setRoundDefenses(n => n + 1)
    }

    const attackerLabel = enemyLabel(enemyIndex)
    let nextPlayerCoracoes = playerCoracoes

    if (type === 'nenhuma') {
      if (effective < 1) {
        pushLog(`${player.name} não faz nada, mas o ataque de ${attackerLabel} erra mesmo assim.`, 'miss')
      } else {
        const raw = atk.damage + (effective - 1)
        const dano = Math.max(1, raw - player.casca)
        nextPlayerCoracoes = playerCoracoes - dano
        pushLog(`${player.name} não faz nada e sofre o ataque de ${attackerLabel} em cheio: ${dano} de dano.`, 'hit')
        setPlayerCoracoes(nextPlayerCoracoes)
        pushFlavor(enemyConfigs[enemyIndex].lines?.onHit)
        pushFlavor(player.lines?.onDamaged)
      }
    } else if (effective < 1) {
      pushLog(`${player.name} se defende (${type}, ${defenseDice.join(', ')}) e evita o ataque de ${attackerLabel}.`, 'miss')
    } else {
      const raw = atk.damage + (effective - 1)
      const dano = Math.max(1, raw - player.casca)
      nextPlayerCoracoes = playerCoracoes - dano
      pushLog(`${player.name} se defende (${type}, ${defenseDice.join(', ')}) mas sofre ${dano} de dano de ${attackerLabel}.`, 'hit')
      setPlayerCoracoes(nextPlayerCoracoes)
      pushFlavor(enemyConfigs[enemyIndex].lines?.onHit)
      pushFlavor(player.lines?.onDamaged)
    }

    setPendingAttack(null)

    if (nextPlayerCoracoes <= 0) {
      pushLog(`${player.name} cai em combate. Derrota...`, 'info')
      setPhase('defeat')
      return
    }

    if (enemyQueue.length > 0) {
      const [next, ...rest] = enemyQueue
      setEnemyQueue(rest)
      rollEnemyAttack(next)
    } else {
      endRound()
    }
  }

  function restart() {
    setPlayerCoracoes(player.maxCoracoes)
    setPlayerEstamina(player.maxEstamina)
    setDistance(initialDistance)
    setUsedAttacks(new Set())
    setEnemies(enemyConfigs.map(e => ({ coracoes: e.maxCoracoes, estamina: e.maxEstamina, pressure: 0, defeated: false, attackedThisRound: false })))
    setRound(1)
    setRoundDefenses(0)
    setPhase('player-turn')
    setLog([{ id: 0, node: pickLine(enemyConfigs[0]?.lines?.start) ?? 'O combate começa!', kind: 'info' }])
    setSelectedAttack(0)
    setSelectedTarget(0)
    setEnemyQueue([])
    setPendingAttack(null)
    setHasAttackedThisTurn(false)
  }

  const availableAttacks = player.attacks
    .map((a, i) => ({ a, i }))
    .filter(({ a, i }) => !(a.singleUse && usedAttacks.has(i)))

  const atk = player.attacks[selectedAttack]
  const isRanged = atk.baseRange !== undefined
  const maxEsforco = isRanged ? 0 : maxAffordableEsforco()
  const esforcoTiers = Array.from({ length: maxEsforco + 1 }, (_, n) => ({ esforco: n, cost: attackCostFor(atk, n) }))
  const baseAttackCost = attackCostFor(atk, 0)
  const meleeBlocked = atk.meleeOnly === true && distance !== 0
  const canAttackAtAll = !hasAttackedThisTurn && !meleeBlocked && baseAttackCost <= playerEstamina && !enemies[selectedTarget]?.defeated

  return (
    <div style={{ padding: '0.25rem' }}>
      <style>{`
        @media (max-width: 720px) {
          .combat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
        Rodada {round} · Distância: {distance} {distance === 1 ? 'quadrado' : 'quadrados'}
      </p>

      <div className="combat-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 200px', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'start' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem' }}>{player.icon} {player.name}</p>
          <StatusBar label="Corações" value={playerCoracoes} max={player.maxCoracoes} color="#b85c5c" />
          <StatusBar label="Estamina ⚡" value={playerEstamina} max={player.maxEstamina} color="var(--gold)" />
        </div>

        <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(0,0,0,0.15)' }}>
          {log.map(entry => (
            <p
              key={entry.id}
              style={{
                margin: 0, fontSize: '0.85rem', lineHeight: 1.6,
                color: entry.kind === 'hit' ? 'var(--gold-light)' : entry.kind === 'flavor' ? 'rgba(var(--text-rgb),0.55)' : entry.kind === 'miss' ? 'var(--text-muted)' : 'rgba(var(--text-rgb),0.7)',
                fontFamily: entry.kind === 'info' ? 'var(--font-cinzel)' : entry.kind === 'flavor' ? 'var(--font-im-fell)' : 'inherit',
                fontStyle: entry.kind === 'flavor' ? 'italic' : 'normal',
              }}
            >
              {entry.node}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {enemyConfigs.map((config, i) => (
            <div
              key={i}
              onClick={() => !enemies[i].defeated && setSelectedTarget(i)}
              style={{
                cursor: enemies[i].defeated ? 'default' : 'pointer', opacity: enemies[i].defeated ? 0.4 : 1,
                padding: '0.3rem 0.5rem', borderRadius: 6,
                border: i === selectedTarget && !enemies[i].defeated ? '1px solid var(--gold)' : '1px solid transparent',
              }}
            >
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.3rem' }}>
                {config.icon} {enemyLabel(i)} {enemies[i].defeated && '💀'}
              </p>
              <StatusBar label="Corações" value={enemies[i].coracoes} max={config.maxCoracoes} color="#b85c5c" />
              <StatusBar label="Estamina ⚡" value={enemies[i].estamina} max={config.maxEstamina} color="var(--gold)" />
              {player.trilhaPressao && !enemies[i].defeated && (
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--void-glow)', marginTop: '0.2rem' }}>
                  Pressão: {enemies[i].pressure}/2
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0 1rem' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(var(--gold-rgb),0.2)' }} />
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ações</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(var(--gold-rgb),0.2)' }} />
      </div>

      {phase === 'victory' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>Vitória!</p>
          <button type="button" onClick={restart} className="hk-btn hk-btn-soul" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem', borderRadius: 8 }}>🔄 Lutar novamente</button>
        </div>
      )}

      {phase === 'defeat' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Derrota...</p>
          <button type="button" onClick={restart} className="hk-btn hk-btn-soul" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem', borderRadius: 8 }}>🔄 Tentar novamente</button>
        </div>
      )}

      {phase === 'player-turn' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {availableAttacks.map(({ a, i }) => {
              const blocked = a.meleeOnly === true && distance !== 0
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => setSelectedAttack(i)}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: 6, fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', cursor: 'pointer',
                    border: i === selectedAttack ? '1px solid var(--gold)' : '1px solid rgba(var(--text-rgb),0.15)',
                    background: i === selectedAttack ? 'rgba(var(--gold-rgb),0.12)' : 'transparent',
                    color: i === selectedAttack ? 'var(--gold-light)' : 'var(--text-muted)',
                    opacity: blocked ? 0.7 : 1,
                  }}
                >
                  {a.name}{blocked ? ' (precisa estar adjacente)' : ''}
                </button>
              )
            })}
          </div>

          {!isRanged && maxEsforco > 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Esforço: role dados extras por mais chance de sucesso, a um custo crescente de Estamina ⚡.
            </p>
          )}

          {isRanged && atk.baseRange !== undefined && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Alcance base: {atk.baseRange} quadrados. Além disso, cada quadrado extra aumenta o custo em Estamina ⚡.
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
              {esforcoTiers.map(({ esforco: tierEsforco, cost }, idx) => {
                const disabled = !canAttackAtAll || cost > playerEstamina
                return (
                  <button
                    key={tierEsforco}
                    type="button"
                    onClick={() => performAttack(tierEsforco)}
                    disabled={disabled}
                    className="hk-btn hk-btn-soul"
                    style={{
                      fontSize: '0.9rem', padding: '0.65rem 1.1rem', borderRadius: 0,
                      borderLeft: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.25)',
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    {idx === 0 ? '🎲 Atacar ' : ''}
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>(-{cost} ⚡)</span>
                  </button>
                )
              })}
            </div>
            {hasAttackedThisTurn && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Já atacou nesta rodada.
              </span>
            )}
            <button
              type="button"
              onClick={performApproach}
              disabled={distance <= 0 || playerEstamina < 1}
              style={{
                fontSize: '0.85rem', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: distance <= 0 || playerEstamina < 1 ? 'default' : 'pointer',
                border: '1px solid rgba(var(--gold-rgb),0.3)', background: 'transparent', color: 'var(--gold-light)',
                opacity: distance <= 0 || playerEstamina < 1 ? 0.4 : 1,
              }}
            >
              🏃 Aproximar 1 quadrado (-1 ⚡)
            </button>
            <button
              type="button"
              onClick={performRetreat}
              disabled={distance >= distanceCap || playerEstamina < 1}
              style={{
                fontSize: '0.85rem', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: distance >= distanceCap || playerEstamina < 1 ? 'default' : 'pointer',
                border: '1px solid rgba(var(--gold-rgb),0.3)', background: 'transparent', color: 'var(--gold-light)',
                opacity: distance >= distanceCap || playerEstamina < 1 ? 0.4 : 1,
              }}
            >
              🏃 Afastar 1 quadrado (-1 ⚡){distance === 0 ? ' — provoca ataque de oportunidade' : ''}
            </button>
            {distance === 0 && (
              <button
                type="button"
                onClick={performDisengage}
                disabled={playerEstamina < 1}
                style={{
                  fontSize: '0.85rem', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: playerEstamina < 1 ? 'default' : 'pointer',
                  border: '1px solid rgba(var(--void-light-rgb),0.4)', background: 'transparent', color: 'var(--void-glow)',
                  opacity: playerEstamina < 1 ? 0.4 : 1,
                }}
              >
                ↩ Desvincular — salta 2 quadrados (-1 ⚡) — provoca ataque de oportunidade
              </button>
            )}
            <button
              type="button"
              onClick={endTurn}
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid rgba(var(--text-rgb),0.2)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ⏭ Encerrar turno
            </button>
          </div>
        </div>
      )}

      {phase === 'awaiting-defense' && pendingAttack && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{enemyLabel(pendingAttack.enemyIndex)} ataca:</p>
          <p style={{ marginBottom: '0.75rem' }}>
            <Dice values={pendingAttack.dice} />
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => resolveDefense('esquiva')}
              disabled={triangular(roundDefenses + 1) > playerEstamina}
              className="hk-btn hk-btn-soul"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', borderRadius: 8, opacity: triangular(roundDefenses + 1) > playerEstamina ? 0.4 : 1 }}
            >
              Esquivar (Graça, -{triangular(roundDefenses + 1)} ⚡)
            </button>
            <button
              type="button"
              onClick={() => resolveDefense('aparo')}
              disabled={triangular(roundDefenses + 1) > playerEstamina}
              className="hk-btn hk-btn-soul"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', borderRadius: 8, opacity: triangular(roundDefenses + 1) > playerEstamina ? 0.4 : 1 }}
            >
              Aparar (Poder, -{triangular(roundDefenses + 1)} ⚡)
            </button>
            <button
              type="button"
              onClick={() => resolveDefense('nenhuma')}
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: '1px solid rgba(var(--text-rgb),0.2)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Não defender
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
