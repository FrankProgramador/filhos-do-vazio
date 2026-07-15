'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { fetchMyDiceSkins, type Atributos, type GameTrait, type Item, type OwnedDiceSkin, type Size, type Trilha, type TraitRarity } from '@/app/lib/gameData'
import { useAuth } from '@/app/lib/auth-context'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'
import { DICE_APPEARANCE_DEFAULT } from '@/app/painel/jogo/shared'
import type { DiceAppearance } from '@/app/lib/dice/diceEngine'

/**
 * Forma normalizada de dados que tanto a ficha salva (`/painel/personagens/[id]`)
 * quanto o resumo da criação (`Summary.tsx`) conseguem montar — a primeira a
 * partir de um `Character` persistido, a segunda a partir do rascunho ainda em
 * memória. O componente em si não sabe se o personagem já existe ou não.
 */
export type CharacterSheetTrait = GameTrait & {
  pivot: { quantity: number; is_extra: boolean }
}

export type CharacterSheetItem = Item & {
  pivot: { quantity: number; is_equipped: boolean; durability_remaining: number | null }
}

export interface CharacterSheetData {
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
  ['poder', 'Poder', '👊'],
  ['graca', 'Graça', '🪶'],
  ['casca', 'Casca', '🛡️'],
  ['saber', 'Saber', '📖'],
]

// Deslocamento não é mais derivado de Graça — agora é uma base fixa (5),
// independente de atributos, até existir alguma mecânica que o altere.
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

function AttrCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div style={{ padding: '0.85rem 0.9rem', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.18)', borderRadius: 10 }}>
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

// Placeholder até existir controle real de recursos em campanha — mostra
// atual/máximo com pips clicáveis (cheio/vazio). Estado é só local por enquanto.
function VitalBox({ icon, emptyIcon, label, max, color, colorRgb }: {
  icon: string; emptyIcon: string; label: string; max: number; color: string; colorRgb: string
}) {
  const [current, setCurrent] = useState(max)

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
              onClick={() => setCurrent(i + 1 === current ? i : i + 1)}
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

// Estágios de fome — placeholder de UI só, marcado manualmente por enquanto (não
// há mecânica de consumo de Sustento automática ainda). Índice do array = nº de
// marcadores preenchidos (0 = Saciado, 4 = Inanição).
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

function SustainAsidePanel({ sustentoAtual, sustentoMaximo, deslocamento }: {
  sustentoAtual: number; sustentoMaximo: number; deslocamento: number
}) {
  const [sustento, setSustento] = useState(Math.min(sustentoAtual, sustentoMaximo))
  const [hunger, setHunger] = useState(0)
  const stage = HUNGER_STAGES[hunger]
  const hungerColor = hunger === 0 ? 'var(--text-muted)' : hunger >= HUNGER_MAX ? 'var(--error)' : 'var(--gold)'
  const hungerColorRgb = hunger >= HUNGER_MAX ? 'var(--error-rgb)' : 'var(--gold-rgb)'

  return (
    <div className="flex gap-3 flex-nowrap" style={{ width: '100%' }}>
      {/* Card dividido: Refeições | Estágio da Fome — mesma estrutura do VitalBox
          (ícone + número/label em cima, pips embaixo) nas duas metades. Sobem/
          descem juntos (comer abaixa a fome, virar o dia sem comer sobe), por
          isso ficam no mesmo card. Ocupa metade do espaço; a outra metade é o
          card de Deslocamento, mesmo padrão de Coração/Estamina/Alma. */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'nowrap', padding: '0.8rem 1rem', background: 'var(--card)', border: `1px solid rgba(${hungerColorRgb},0.35)`, borderRadius: 10 }}>
        <VitalPipHalf
          icon="🍽️"
          primary={`${sustento}`}
          primarySuffix={`/${sustentoMaximo}`}
          label="Refeições"
          color="var(--gold)"
          current={sustento}
          max={sustentoMaximo}
          filledChar="🍞"
          onToggle={setSustento}
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
              <PipRow current={hunger} max={HUNGER_MAX} onToggle={setHunger} filledChar="😫" size="0.95rem" />
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: hungerColor }}>
                {stage.name}
              </span>
            </div>
          </HoverTip>
        </div>
      </div>

      {/* Deslocamento — mesmo modelo visual de Coração/Estamina/Alma (VitalBox) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <VitalBox icon="👣" emptyIcon="⚪" label="Deslocamento" max={deslocamento} color="var(--gold)" colorRgb="var(--gold-rgb)" />
      </div>
    </div>
  )
}

// Itens fixos usados como exemplo nos slots de Cabeça/Corpo enquanto não existe
// equipamento inicial real vindo da API. Puramente ilustrativo.
const MOCK_HEAD_ITEM: CharacterSheetItem = {
  id: -1, name: 'Máscara Comum', slug: 'mascara-comum-mock',
  description: 'Máscara simples de couro, cobre o rosto.',
  weight: 0.5, quality: null, base_price: 0, durability: null, is_consumable: false, type: 'accessory', image: null,
  pivot: { quantity: 1, is_equipped: true, durability_remaining: null },
}

const MOCK_BODY_ITEM: CharacterSheetItem = {
  id: -2, name: 'Vestes Comuns', slug: 'vestes-comuns-mock',
  description: 'Vestes de tecido leve, com bolsos e compartimentos reforçados.',
  weight: 1.5, quality: null, base_price: 0, durability: null, is_consumable: false, type: 'armor', image: null,
  pivot: { quantity: 1, is_equipped: true, durability_remaining: null },
}

// Quantos slots de acesso rápido (bolsos/cinto) cada peça de corpo libera —
// hardcoded por enquanto; deveria vir do item quando essa mecânica existir de verdade.
const QUICK_SLOTS_BY_BODY: Record<string, number> = {
  [MOCK_BODY_ITEM.slug]: 2,
}
const QUICK_SLOTS_MAX = 6

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
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
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

// Slots de equipamento (cabeça, corpo, mãos, acesso rápido) — conceito de UI só,
// estado local, sem persistência. Mão auxiliar dupla existe mas fica desabilitada
// até a mecânica de duas mãos existir. Slots de acesso rápido liberados dependem
// da peça de corpo equipada.
function EquipmentPanel({ items, poder }: { items: CharacterSheetItem[]; poder: number }) {
  const [head, setHead] = useState<CharacterSheetItem | null>(MOCK_HEAD_ITEM)
  const [body, setBody] = useState<CharacterSheetItem | null>(MOCK_BODY_ITEM)
  const [mainHand, setMainHand] = useState<CharacterSheetItem | null>(null)
  const [quickSlots, setQuickSlots] = useState<Array<CharacterSheetItem | null>>(() => Array(QUICK_SLOTS_MAX).fill(null))

  const quickEnabled = QUICK_SLOTS_BY_BODY[body?.slug ?? ''] ?? 0
  const pool = [MOCK_HEAD_ITEM, MOCK_BODY_ITEM, ...items]
  const assigned = [head, body, mainHand, ...quickSlots]
  const usedIds = new Set(assigned.filter((i): i is CharacterSheetItem => i !== null).map(i => i.id))

  function optionsFor(current: CharacterSheetItem | null) {
    return pool.filter(i => i.id === current?.id || !usedIds.has(i.id))
  }

  function setQuickSlot(index: number, value: CharacterSheetItem | null) {
    setQuickSlots(prev => prev.map((v, i) => (i === index ? value : v)))
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
        <EquipSlotRow label="Cabeça" icon="🎭" item={head} options={optionsFor(head)} onChange={setHead} />
        <EquipSlotRow label="Corpo" icon="👕" item={body} options={optionsFor(body)} onChange={setBody} />
        <EquipSlotRow label="Mão principal" icon="🗡️" item={mainHand} options={optionsFor(mainHand)} onChange={setMainHand} />
        <EquipSlotRow label="Mão auxiliar 1" icon="🛡️" item={null} options={[]} onChange={() => {}} disabled />
        <EquipSlotRow label="Mão auxiliar 2" icon="🛡️" item={null} options={[]} onChange={() => {}} disabled />
        <EquipSlotRow label="Mão auxiliar 3" icon="🛡️" item={null} options={[]} onChange={() => {}} disabled />
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
              onChange={value => setQuickSlot(i, value)}
              disabled={i >= quickEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Ações base sempre disponíveis (desarmado, arma da mão principal, bloqueio com
// escudo da mão auxiliar) — não vêm da API ainda, são fixas por enquanto.
// Habilidades de trilha (character.trilha.abilities) aparecem à parte, como
// cards simples, já que não têim "uso em dados" estruturado pra rolar.
const BASE_ABILITIES = [
  {
    slug: 'ataque-desarmado',
    name: 'Ataque Desarmado',
    icon: '👊',
    tipo: 'Ataque',
    usoLabel: 'Poder em dados',
    description: 'Ataca o oponente com as mãos nuas. O dano é a quantidade de acertos − Casca do oponente.',
  },
  {
    slug: 'ataque-mao-principal',
    name: 'Ataque — Mão Principal',
    icon: '🗡️',
    tipo: 'Ataque',
    usoLabel: 'Poder em dados',
    description: 'Usa a arma da mão principal. 1 acerto confere o dano base da arma, os demais aumentam o dano em 1. Reduz a Casca do dano; o dano mínimo em caso de acerto é 1.',
  },
  {
    slug: 'bloqueio-mao-auxiliar',
    name: 'Bloqueio — Mão Auxiliar',
    icon: '🛡️',
    tipo: 'Bloqueio',
    usoLabel: 'Poder em dados',
    description: 'Usa o escudo pra mitigar o dano do oponente. Um acerto concede o bloqueio base, os demais +1 de redução de dano.',
  },
] as const

// Níveis de Esforço: cada nível adiciona 1 dado à rolagem, custando Estamina em
// progressão triangular (1, 3, 6, 10 — n·(n+1)/2). Placeholder de UI só, rola
// dados aleatórios localmente, não desconta a Estamina de verdade ainda.
const EFFORT_LEVELS = [1, 2, 3, 4]

function AbilityCard({ icon, name, tipo, usoLabel, baseDice, description, buildAppearances }: {
  icon: string; name: string; tipo: string; usoLabel: string; baseDice: number; description: string
  buildAppearances: (count: number) => DiceAppearance[]
}) {
  const [roll, setRoll] = useState<{ level: number; dice: number[] } | null>(null)
  const { showDiceRoll } = useDiceStageContext()

  function rollEffort(level: number) {
    const diceCount = Math.max(1, baseDice + (level - 1))
    const dice = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6))
    setRoll({ level, dice })
    showDiceRoll(dice, name, buildAppearances(dice.length))
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
        Uso: {baseDice} {usoLabel}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.74rem', color: 'rgba(var(--text-rgb),0.55)', lineHeight: 1.55 }}>
        {description}
      </p>

      <div>
        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Esforço
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {EFFORT_LEVELS.map(level => {
            const cost = (level * (level + 1)) / 2
            const active = roll?.level === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => rollEffort(level)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '0.35rem 0.55rem', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid rgba(var(--gold-rgb),${active ? 0.6 : 0.25})`,
                  background: active ? 'rgba(var(--gold-rgb),0.16)' : 'var(--bg-secondary)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)' }}>{level}</span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', color: 'var(--gold)' }}>⚡{cost}</span>
              </button>
            )
          })}
        </div>
      </div>

      {roll && (
        <div style={{ padding: '0.5rem 0.6rem', background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.15)', borderRadius: 6 }}>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.52rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Rolagem ({roll.dice.length}d6)
          </span>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.15rem' }}>
            {roll.dice.join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CharacterSheetCard({ character }: { character: CharacterSheetData }) {
  const trilhaCfg = character.trilha ? TRILHA_TIPO_COLOR[character.trilha.tipo] : null
  const atributos = character.atributos

  const { token } = useAuth()
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

  const topLevelTraits = character.traits.filter(t => t.prerequisite_trait_id === null)
  const personalityTraits = topLevelTraits.filter(t => t.rarity === 'personality')
  const otherTraits = topLevelTraits.filter(t => t.rarity !== 'personality')
  const subTraitsByParent = (parentId: number) => character.traits.filter(t => t.prerequisite_trait_id === parentId)

  const totalWeight = character.items.reduce((sum, i) => sum + Number(i.weight) * i.pivot.quantity, 0)

  // Carga não é mais sublabel de Poder — agora é a capacidade de peso em si
  // (Poder × 2), mostrada como barra de uso no Inventário.
  const cargaMax = atributos.poder * 2
  const cargaPct = cargaMax > 0 ? Math.min(100, (totalWeight / cargaMax) * 100) : 0

  const beneficiosLines = character.trilha
    ? character.trilha.beneficios.split('\n').map(l => l.trim()).filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho — identidade + vitais */}
      <div className="parchment manuscript-ruled" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.15)' }}>
        <div style={{ padding: '1.5rem' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginBottom: '1rem' }}>
            <div className="flex items-start gap-4">
              <div style={{
                width: 84, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
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
              <div>
                <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--text)' }}>
                  {character.name || '—'} – Nível {character.level ?? 1}
                </h1>
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginTop: '0.2rem' }}>
                  {character.size.name}{character.species ? ` · ${character.species}` : ''}{character.age ? ` · ${character.age} estações` : ''}
                </p>
              </div>
            </div>

            <SustainAsidePanel
              sustentoAtual={character.sustento}
              sustentoMaximo={Math.max(1, character.sustentoMaximo ?? character.sustento)}
              deslocamento={DESLOCAMENTO_BASE}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {VITALS.map(v => (
              <VitalBox
                key={v.key}
                icon={v.icon}
                emptyIcon={v.emptyIcon}
                label={v.label}
                max={Math.max(1, Math.round(atributos[v.key]))}
                color={v.color}
                colorRgb={v.colorRgb}
              />
            ))}
          </div>

          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.62rem', color: 'rgba(var(--text-rgb),0.4)', textAlign: 'center', marginTop: '0.6rem' }}>
            › Clique nos recursos para ajustar o valor atual.
          </p>
        </div>
      </div>

      {/* Corpo: três colunas — Atributos | Ações | Inventário/Traços/Flavor */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_820px_1fr] gap-5">
        {/* Coluna esquerda: atributos + barras + trilha */}
        <div className="flex flex-col gap-4">
          <div className="ddb-panel p-5">
            <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Atributos Primários</h2>
            <div className="grid grid-cols-2 gap-3">
              {PRIMARY_ATTRS.map(([key, label, icon]) => (
                <AttrCard key={key} icon={icon} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

          <div className="ddb-panel p-4">
            <h2 className="ddb-section-title" style={{ marginBottom: '0.75rem' }}>Sociais</h2>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_ATTRS.map(([key, label, icon]) => (
                <IconRow key={key} icon={icon} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

          {character.trilha && trilhaCfg && (
            <div className="ddb-panel p-4" style={{ borderColor: trilhaCfg.border }}>
              <h2 className="ddb-section-title flex items-center gap-2" style={{ marginBottom: '0.6rem' }}>
                <span>{trilhaCfg.icon}</span> Trilha
              </h2>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', fontWeight: 700, color: trilhaCfg.color, marginBottom: '0.5rem' }}>
                {character.trilha.nome} {character.trilha.nivel ? `· Nv ${character.trilha.nivel}` : ''}
              </p>
              <div className="flex flex-col gap-1.5">
                {beneficiosLines.map((line, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.6, display: 'flex', gap: '0.4rem' }}>
                    <span style={{ color: trilhaCfg.color, flexShrink: 0 }}>◆</span> {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna do meio: ações (habilidades + esforço, rola nos dados 3D) */}
        <div className="flex flex-col gap-4">
          <div className="ddb-panel p-5">
            <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Ações</h2>
            <div className="flex flex-wrap gap-3">
              {BASE_ABILITIES.map(ability => (
                <AbilityCard
                  key={ability.slug}
                  icon={ability.icon}
                  name={ability.name}
                  tipo={ability.tipo}
                  usoLabel={ability.usoLabel}
                  baseDice={Math.max(1, Math.round(atributos.poder))}
                  description={ability.description}
                  buildAppearances={myAppearances}
                />
              ))}
            </div>

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
                        usoLabel="Poder em dados"
                        baseDice={Math.max(1, Math.round(atributos.poder))}
                        description={ability.description}
                        buildAppearances={myAppearances}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita: inventário, traços, flavor */}
        <div className="flex flex-col gap-4">
          {/* Inventário */}
          <div className="ddb-panel p-5">
            <div className="flex items-center justify-between mb-1" style={{ marginBottom: '1rem' }}>
              <h2 className="ddb-section-title">Inventário</h2>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Geo: {character.geo} 🪙</span>
            </div>

            {/* Equipamento — slots de cabeça, corpo, mãos e acesso rápido. Conceito: só front, estado local. */}
            <EquipmentPanel items={character.items} poder={atributos.poder} />

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

            {character.items.length === 0 && (
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

          {/* Aparência / História */}
          {(character.appearance || character.story) && (
            <div className="ddb-panel p-5">
              <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Aparência & História</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {character.appearance && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Aparência
                    </p>
                    <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.75 }}>
                      {character.appearance}
                    </p>
                    <div className="flex justify-end" style={{ marginTop: '0.4rem' }}>🪶</div>
                  </div>
                )}
                {character.story && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      História
                    </p>
                    <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.75 }}>
                      {character.story}
                    </p>
                    <div className="flex justify-end" style={{ marginTop: '0.4rem' }}>🪶</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
