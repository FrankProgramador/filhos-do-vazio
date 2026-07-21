'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  effortCost, fetchMyDiceSkins, updateCharacterItemSlot, updateCharacterResource, updateCharacterSustento,
  type Ability, type Atributos, type CharacterResourceEntry, type GameTrait, type Item, type OwnedDiceSkin,
  type Size, type Trilha, type TraitRarity,
} from '@/app/lib/gameData'
import { useAuth } from '@/app/lib/auth-context'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'
import { DICE_APPEARANCE_DEFAULT, SUCCESS_THRESHOLD } from '@/app/painel/jogo/shared'
import type { DiceAppearance } from '@/app/lib/dice/diceEngine'
import { computeRangeDisplay, resolveAbilityEffects, type RollContext } from '@/app/lib/abilityResolver'

/**
 * Forma normalizada de dados que tanto a ficha salva (`/painel/personagens/[id]`)
 * quanto o resumo da criação (`Summary.tsx`) conseguem montar — a primeira a
 * partir de um `Character` persistido, a segunda a partir do rascunho ainda em
 * memória. O componente em si não sabe se o personagem já existe ou não.
 *
 * `id`/`resources`/`abilities` são opcionais porque o rascunho de criação não tem
 * nada disso ainda (personagem nem foi salvo) — quando ausentes, os marcadores de
 * recurso e os slots de equipamento ficam só locais (sem chamar a API).
 */
export type CharacterSheetTrait = GameTrait & {
  pivot: { quantity: number; is_extra: boolean }
}

export type CharacterSheetItem = Item & {
  pivot: { quantity: number; is_equipped: boolean; durability_remaining: number | null; slot: string | null }
}

export interface CharacterSheetData {
  id?: number
  name: string
  avatar: string | null
  age?: number | string | null
  species?: string | null
  level?: number
  geo: number
  sustento: number
  sustentoMaximo?: number
  size: Size
  trilha: Trilha | null
  atributos: Atributos
  traits: CharacterSheetTrait[]
  items: CharacterSheetItem[]
  abilities?: Ability[]
  resources?: CharacterResourceEntry[]
  appearance?: string | null
  story?: string | null
}

function fmtAttr(v: number | string) {
  const n = Number(v)
  return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

// Casca e Saber já tiveram um "Cinto" e "Espaços de Técnica" como estatística
// secundária (slots de equipamento/técnica), mas nenhum dos dois está em uso —
// não há mecânica de slots implementada ainda. Não exibir até existir.
const PRIMARY_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['poder', 'Força', '👊'],
  ['graca', 'Graça', '🪶'],
  ['saber', 'Saber', '📖'],
  ['casca', 'Casca', '🛡️'],
]

// Rótulo do atributo pra "Teste de X" no card de habilidade — 'poder' aparece como
// "Força" aqui (mesmo nome usado em PRIMARY_ATTRS), os demais usam o nome do atributo.
const ATTR_TEST_LABELS: Record<string, string> = { poder: 'Força', graca: 'Graça', casca: 'Casca', saber: 'Saber' }

// Deslocamento não é mais derivado de Graça — agora é uma base fixa (5),
// espelhada em Character::DESLOCAMENTO_BASE no backend. Usada só como fallback
// enquanto o actor_resource "deslocamento" não existir pra esse personagem.
const DESLOCAMENTO_BASE = 5

const SOCIAL_ATTRS: Array<[keyof Atributos, string, string]> = [
  ['fofo', 'Fofo', '🐾'],
  ['assustador', 'Assustador', '🐺'],
]

const VITALS = [
  { key: 'coracao', label: 'Coração', icon: '❤️', emptyIcon: '🤍', color: 'var(--error)', colorRgb: 'var(--error-rgb)' },
  { key: 'estamina', label: 'Estamina', icon: '⚡', emptyIcon: '◽', color: 'var(--gold)', colorRgb: 'var(--gold-rgb)' },
  { key: 'alma', label: 'Alma', icon: '🔮', emptyIcon: '⚪', color: 'var(--void-glow)', colorRgb: 'var(--void-light-rgb)' },
] as const

const RARITY_LABELS: Record<TraitRarity, string> = {
  common: 'Comum',
  remarkable: 'Marcante',
  rare: 'Raro',
  personality: 'Personalidade',
}

const RARITY_BADGE_CLASS: Record<TraitRarity, string> = {
  common: 'ddb-badge ddb-badge-dim',
  remarkable: 'ddb-badge ddb-badge-gold',
  rare: 'badge badge--gold',
  personality: 'badge badge--success',
}

const TRILHA_TIPO_COLOR = {
  marcial: { color: 'var(--gold)', border: 'rgba(var(--gold-rgb),0.35)', bg: 'rgba(var(--gold-rgb),0.08)', icon: '⚔️' },
  mistico: { color: 'var(--void-glow)', border: 'rgba(var(--void-light-rgb),0.35)', bg: 'rgba(var(--void-light-rgb),0.08)', icon: '🌀' },
} as const

const ITEM_TYPE_ICON: Record<Item['type'], string> = {
  weapon: '🗡️', armor: '👕', shield: '🛡️', tool: '🔧', consumable: '🧪', accessory: '💍', other: '🎒',
}

// Ataque Desarmado é a única habilidade inata real (concedida a todo personagem no
// backend). Esse fallback só existe pro caso de o personagem ainda não ter sido
// migrado/backfillado — evita quebrar a ficha antes disso.
const FALLBACK_UNARMED_ABILITY: Ability = {
  id: -1, name: 'Ataque Desarmado', slug: 'ataque-desarmado',
  description: 'Ataca o oponente com as mãos nuas. O dano é a quantidade de acertos − Casca do oponente.',
  icon: '👊', is_passive: false, is_hidden: false, display_order: 0, range: null,
  target_type: 'single', target_filter: 'enemy', cooldown_base: null, steps: [],
  atributo: 'poder', resource: null, is_innate: true, custo: 1,
  is_bloqueio: false, range_calculation: null, builder_mode: 'advanced',
}

function findResourceEntry(resources: CharacterResourceEntry[], slug: string | null | undefined): CharacterResourceEntry | null {
  if (!slug) return null
  return resources.find(r => r.resource.slug === slug) ?? null
}

/** current/max de um recurso pelo slug — cai pro `fallback` (ex: atributo calculado, base fixa) enquanto o personagem não tiver esse actor_resource ainda. */
function resourceValue(resources: CharacterResourceEntry[], slug: string, fallback: number): { current: number; max: number } {
  const entry = findResourceEntry(resources, slug)
  return entry ? { current: entry.current, max: entry.base } : { current: fallback, max: fallback }
}

// Clicável: dispara um Teste do atributo (rola `value` d6, conta sucessos no modal).
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

// Coração/Estamina/Alma/Deslocamento — atual/máximo com pips clicáveis. Controlado
// pelo pai (que persiste via PATCH /resources quando o personagem já existe).
function VitalBox({ icon, emptyIcon, label, current, max, color, colorRgb, onToggle }: {
  icon: string; emptyIcon: string; label: string; current: number; max: number; color: string; colorRgb: string
  onToggle: (next: number) => void
}) {
  return (
    <div style={{ flex: '1 1 220px', padding: '0.8rem 1rem', background: 'var(--card)', border: `1px solid rgba(${colorRgb},0.35)`, borderRadius: 10 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
            {current}<span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>/{max}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
            {label}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < current
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i + 1 === current ? i : i + 1)}
              aria-label={`${label} ${i + 1} de ${max}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}
            >
              {filled ? icon : emptyIcon}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Mesma informação do VitalBox (label + atual/máx + pips clicáveis), só que sem
// ícone e tudo numa única linha — usado no cabeçalho ao lado do avatar, sem card
// próprio (a "moldura" ali é o cabeçalho inteiro, não cada item individualmente).
function VitalLine({ icon, emptyIcon, label, current, max, color, onToggle }: {
  icon: string; emptyIcon: string; label: string; current: number; max: number; color: string
  onToggle: (next: number) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color, width: 68, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', flexShrink: 0 }}>
        {current}<span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>/{max}</span>
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < current
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i + 1 === current ? i : i + 1)}
              aria-label={`${label} ${i + 1} de ${max}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.8rem' }}
            >
              {filled ? icon : emptyIcon}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Marcadores simples (círculo cheio/vazio) — usado pro Sustento, Estágio da Fome
// e Deslocamento no canto superior direito do cabeçalho. Sem `onToggle` vira só
// leitura (ex: Deslocamento, que não é algo que o jogador marca manualmente).
function PipRow({ current, max, onToggle, size = '0.8rem', filledChar = '●', emptyChar = '○' }: {
  current: number; max: number; onToggle?: (next: number) => void; size?: string; filledChar?: string; emptyChar?: string
}) {
  return (
    <div className="flex items-center gap-1" style={{ flexWrap: 'nowrap' }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < current
        const color = filled ? 'var(--gold)' : 'rgba(var(--text-rgb),0.25)'
        const char = filled ? filledChar : emptyChar
        if (!onToggle) {
          return <span key={i} style={{ fontSize: size, color, lineHeight: 1 }}>{char}</span>
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle(i + 1 === current ? i : i + 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: size, color }}
          >
            {char}
          </button>
        )
      })}
    </div>
  )
}

function HoverTip({ children, title, detail }: { children: ReactNode; title: string; detail?: string | null }) {
  return (
    <span className="hover-tip" tabIndex={0}>
      {children}
      <span className="hover-tip-bubble">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', display: 'block', marginBottom: detail ? '0.3rem' : 0 }}>
          {title}
        </span>
        {detail && (
          <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
            {detail}
          </span>
        )}
      </span>
    </span>
  )
}

// Estágios de fome — índice = nº de marcadores preenchidos (0 = Saciado, 4 = Inanição).
// O recurso "fome" persiste esse índice como `current` (max sempre 4).
const HUNGER_STAGES = [
  { name: 'Saciado', title: 'Está bem alimentado.', detail: null as string | null },
  { name: 'Com Fome', title: 'Começa a dar sinais. O estômago ronca.', detail: 'A fome faz recuperar menos 1 de Estamina por turno.' },
  { name: 'Faminto', title: 'Você começa a ficar mais fraco.', detail: 'A fome faz recuperar menos 2 de Estamina por turno.' },
  { name: 'Esfomeado', title: 'Está ficando difícil de se mover.', detail: 'A fome faz recuperar menos 3 de Estamina por turno.' },
  { name: 'Inanição', title: 'Está literalmente morrendo de fome.', detail: 'A fome faz recuperar menos 4 de Estamina e 1 Coração por turno.' },
] as const
const HUNGER_MAX = HUNGER_STAGES.length - 1

// Metade de um card dividido, seguindo exatamente a mesma estrutura visual do
// VitalBox (ícone + [texto grande + label embaixo], depois a fileira de pips) —
// só que o texto grande pode ser um "atual/máx" (Refeições) ou um nome de estágio
// em vez de número (Estágio da Fome).
function VitalPipHalf({ icon, primary, primarySuffix, label, color, current, max, filledChar, onToggle, tooltip }: {
  icon: string; primary: string; primarySuffix?: string; label: string; color: string
  current: number; max: number; filledChar: string; onToggle?: (next: number) => void
  tooltip?: { title: string; detail?: string | null }
}) {
  const pips = <PipRow current={current} max={max} onToggle={onToggle} filledChar={filledChar} size="0.95rem" />

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
            {primary}
            {primarySuffix && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>{primarySuffix}</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
            {label}
          </div>
        </div>
      </div>
      {tooltip ? <HoverTip title={tooltip.title} detail={tooltip.detail}>{pips}</HoverTip> : pips}
    </div>
  )
}

// Card dividido: Refeições | Estágio da Fome — mesma estrutura do VitalBox (ícone +
// número/label em cima, pips embaixo) nas duas metades. Sobem/descem juntos (comer
// abaixa a fome, virar o dia sem comer sobe), por isso ficam no mesmo card. Fica lado
// a lado com o avatar/nome e o Deslocamento numa grade de 3 colunas iguais (ver
// cabeçalho) — não pode depender do tamanho do nome pra manter alinhamento consistente.
function MealsHungerCard({
  sustento, sustentoMax, onSustentoToggle,
  hunger, onHungerToggle,
}: {
  sustento: number; sustentoMax: number; onSustentoToggle: (next: number) => void
  hunger: number; onHungerToggle: (next: number) => void
}) {
  const stage = HUNGER_STAGES[Math.min(hunger, HUNGER_MAX)]
  const hungerColor = hunger === 0 ? 'var(--text-muted)' : hunger >= HUNGER_MAX ? 'var(--error)' : 'var(--gold)'
  const hungerColorRgb = hunger >= HUNGER_MAX ? 'var(--error-rgb)' : 'var(--gold-rgb)'

  return (
    <div style={{ flex: '1 1 320px', display: 'flex', flexWrap: 'nowrap', padding: '0.8rem 1rem', background: 'var(--card)', border: `1px solid rgba(${hungerColorRgb},0.35)`, borderRadius: 10 }}>
      <VitalPipHalf
        icon="🍽️"
        primary={`${sustento}`}
        primarySuffix={`/${sustentoMax}`}
        label="Refeições"
        color="var(--gold)"
        current={sustento}
        max={sustentoMax}
        filledChar="🍞"
        onToggle={onSustentoToggle}
      />

      <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(var(--gold-rgb),0.15)', margin: '0 0.9rem' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>😫</span>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: hungerColor }}>
            Estágio da Fome
          </span>
        </div>
        <HoverTip title={stage.title} detail={stage.detail}>
          <div className="flex items-center gap-1.5">
            <PipRow current={hunger} max={HUNGER_MAX} onToggle={onHungerToggle} filledChar="😫" size="0.95rem" />
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: hungerColor }}>
              {stage.name}
            </span>
          </div>
        </HoverTip>
      </div>
    </div>
  )
}

// Linha de slot de equipamento (cabeça/corpo/mãos): ícone + rótulo + select +
// peso com selo de cadeado (fechado = ocupado, aberto = vazio — só decorativo).
function EquipSlotRow({ icon, label, item, options, onChange, disabled }: {
  label: string
  icon: string
  item: CharacterSheetItem | null
  options: CharacterSheetItem[]
  onChange: (item: CharacterSheetItem | null) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ width: 20, textAlign: 'center', fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
      <span style={{ width: 100, flexShrink: 0, fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
        {label}
      </span>

      {disabled ? (
        <span style={{ flex: 1, padding: '0.4rem 0.6rem', background: 'rgba(var(--text-rgb),0.03)', border: '1px dashed rgba(var(--gold-rgb),0.15)', borderRadius: 6, fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.68rem', color: 'rgba(var(--text-rgb),0.3)' }}>
          Indisponível
        </span>
      ) : (
        <select
          value={item?.id ?? ''}
          onChange={e => {
            const id = Number(e.target.value)
            onChange(id ? options.find(o => o.id === id) ?? null : null)
          }}
          style={{
            flex: 1, fontFamily: 'var(--font-cinzel)', fontSize: '0.66rem', padding: '0.4rem 0.6rem',
            background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid rgba(var(--gold-rgb),0.18)', borderRadius: 6,
          }}
        >
          <option value="">— vazio —</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>
              {o.name}{o.base_damage != null ? ` (dano ${o.base_damage})` : ''}{o.block_value != null ? ` (bloqueio ${o.block_value})` : ''}
            </option>
          ))}
        </select>
      )}

      {item && (item.base_damage != null || item.block_value != null) && (
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--gold)' }}>
          {item.base_damage != null && <>⚔️{item.base_damage}</>}
          {item.block_value != null && <>🛡️{item.block_value}</>}
        </span>
      )}

      <span style={{ width: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
        {item ? <>{fmtAttr(item.weight)} 🔒</> : <span style={{ opacity: 0.4 }}>🔓</span>}
      </span>
    </div>
  )
}

// Slot de acesso rápido: quadrado com ícone do item (por tipo) e um <select>
// transparente sobreposto — clique abre a lista nativa, visual fica de "ícone".
function QuickSlotBox({ index, item, options, onChange, disabled }: {
  index: number
  item: CharacterSheetItem | null
  options: CharacterSheetItem[]
  onChange: (item: CharacterSheetItem | null) => void
  disabled?: boolean
}) {
  const icon = item ? ITEM_TYPE_ICON[item.type] ?? '🎒' : '🎒'

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{
        position: 'relative', width: 52, height: 52, borderRadius: 8,
        background: item ? 'rgba(var(--gold-rgb),0.1)' : 'var(--bg-secondary)',
        border: `1px solid rgba(var(--gold-rgb),${item ? 0.35 : 0.15})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        {!disabled && (
          <select
            value={item?.id ?? ''}
            onChange={e => {
              const id = Number(e.target.value)
              onChange(id ? options.find(o => o.id === id) ?? null : null)
            }}
            aria-label={`Acesso rápido ${index + 1}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          >
            <option value="">— vazio —</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>{index + 1}</span>
    </div>
  )
}

const QUICK_SLOTS_MAX = 6

// Slots de equipamento (cabeça, corpo, mãos, acesso rápido) — persistido via
// pivot.slot em character_items. Mão auxiliar 2/3 seguem travadas (placeholder de
// criaturas com mais braços). Quantos slots de Acesso Rápido ficam ativos deveria
// depender da peça de corpo equipada, mas isso ainda não tem coluna no Item —
// por enquanto todos os 6 ficam sempre habilitados.
function EquipmentPanel({ items, poder, onAssignSlot }: {
  items: CharacterSheetItem[]; poder: number
  onAssignSlot: (slot: string, itemId: number | null) => void
}) {
  const bySlot = (slot: string) => items.find(i => i.pivot.slot === slot) ?? null
  const head = bySlot('head')
  const body = bySlot('body')
  const mainHand = bySlot('main_hand')
  const offHand1 = bySlot('off_hand_1')
  const quickSlots = Array.from({ length: QUICK_SLOTS_MAX }, (_, i) => bySlot(`quick_${i + 1}`))
  const quickEnabled = QUICK_SLOTS_MAX

  const assigned = [head, body, mainHand, offHand1, ...quickSlots]
  const usedIds = new Set(assigned.filter((i): i is CharacterSheetItem => i !== null).map(i => i.id))

  function optionsFor(current: CharacterSheetItem | null) {
    return items.filter(i => i.id === current?.id || !usedIds.has(i.id))
  }

  const equippedWeight = assigned.reduce((sum, i) => sum + (i ? Number(i.weight) : 0), 0)
  const maxEquipado = poder
  const pctEquipado = maxEquipado > 0 ? Math.min(100, (equippedWeight / maxEquipado) * 100) : 0

  return (
    <div className="flex flex-col gap-3" style={{ marginBottom: '1.5rem' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          Equipamento
        </span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          Peso equipado <strong style={{ color: pctEquipado >= 100 ? 'var(--error)' : 'var(--text)' }}>{equippedWeight}/{fmtAttr(maxEquipado)}</strong> (Poder {fmtAttr(poder)})
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pctEquipado}%`, background: pctEquipado >= 100 ? 'var(--error)' : 'var(--gold)', transition: 'width 0.2s' }} />
      </div>

      <div className="flex flex-col gap-2" style={{ marginTop: '0.25rem' }}>
        <EquipSlotRow label="Cabeça" icon="🎭" item={head} options={optionsFor(head)} onChange={i => onAssignSlot('head', i?.id ?? null)} />
        <EquipSlotRow label="Corpo" icon="👕" item={body} options={optionsFor(body)} onChange={i => onAssignSlot('body', i?.id ?? null)} />
        <EquipSlotRow label="Mão principal" icon="🗡️" item={mainHand} options={optionsFor(mainHand)} onChange={i => onAssignSlot('main_hand', i?.id ?? null)} />
        <EquipSlotRow label="Mão auxiliar 1" icon="🛡️" item={offHand1} options={optionsFor(offHand1)} onChange={i => onAssignSlot('off_hand_1', i?.id ?? null)} disabled={Boolean(mainHand?.is_two_handed)} />
        <EquipSlotRow label="Mão auxiliar 2" icon="🛡️" item={null} options={[]} onChange={() => { }} disabled />
        <EquipSlotRow label="Mão auxiliar 3" icon="🛡️" item={null} options={[]} onChange={() => { }} disabled />
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Acesso Rápido
          </span>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>
            Slots ativos: {quickEnabled}/{QUICK_SLOTS_MAX}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickSlots.map((slotItem, i) => (
            <QuickSlotBox
              key={i}
              index={i}
              item={slotItem}
              options={optionsFor(slotItem)}
              onChange={value => onAssignSlot(`quick_${i + 1}`, value?.id ?? null)}
              disabled={i >= quickEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Níveis de Esforço: cada nível adiciona 1 dado à rolagem. O custo segue a mesma
// LEI triangular sempre (n·(n+1)/2), indiferente de qual recurso é gasto — só que
// deslocada a partir do `custo` de cada habilidade em vez de sempre começar em 1
// (ver `effortCost` em gameData.ts).
const EFFORT_LEVELS = [1, 2, 3, 4]

function AbilityCard({
  icon, name, tipo, atributo, atributos, resources, resourceEntry, description, custo, ability, itemRef, characterName,
  minEffortLevel = 1, onEffortUsed, locked, buildAppearances, onSpendResource,
}: {
  icon: string; name: string; tipo: string
  atributo: keyof Atributos | null
  atributos: Atributos
  /** Lista completa de recursos do personagem — necessária pro resolver (Calculation pode referenciar qualquer Resource, não só o da Esforço). */
  resources: CharacterResourceEntry[]
  resourceEntry: CharacterResourceEntry | null
  description: string
  /** Custo do 1º uso (sem Esforço) no recurso da habilidade — o Esforço desloca a partir daqui (ver `effortCost`). */
  custo: number
  /** Habilidade completa — necessária pro resolver percorrer a árvore de steps. */
  ability: Ability
  /** Item equipado na mão que originou essa ação (arma/escudo), quando houver — monta o `RollContext`. */
  itemRef?: CharacterSheetItem | null
  characterName: string
  /** Nível mínimo de Esforço permitido agora — usado pelos ataques de mão pra forçar
   * escalada quando a OUTRA mão já atacou nesse turno (ver `onEffortUsed`). 1 = sem restrição. */
  minEffortLevel?: number
  /** Avisa o pai qual nível de Esforço acabou de ser usado — só as ações de ATAQUE de
   * mão passam isso (bloqueio não conta), pra travar essa mão e escalar a outra. */
  onEffortUsed?: (level: number) => void
  /** true quando essa mão já atacou nesse turno — cada mão só ataca 1x por turno. */
  locked?: boolean
  buildAppearances: (count: number) => DiceAppearance[]
  onSpendResource: (resourceSlug: string, newCurrent: number) => void
}) {
  const [activeLevel, setActiveLevel] = useState<number | null>(null)
  const { showDiceRoll } = useDiceStageContext()

  const baseDice = atributo ? Math.max(1, Math.round(atributos[atributo])) : 1

  const weaponContext: RollContext = {
    hits: 0,
    weapon_base_damage: itemRef?.base_damage ?? null,
    weapon_block_value: itemRef?.block_value ?? null,
    weapon_weight: itemRef ? Number(itemRef.weight) : null,
  }
  const rangeDisplay = itemRef?.min_range != null || itemRef?.max_range != null
    ? `${itemRef?.min_range ?? '?'}–${itemRef?.max_range ?? '?'}`
    : computeRangeDisplay(ability, atributos, weaponContext)

  // O card não mostra mais o resultado da rolagem — isso tudo vai pro modal dos
  // dados 3D (showDiceRoll já conta os sucessos sozinho a partir dos valores;
  // aqui só montamos o texto: quem rolou o quê, a descrição (se tiver) e o
  // efeito resolvido pela árvore de steps da habilidade (dano/bloqueio), se houver.
  function rollEffort(level: number) {
    const diceCount = Math.max(1, baseDice + (level - 1))
    const dice = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6))
    const successes = dice.filter(d => d >= SUCCESS_THRESHOLD).length

    setActiveLevel(level)

    const ctx: RollContext = { ...weaponContext, hits: successes }
    const resolvedEffects = resolveAbilityEffects(ability, atributos, resources, ctx)

    const lines = []
    if (description) lines.push(description)
    for (const resolved of resolvedEffects) {
      if (resolved.behaviorSlug === 'damage') {
        const label = ability.is_bloqueio ? 'Bloqueio' : 'Dano'
        lines.push(`${label}${resolved.elementName ? ` (${resolved.elementName})` : ''}: ${resolved.amount}`)
      } else {
        lines.push(resolved.effectName)
      }
    }

    showDiceRoll(dice, `${characterName} rolou ${name}`, lines.join('\n') || undefined, buildAppearances(dice.length))

    if (resourceEntry) {
      const cost = effortCost(custo, level)
      onSpendResource(resourceEntry.resource.slug, Math.max(0, resourceEntry.current - cost))
    }

    onEffortUsed?.(level)
  }

  return (
    <div className="ddb-panel p-4" style={{ width: 244, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{name}</div>
          <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.4rem' }}>{tipo}</span>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.54rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        Teste de {atributo ? ATTR_TEST_LABELS[atributo] ?? atributo : 'atributo'}
        {rangeDisplay !== null && <><br />Alcance: {rangeDisplay}</>}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.74rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.55 }}>
        {description}
      </p>

      {locked ? (
        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textAlign: 'center', border: '1px dashed rgba(var(--gold-rgb),0.2)', borderRadius: 6 }}>
          Já atacou nesse turno
        </p>
      ) : resourceEntry ? (
        <div>
          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Esforço ({resourceEntry.resource.name}: {resourceEntry.current}/{resourceEntry.base})
            {minEffortLevel > 1 && <><br />Outra mão já atacou — mín. nível {minEffortLevel}</>}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {EFFORT_LEVELS.map(level => {
              const cost = effortCost(custo, level)
              const active = activeLevel === level
              const usable = resourceEntry.current >= cost && level >= minEffortLevel
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => rollEffort(level)}
                  disabled={!usable}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '0.35rem 0.55rem', borderRadius: 6, cursor: usable ? 'pointer' : 'not-allowed',
                    border: `1px solid rgba(var(--gold-rgb),${active ? 0.6 : 0.25})`,
                    background: active ? 'rgba(var(--gold-rgb),0.16)' : 'var(--bg-secondary)',
                    opacity: usable ? 1 : 0.4,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)' }}>{level}</span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', color: 'var(--gold)' }}>⚡{cost}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => rollEffort(1)}
          disabled={minEffortLevel > 1}
          title={minEffortLevel > 1 ? 'Outra mão já atacou nesse turno — precisaria de Esforço pra atacar de novo.' : undefined}
          style={{
            fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text)',
            padding: '0.4rem 0.6rem', borderRadius: 6, cursor: minEffortLevel > 1 ? 'not-allowed' : 'pointer',
            border: '1px solid rgba(var(--gold-rgb),0.25)', background: 'var(--bg-secondary)',
            opacity: minEffortLevel > 1 ? 0.4 : 1,
          }}
        >
          Rolar {baseDice}d6
        </button>
      )}
    </div>
  )
}

type ResolvedHandAction = {
  key: string
  name: string
  icon: string
  tipo: string
  ability: Ability
  itemRef: CharacterSheetItem | null
  hand: 'main' | 'off' | 'both'
}

/**
 * Cada mão tem seu próprio conjunto de ações, resolvido a partir do que está
 * equipado nela. Quem decide o "sabor" é o próprio ITEM (`Item.abilities`,
 * configurável por item no admin — um escudo com espinhos pode conceder tanto
 * "Bloqueio com Escudo" quanto "Ataque com Espinhos" ao mesmo tempo, cada uma com
 * sua própria árvore de Steps resolvida por `resolveAbilityEffects`). Sem item ou
 * item sem `abilities`, cai na habilidade base (ex: Ataque Desarmado).
 */
function resolveHandActions(item: CharacterSheetItem | null, base: Ability, handLabel: string, hand: 'main' | 'off' | 'both'): ResolvedHandAction[] {
  const abilities = item && item.abilities.length > 0 ? item.abilities : [base]

  return abilities.map(ability => ({
    key: `hand-${handLabel}-${ability.slug}`,
    name: `${ability.name}${item ? ` — ${item.name}` : ''} (${handLabel})`,
    icon: ability.icon ?? (ability.is_bloqueio ? '🛡️' : '👊'),
    tipo: ability.is_bloqueio ? 'Bloqueio' : 'Ataque',
    ability,
    itemRef: item,
    hand,
  }))
}

export default function CharacterSheetCard({ character }: { character: CharacterSheetData }) {
  const trilhaCfg = character.trilha ? TRILHA_TIPO_COLOR[character.trilha.tipo] : null
  const atributos = character.atributos
  const { token } = useAuth()
  const { showDiceRoll } = useDiceStageContext()

  const [myDiceSkins, setMyDiceSkins] = useState<OwnedDiceSkin[]>([])
  useEffect(() => {
    fetchMyDiceSkins(token).then(setMyDiceSkins).catch(() => setMyDiceSkins([]))
  }, [token])

  /** Cicla pela coleção do jogador (ordem que ele escolheu) — branco padrão pros
   * dados que sobrarem, se ele não tiver skin suficiente. Mesmo critério de Arena.tsx. */
  function myAppearances(count: number): DiceAppearance[] {
    return Array.from({ length: count }, (_, i) => {
      const skin = myDiceSkins[i]
      if (!skin) return { ...DICE_APPEARANCE_DEFAULT }
      return { foreground: skin.foreground_color, background: skin.background_color, material: skin.material, texture: skin.texture, pipStyle: skin.pip_style }
    })
  }

  // Estado local pra pips (Coração/Estamina/Alma/Deslocamento/Fome) e Sustento —
  // espelha as props, atualiza otimista no clique, persiste via API só quando o
  // personagem já existe (character.id). No rascunho de criação fica só local.
  const [resources, setResources] = useState<CharacterResourceEntry[]>(character.resources ?? [])
  useEffect(() => setResources(character.resources ?? []), [character.resources])

  const [sustento, setSustento] = useState(character.sustento)
  useEffect(() => setSustento(character.sustento), [character.sustento])

  function handleResourceToggle(slug: string, next: number) {
    setResources(prev => prev.map(r => (r.resource.slug === slug ? { ...r, current: next } : r)))
    if (character.id) {
      updateCharacterResource(character.id, slug, next, token).catch(err => console.error('Falha ao atualizar recurso', err))
    }
  }

  function handleSustentoToggle(next: number) {
    setSustento(next)
    if (character.id) {
      updateCharacterSustento(character.id, next, token).catch(err => console.error('Falha ao atualizar sustento', err))
    }
  }

  // Ataque é uma habilidade só, mesmo vindo de mãos diferentes: cada mão só ataca
  // 1x por turno, e pra atacar com a SEGUNDA mão no mesmo turno é preciso um nível
  // de Esforço maior que o usado na primeira (atacou com 1 → a outra mão precisa
  // de 2, etc.). Bloqueio não é ataque, não entra nessa trava. `null` = nenhum
  // ataque ainda nesse turno, então o próximo pode ser nível 1.
  const [turnAttackLevel, setTurnAttackLevel] = useState<number | null>(null)
  const [mainHandAttacked, setMainHandAttacked] = useState(false)
  const [offHandAttacked, setOffHandAttacked] = useState(false)
  const minAttackLevel = turnAttackLevel === null ? 1 : turnAttackLevel + 1

  function registerHandAttack(hand: 'main' | 'off' | 'both', level: number) {
    setTurnAttackLevel(level)
    if (hand === 'main' || hand === 'both') setMainHandAttacked(true)
    if (hand === 'off' || hand === 'both') setOffHandAttacked(true)
  }

  // Botão de teste — trigger de início de turno. Por enquanto só sobe a Estamina
  // pro máximo e libera os ataques de novo; outros efeitos de turno (fome,
  // cooldowns...) entram aqui depois.
  function handleEndTurn() {
    const estaminaEntry = findResourceEntry(resources, 'estamina')
    const max = estaminaEntry ? estaminaEntry.base : Math.max(1, Math.round(atributos.estamina))
    handleResourceToggle('estamina', max)
    setTurnAttackLevel(null)
    setMainHandAttacked(false)
    setOffHandAttacked(false)
  }

  // Clicar num atributo primário (Poder/Graça/Casca/Saber) faz um Teste dele: rola
  // o valor do atributo em d6 e só conta sucessos no modal, sem dano/descrição.
  function handleAttributeTest(key: keyof Atributos, label: string) {
    const diceCount = Math.max(1, Math.round(atributos[key]))
    const dice = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6))
    showDiceRoll(dice, `${character.name} rolou Teste de ${label}`, undefined, myAppearances(dice.length))
  }

  // Itens levantados aqui (não dentro do EquipmentPanel) porque a coluna de Ações
  // também precisa saber o que está equipado nas mãos, pra resolver os ataques.
  const [items, setItems] = useState<CharacterSheetItem[]>(character.items)
  useEffect(() => setItems(character.items), [character.items])

  function assignItemSlot(slot: string, newItemId: number | null) {
    const previousItem = items.find(i => i.pivot.slot === slot) ?? null
    const newItem = newItemId !== null ? items.find(i => i.id === newItemId) ?? null : null
    const previousOffHand = slot === 'main_hand' && newItem?.is_two_handed
      ? items.find(i => i.pivot.slot === 'off_hand_1') ?? null
      : null

    setItems(prev => prev.map(i => {
      if (previousItem && i.id === previousItem.id) return { ...i, pivot: { ...i.pivot, slot: null, is_equipped: false } }
      if (previousOffHand && i.id === previousOffHand.id) return { ...i, pivot: { ...i.pivot, slot: null, is_equipped: false } }
      if (newItem && i.id === newItem.id) return { ...i, pivot: { ...i.pivot, slot, is_equipped: true } }
      return i
    }))

    if (!character.id) return
    const characterId = character.id

      ; (async () => {
        try {
          if (previousItem && previousItem.id !== newItemId) {
            await updateCharacterItemSlot(characterId, previousItem.id, null, token)
          }
          if (previousOffHand && previousOffHand.id !== newItemId) {
            await updateCharacterItemSlot(characterId, previousOffHand.id, null, token)
          }
          if (newItem) {
            await updateCharacterItemSlot(characterId, newItem.id, slot, token)
          }
        } catch (err) {
          console.error('Falha ao equipar item', err)
        }
      })()
  }

  const topLevelTraits = character.traits.filter(t => t.prerequisite_trait_id === null)
  const personalityTraits = topLevelTraits.filter(t => t.rarity === 'personality')
  const otherTraits = topLevelTraits.filter(t => t.rarity !== 'personality')
  const subTraitsByParent = (parentId: number) => character.traits.filter(t => t.prerequisite_trait_id === parentId)

  const totalWeight = items.reduce((sum, i) => sum + Number(i.weight) * i.pivot.quantity, 0)

  // Carga não é mais sublabel de Poder — agora é a capacidade de peso em si
  // (Poder × 2), mostrada como barra de uso no Inventário.
  const cargaMax = atributos.poder * 2
  const cargaPct = cargaMax > 0 ? Math.min(100, (totalWeight / cargaMax) * 100) : 0

  const beneficiosLines = character.trilha
    ? character.trilha.beneficios.split('\n').map(l => l.trim()).filter(Boolean)
    : []

  const coracaoVal = resourceValue(resources, 'coracao', Math.max(1, Math.round(atributos.coracao)))
  const estaminaVal = resourceValue(resources, 'estamina', Math.max(1, Math.round(atributos.estamina)))
  const almaVal = resourceValue(resources, 'alma', Math.max(1, Math.round(atributos.alma)))
  const deslocamentoVal = resourceValue(resources, 'deslocamento', DESLOCAMENTO_BASE)
  const fomeEntry = findResourceEntry(resources, 'fome')
  const hunger = fomeEntry ? fomeEntry.current : 0
  const sustentoMax = Math.max(1, character.sustentoMaximo ?? character.sustento)

  const characterAbilities = character.abilities ?? []
  const unarmedAbility = characterAbilities.find(a => a.slug === 'ataque-desarmado')
    ?? characterAbilities.find(a => a.is_innate)
    ?? FALLBACK_UNARMED_ABILITY

  const mainHandItem = items.find(i => i.pivot.slot === 'main_hand') ?? null
  const offHandItem = items.find(i => i.pivot.slot === 'off_hand_1') ?? null
  const isTwoHanded = Boolean(mainHandItem?.is_two_handed)

  const mainHandActions = resolveHandActions(mainHandItem, unarmedAbility, isTwoHanded ? 'Duas Mãos' : 'Mão Principal', isTwoHanded ? 'both' : 'main')
  const handActions = isTwoHanded ? mainHandActions : [...mainHandActions, ...resolveHandActions(offHandItem, unarmedAbility, 'Mão Auxiliar', 'off')]

  const otherAbilities = characterAbilities.filter(a => a.id !== unarmedAbility.id && !a.is_passive)
  const passiveAbilities = characterAbilities.filter(a => a.id !== unarmedAbility.id && a.is_passive)

  return (
    <div className="flex flex-col gap-5">
      {/* Botão de teste — dispara o início de turno (por enquanto só restaura a Estamina). */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleEndTurn}
          style={{
            fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
            color: 'var(--gold)', padding: '0.5rem 1.1rem', borderRadius: 7, cursor: 'pointer',
            background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.35)',
          }}
        >
          🔄 Virar Turno
        </button>
      </div>
      {/* Barra de identidade: Nome — Tamanho — Trilha(s). Suporta múltiplas
              trilhas (separadas por "|") ainda que hoje só exista uma por personagem. */}
      <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '1rem' }}>
        {character.name || '—'}
        <span style={{ color: 'rgba(var(--text-rgb),0.35)' }}> — </span>
        {character.size.name}
        {character.trilha && (
          <>
            <span style={{ color: 'rgba(var(--text-rgb),0.35)' }}> — </span>
            {[character.trilha.nome].join(' | ')}
          </>
        )}
      </h1>
      {/* Cabeçalho — identidade + vitais */}
      <div className="parchment manuscript-ruled" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.15)' }}>
        <div style={{ padding: '1.5rem' }}>


          {/* Avatar redondo + vitais (sem ícone, sem card por item) + os 4 atributos
              primários, todos na mesma linha: [avatar] recursos [Força][Graça][Saber][Casca]. */}
          <div className="flex items-start gap-5 flex-wrap" style={{ marginBottom: '1rem' }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: '2px solid rgba(var(--gold-rgb),0.35)', background: 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(var(--gold-rgb),0.1)',
            }}>
              {character.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={character.avatar} alt={`Avatar de ${character.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.8rem', color: 'var(--gold)' }}>
                  {character.name ? character.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2" style={{ flex: '1 1 240px', justifyContent: 'center' }}>
              <VitalLine icon="❤️" emptyIcon="🤍" label="Coração" current={coracaoVal.current} max={coracaoVal.max} color="var(--error)" onToggle={next => handleResourceToggle('coracao', next)} />
              <VitalLine icon="🔮" emptyIcon="⚪" label="Alma" current={almaVal.current} max={almaVal.max} color="var(--void-glow)" onToggle={next => handleResourceToggle('alma', next)} />
              <VitalLine icon="⚡" emptyIcon="◽" label="Estamina" current={estaminaVal.current} max={estaminaVal.max} color="var(--gold)" onToggle={next => handleResourceToggle('estamina', next)} />
            </div>

            <div className="grid grid-cols-4 gap-2" style={{ flex: '2 1 380px' }}>
              {PRIMARY_ATTRS.map(([key, label, icon]) => (
                <AttrCard key={key} icon={icon} label={label} value={atributos[key]} onClick={() => handleAttributeTest(key, label)} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SOCIAL_ATTRS.map(([key, label, icon]) => (
                <IconRow key={key} icon={icon} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Corpo: três colunas — Atributos | Ações | Inventário/Traços/Flavor */}
      <div className="grid grid-cols-1 lg:grid-cols-[450px_820px_1fr] gap-5">


        {/* Inventário, traços, flavor */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 flex-wrap">
            <MealsHungerCard
              sustento={sustento}
              sustentoMax={sustentoMax}
              onSustentoToggle={handleSustentoToggle}
              hunger={hunger}
              onHungerToggle={next => handleResourceToggle('fome', next)}
            />
            <VitalBox icon="👣" emptyIcon="⚪" label="Deslocamento" current={deslocamentoVal.current} max={deslocamentoVal.max} color="var(--gold)" colorRgb="var(--gold-rgb)" onToggle={next => handleResourceToggle('deslocamento', next)} />
          </div>
          {/* Inventário */}
          <div className="ddb-panel p-5">
            <div className="flex items-center justify-between mb-1" style={{ marginBottom: '1rem' }}>
              <h2 className="ddb-section-title">Inventário</h2>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Geo: {character.geo} 🪙</span>
            </div>

            {/* Equipamento — slots de cabeça, corpo, mãos e acesso rápido, persistidos via pivot.slot. */}
            <EquipmentPanel items={items} poder={atributos.poder} onAssignSlot={assignItemSlot} />

            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Mochila
              </span>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                Carga <strong style={{ color: cargaPct >= 100 ? 'var(--error)' : 'var(--text)' }}>{totalWeight}/{cargaMax}</strong> (Poder {fmtAttr(atributos.poder)} × 2)
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ height: '100%', width: `${cargaPct}%`, background: cargaPct >= 100 ? 'var(--error)' : 'var(--gold)', transition: 'width 0.2s' }} />
            </div>

            {items.length === 0 && (
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.35)' }}>
                Nenhum item.
              </p>
            )}
          </div>

          {/* Traços */}
          {(personalityTraits.length > 0 || otherTraits.length > 0) && (
            <div className="ddb-panel p-5">
              <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Traços</h2>

              <div className="flex flex-col gap-4">
                {personalityTraits.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                      Traços de Personalidade
                    </p>
                    <div className="flex flex-col gap-3">
                      {personalityTraits.map(trait => (
                        <div key={trait.id} className="card card--selected" style={{ padding: '1rem 1.125rem', borderRadius: 10 }}>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span>⭐</span>
                            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)' }}>{trait.name}</span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                            {trait.description}
                          </p>
                          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Obrigação:</strong> {trait.roleplay_obligation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {otherTraits.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Outros Traços
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {otherTraits.map(trait => {
                        const subs = subTraitsByParent(trait.id)
                        return (
                          <div key={trait.id}>
                            <div className="flex items-start gap-2 flex-wrap">
                              <span style={{ color: 'rgba(var(--gold-rgb),0.55)', fontSize: '0.6rem', marginTop: '0.2rem' }}>◆</span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text)' }}>
                                    {trait.name}{trait.pivot.quantity > 1 ? ` ×${trait.pivot.quantity}` : ''}
                                  </span>
                                  <span className={RARITY_BADGE_CLASS[trait.rarity]} style={{ fontSize: '0.42rem' }}>{RARITY_LABELS[trait.rarity]}</span>
                                  {trait.pivot.is_extra && <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.4rem' }}>Ganho em campanha</span>}
                                </div>
                                {subs.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.25rem', paddingLeft: '0.75rem' }}>
                                    <span style={{ color: 'rgba(var(--gold-rgb),0.35)', fontSize: '0.55rem' }}>◇</span>
                                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.64rem', color: 'rgba(var(--text-rgb),0.6)' }}>Sub-traço: {sub.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



        </div>
        {/* Ações (habilidades + esforço, rola nos dados 3D) */}
        <div className="flex flex-col gap-4">
          <div className="ddb-panel p-5">
            <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Ações</h2>
            <div className="flex flex-wrap gap-3">
              {handActions.map(action => {
                const isAttack = action.tipo === 'Ataque'
                const alreadyAttacked = action.hand === 'both'
                  ? mainHandAttacked || offHandAttacked
                  : action.hand === 'main' ? mainHandAttacked : offHandAttacked

                return (
                  <AbilityCard
                    key={action.key}
                    icon={action.icon}
                    name={action.name}
                    tipo={action.tipo}
                    atributo={action.ability.atributo}
                    atributos={atributos}
                    resources={resources}
                    resourceEntry={findResourceEntry(resources, action.ability.resource?.slug)}
                    description={action.ability.description}
                    custo={action.ability.custo}
                    ability={action.ability}
                    itemRef={action.itemRef}
                    characterName={character.name}
                    minEffortLevel={isAttack ? minAttackLevel : 1}
                    onEffortUsed={isAttack ? (level: number) => registerHandAttack(action.hand, level) : undefined}
                    locked={isAttack && alreadyAttacked}
                    buildAppearances={myAppearances}
                    onSpendResource={handleResourceToggle}
                  />
                )
              })}
              {otherAbilities.map(ability => (
                <AbilityCard
                  key={ability.id}
                  icon={ability.icon || '✨'}
                  name={ability.name}
                  tipo="Habilidade"
                  atributo={ability.atributo}
                  atributos={atributos}
                  resources={resources}
                  resourceEntry={findResourceEntry(resources, ability.resource?.slug)}
                  description={ability.description}
                  custo={ability.custo}
                  ability={ability}
                  characterName={character.name}
                  buildAppearances={myAppearances}
                  onSpendResource={handleResourceToggle}
                />
              ))}
            </div>

            {passiveAbilities.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Passivas
                </p>
                <div className="flex flex-wrap gap-3">
                  {passiveAbilities.map(ability => (
                    <div key={ability.id} className="card" style={{ padding: '0.7rem 0.9rem', borderRadius: 8, width: 244, flexShrink: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span>{ability.icon || '✨'}</span>
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{ability.name}</span>
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.4rem' }}>Passiva</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.72rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.5 }}>
                        {ability.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {character.trilha && character.trilha.abilities && character.trilha.abilities.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Habilidades de Trilha
                </p>
                <div className="flex flex-wrap gap-3">
                  {character.trilha.abilities.map(ability => (
                    ability.is_passive ? (
                      <div key={ability.id} className="card" style={{ padding: '0.7rem 0.9rem', borderRadius: 8, width: 244, flexShrink: 0 }}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span>{ability.icon || '✨'}</span>
                          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{ability.name}</span>
                          <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.4rem' }}>Passiva</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.72rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.5 }}>
                          {ability.description}
                        </p>
                      </div>
                    ) : (
                      <AbilityCard
                        key={ability.id}
                        icon={ability.icon || '✨'}
                        name={ability.name}
                        tipo="Habilidade"
                        atributo={ability.atributo}
                        atributos={atributos}
                        resources={resources}
                        resourceEntry={findResourceEntry(resources, ability.resource?.slug)}
                        description={ability.description}
                        custo={ability.custo}
                        ability={ability}
                        characterName={character.name}
                        buildAppearances={myAppearances}
                        onSpendResource={handleResourceToggle}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}
