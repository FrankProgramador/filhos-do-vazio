'use client'

import type { Atributos } from '@/app/lib/gameData'
import { PipRow } from './SheetPrimitives'

// Casca e Saber já tiveram um "Cinto" e "Espaços de Técnica" como estatística
// secundária (slots de equipamento/técnica), mas nenhum dos dois está em uso —
// não há mecânica de slots implementada ainda. Não exibir até existir.
const PRIMARY_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['poder', 'Força', '👊'],
  ['graca', 'Graça', '🪶'],
  ['saber', 'Saber', '📖'],
  ['casca', 'Casca', '🛡️'],
]

const SOCIAL_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['fofo', 'Fofo', '🐾'],
  ['assustador', 'Assustador', '🐺'],
]

function fmtAttr(v: number | string) {
  const n = Number(v)
  return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

// Clicável (quando `onClick` vem preenchido — só o dono da ficha rola testes;
// outros espectadores só veem o número): dispara um Teste do atributo.
function AttrCard({ icon, label, value, onClick }: { icon: string; label: string; value: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0.85rem 0.9rem', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.18)', borderRadius: 10,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.7rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
        {fmtAttr(value)}
      </div>
    </div>
  )
}

function IconRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2" style={{ padding: '0.55rem 0.75rem', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 8 }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '0.85rem' }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.54rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
        {fmtAttr(value)}
      </span>
    </div>
  )
}

// Mesma informação do VitalBox (label + atual/máx + pips), só que sem ícone e
// tudo numa única linha, sem card próprio (a "moldura" é o card do membro inteiro).
// `onToggle` ausente = só leitura (espectador vendo o status de outro membro).
function VitalLine({ icon, emptyIcon, label, current, max, color, onToggle }: {
  icon: string; emptyIcon: string; label: string; current: number; max: number; color: string
  onToggle?: (next: number) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color, width: 68, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', flexShrink: 0 }}>
        {current}<span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>/{max}</span>
      </span>
      <PipRow current={current} max={max} onToggle={onToggle} filledChar={icon} emptyChar={emptyIcon} size="0.8rem" />
    </div>
  )
}

export type PartyMemberVital = {
  key: string
  label: string
  icon: string
  emptyIcon: string
  current: number
  max: number
  color: string
  /** Ausente = só leitura — usado quando quem está vendo não é o dono do personagem. */
  onToggle?: (next: number) => void
}

export type PartyMemberStatus = {
  id: number | string
  name: string
  avatar: string | null
  atributos: Atributos
  vitals: PartyMemberVital[]
  /** Ausente = atributos só leitura (espectador). Presente = clique rola um Teste (dono da ficha). */
  onAttributeTest?: (key: keyof Atributos, label: string) => void
}

/**
 * Card compacto estilo "jogo de luta" (HUD de arena) — só avatar + nome + barra de
 * vida (primeiro vital da lista, tipicamente Coração) + os demais vitais em texto
 * pequeno. `mirrored` espelha o layout inteiro (avatar/texto/barra da direita pra
 * esquerda) — usado pro lutador do lado direito da tela, igual Street Fighter.
 */
function CompactMemberBar({ member, mirrored }: { member: PartyMemberStatus; mirrored: boolean }) {
  const [health, ...otherVitals] = member.vitals
  const pct = health && health.max > 0 ? Math.max(0, Math.min(100, (health.current / health.max) * 100)) : 0

  return (
    <div
      className="ddb-panel p-2"
      style={{ display: 'flex', flexDirection: mirrored ? 'row-reverse' : 'row', alignItems: 'center', gap: '0.6rem', width: 240 }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        border: '2px solid rgba(var(--gold-rgb),0.4)', background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {member.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatar} alt={`Avatar de ${member.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '0.9rem', color: 'var(--gold)' }}>
            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, textAlign: mirrored ? 'right' : 'left' }}>
        <div
          className="truncate"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.66rem', fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}
        >
          {member.name}
        </div>

        {health && (
          <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'rgba(0,0,0,0.45)', overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.3)' }}>
            <div
              style={{
                position: 'absolute', top: 0, bottom: 0, [mirrored ? 'right' : 'left']: 0,
                width: `${pct}%`, background: health.color, transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 3, justifyContent: mirrored ? 'flex-end' : 'flex-start' }}>
          {otherVitals.map(v => (
            <span key={v.key} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>
              {v.icon} {v.current}/{v.max}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * UI de status — COMPARTILHADA: vida/atributos vistos por todo mundo na mesa
 * (todos os jogadores + o mestre), não só pelo dono do personagem — essa é a
 * diferença chave em relação à `ActionBar`, que é privada. Um card por membro;
 * na ficha solo, `members` tem 1 item só (o próprio personagem) — é só o caso
 * normal de "mesa com 1 jogador", não um caso especial.
 *
 * `variant='compact'` (arena 1x1): HUD estilo jogo de luta — primeiro membro fica à
 * esquerda, segundo à direita (espelhado), pensado pra ficar fixo no topo da tela.
 */
export default function PartyStatusBar({ members, variant = 'full' }: { members: PartyMemberStatus[]; variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <>
        {members.map((member, i) => (
          <CompactMemberBar key={member.id} member={member} mirrored={i > 0} />
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {members.map(member => (
        <div
          key={member.id}
          className="parchment manuscript-ruled"
          style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.15)' }}
        >
          <div style={{ padding: '1.5rem' }}>
            <div className="flex items-start gap-5 flex-wrap">
              <div style={{
                width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(var(--gold-rgb),0.35)', background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(var(--gold-rgb),0.1)',
              }}>
                {member.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatar} alt={`Avatar de ${member.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.8rem', color: 'var(--gold)' }}>
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2" style={{ flex: '1 1 240px', justifyContent: 'center' }}>
                {member.vitals.map(v => (
                  <VitalLine key={v.key} icon={v.icon} emptyIcon={v.emptyIcon} label={v.label} current={v.current} max={v.max} color={v.color} onToggle={v.onToggle} />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2" style={{ flex: '2 1 380px' }}>
                {PRIMARY_ATTRS.map(([key, label, icon]) => (
                  <AttrCard
                    key={key} icon={icon} label={label} value={member.atributos[key]}
                    onClick={member.onAttributeTest ? () => member.onAttributeTest!(key, label) : undefined}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {SOCIAL_ATTRS.map(([key, label, icon]) => (
                  <IconRow key={key} icon={icon} label={label} value={member.atributos[key]} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
