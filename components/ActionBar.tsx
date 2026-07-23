'use client'

import { cloneElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import { HoverTip } from './SheetPrimitives'

export type ActionCardSpec = {
  key: string
  icon: string
  name: string
  disabled: boolean
  disabledReason: string | null
  /** Alcance dessa habilidade em células (Chebyshev) — quem chama usa isso pra
   * pintar de vermelho no mapa onde ela pode acertar, depois que o Esforço é
   * escolhido (ver `armMode`). Ausente = sem mapa pra pintar (ex: ficha, fora de
   * uma arena). */
  range?: number
  node: ReactElement<{
    onRoll?: () => void
    armMode?: boolean
    onArmedLevelChange?: (level: number | null) => void
    confirmToken?: number
    cancelToken?: number
  }>
}

/**
 * Barra de ação — PRIVADA: só o dono do personagem vê, e só quando é a vez dele
 * (`isMyTurn`). Componente único, pensado pra caber tanto na ficha solo (hoje)
 * quanto numa mesa multiplayer depois (Arena/MultiplayerArena) — quem monta
 * `actionCards` continua sendo quem tem acesso aos dados de personagem/item.
 *
 * Ícones fixos na base da tela, centralizados; clicar num ícone abre o `AbilityCard`
 * cheio (o mesmo `node` usado no painel "Ações") centralizado por cima de tudo.
 * `onCancelSelection`/`onEndTurn` são botões extras nas pontas (esquerda/direita),
 * afastados dos ícones — opcionais, só aparecem quando quem chama passa a função
 * (a ficha solo não tem "turno" ainda, então não passa nenhum dos dois).
 *
 * `mode`: hoje só existe `'attack'`. `'defense'` (opções ao levar um ataque) entra
 * depois, no mesmo componente — troca só o que `actionCards` contém, não a barra.
 */
export default function ActionBar({
  isMyTurn, actionCards, onCancelSelection, onEndTurn, onOpenCardChange,
  armMode, onArmedLevelChange, confirmToken, cancelToken, onAbilityRolled,
}: {
  isMyTurn: boolean
  mode: 'attack'
  actionCards: ActionCardSpec[]
  /** Botão "Cancelar seleção" na ponta esquerda da barra — ausente = não renderiza. */
  onCancelSelection?: () => void
  /** Botão "Passar turno" na ponta direita da barra — ausente = não renderiza. */
  onEndTurn?: () => void
  /** Avisa quem chama qual card está aberto agora (ou `null`, fechado) — usado pra
   * pintar o alcance da habilidade selecionada no mapa (ver `ActionCardSpec.range`). */
  onOpenCardChange?: (key: string | null) => void
  /** Repassado pro `AbilityCard` aberto — escolher o Esforço "arma" em vez de rolar
   * na hora (ver `AbilityCard.armMode`). Quando armado, o fundo escuro do card some
   * (sem desmontar o card — só escondido) pra deixar o mapa clicável por baixo. */
  armMode?: boolean
  /** Repassa o nível armado (ou `null`) do card aberto pra quem chama — é o gatilho
   * pra pintar o alcance no mapa. */
  onArmedLevelChange?: (level: number | null) => void
  /** Incrementar confirma o nível armado do card aberto agora. */
  confirmToken?: number
  /** Incrementar cancela o nível armado do card aberto (sem rolar). */
  cancelToken?: number
  /** Dispara quando a habilidade de fato ROLA (não quando só cancela) — diferente
   * do `onRoll` interno do card, que só fecha o modal. Usado, ex., pra tirar a
   * seleção de movimento do personagem depois que ele ataca. */
  onAbilityRolled?: () => void
}) {
  const [openActionCardKey, setOpenActionCardKey] = useState<string | null>(null)
  const [armedLevel, setArmedLevel] = useState<number | null>(null)
  const openActionCard = actionCards.find(c => c.key === openActionCardKey) ?? null

  useEffect(() => {
    onOpenCardChange?.(openActionCardKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só avisa quando a chave muda, não quando o callback é recriado
  }, [openActionCardKey])

  function handleArmedLevelChange(level: number | null) {
    setArmedLevel(level)
    onArmedLevelChange?.(level)
    // Nível confirmado (rolou) ou cancelado — os dois casos fecham o card de vez.
    if (level === null) setOpenActionCardKey(null)
  }

  function openCard(key: string) {
    setArmedLevel(null)
    setOpenActionCardKey(key)
  }

  if (!isMyTurn) return null

  const edgeButtonStyle: CSSProperties = {
    pointerEvents: 'auto',
    fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
    padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
    border: '1px solid rgba(var(--gold-rgb),0.35)', background: 'rgba(var(--bg-rgb),0.85)',
    color: 'var(--text)', boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 16, zIndex: 10003,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', padding: '0 1rem',
          pointerEvents: 'none',
        }}
      >
        <div style={{ marginRight: '1.5rem', flexShrink: 0 }}>
          {onCancelSelection && (
            <button type="button" onClick={onCancelSelection} style={edgeButtonStyle}>
              Cancelar seleção
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center" style={{ gap: '0.6rem', flex: 1 }}>
          {actionCards.map(c => (
            <HoverTip key={c.key} title={c.disabledReason ? `${c.name} — ${c.disabledReason}` : c.name}>
              <button
                type="button"
                onClick={() => openCard(c.key)}
                disabled={c.disabled}
                className="action-bar-icon-btn"
                style={{
                  pointerEvents: 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 46, height: 46, borderRadius: '50%', fontSize: '1.3rem', cursor: c.disabled ? 'not-allowed' : 'pointer',
                  border: '1px solid rgba(var(--gold-rgb),0.35)', background: 'rgba(var(--bg-rgb),0.85)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                  filter: c.disabled ? 'grayscale(1)' : 'none',
                  opacity: c.disabled ? 0.4 : 1,
                }}
              >
                {c.icon}
              </button>
            </HoverTip>
          ))}
        </div>

        <div style={{ marginLeft: '1.5rem', flexShrink: 0 }}>
          {onEndTurn && (
            <button type="button" onClick={onEndTurn} style={edgeButtonStyle}>
              Passar turno
            </button>
          )}
        </div>
      </div>

      {/* Card aberto a partir da barra — perto da base, logo acima dos ícones. `onRoll`
          fecha o card assim que a habilidade é rolada (clone só pra essa instância; o
          mesmo `node` usado no painel "Ações" não ganha esse fechamento).
          Em `armMode`: uma vez que um nível é armado, o fundo escuro SOME (display:
          none) — mas o card continua montado nessa mesma posição da árvore, só
          escondido, pra não perder o estado interno dele (`armedLevel`) enquanto
          espera o clique no mapa confirmar ou cancelar (ver `handleArmedLevelChange`). */}
      {openActionCard && (
        <div
          onClick={() => setOpenActionCardKey(null)}
          className="action-card-modal-backdrop"
          style={{
            position: 'fixed', inset: 0, zIndex: 10002,
            display: armedLevel === null ? 'flex' : 'none',
            alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', paddingBottom: 96,
          }}
        >
          <div className="action-card-pop-in" onClick={e => e.stopPropagation()}>
            {cloneElement(openActionCard.node, {
              onRoll: () => {
                setOpenActionCardKey(null)
                onAbilityRolled?.()
              },
              armMode,
              onArmedLevelChange: handleArmedLevelChange,
              confirmToken,
              cancelToken,
            })}
          </div>
        </div>
      )}
    </>
  )
}
