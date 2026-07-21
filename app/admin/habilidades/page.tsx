'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import {
  adminAbilities, adminAttributes, adminCalculations, adminConditions, adminEffects, adminElements, adminResources,
  type AbilityPayload, type AbilityStepEffectPayload, type AbilityStepPayload, type StepConditionPayload,
} from '@/app/lib/adminData'
import type {
  Ability, AbilityStep, AbilityTargetFilterValue, AbilityTargetTypeValue, AbilityTriggerEventValue, Attribute,
  Calculation, Condition, Element, GameEffect, GameResource, StepCondition, StepConditionOperandValue,
  StepConditionOperatorValue, StepConditionOwnerValue, StepConditionTypeValue,
} from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'
import { ATRIBUTO_LABELS, ATRIBUTOS, type AtributoRolavel, OPERATOR_LABELS, OPERATORS, OWNER_LABELS, OWNERS } from './shared'
import SimpleAttackEditor from './SimpleAttackEditor'

const TARGET_TYPES: AbilityTargetTypeValue[] = ['self', 'single', 'area', 'line', 'cone']
const TARGET_TYPE_LABELS: Record<AbilityTargetTypeValue, string> = {
  self: 'Você mesmo', single: 'Alvo único', area: 'Área', line: 'Linha', cone: 'Cone',
}

const TARGET_FILTERS: AbilityTargetFilterValue[] = ['ally', 'enemy', 'any']
const TARGET_FILTER_LABELS: Record<AbilityTargetFilterValue, string> = {
  ally: 'Aliado', enemy: 'Inimigo', any: 'Qualquer',
}

const TRIGGER_EVENTS: AbilityTriggerEventValue[] = [
  'on_turn_start', 'on_turn_end', 'on_attack', 'on_defend', 'on_hit', 'on_use', 'on_move', 'on_dodge',
  'on_enemy_enters_adjacent', 'on_opposed_test', 'on_spell_damage', 'on_focus', 'on_death', 'on_kill', 'on_craft',
  'on_before_attack', 'on_miss', 'on_receive_attack', 'on_receive_hit', 'on_any',
]
const TRIGGER_EVENT_LABELS: Record<AbilityTriggerEventValue, string> = {
  on_turn_start: 'Início do turno', on_turn_end: 'Fim do turno', on_attack: 'Ao atacar', on_defend: 'Ao defender',
  on_hit: 'Ao acertar', on_use: 'Ao usar', on_move: 'Ao se mover', on_dodge: 'Ao esquivar',
  on_enemy_enters_adjacent: 'Inimigo entra adjacente', on_opposed_test: 'Teste oposto', on_spell_damage: 'Dano de feitiço',
  on_focus: 'Ação de Foco', on_death: 'Morte de adjacente', on_kill: 'Ao matar', on_craft: 'Ao criar',
  on_before_attack: 'Antes de atacar', on_miss: 'Ao errar', on_receive_attack: 'Ao ser atacado',
  on_receive_hit: 'Ao ser acertado', on_any: 'Qualquer evento',
}

const CONDITION_TYPES: StepConditionTypeValue[] = ['compare', 'has_condition', 'and', 'or']
const CONDITION_TYPE_LABELS: Record<StepConditionTypeValue, string> = {
  compare: 'Comparação', has_condition: 'Tem Condição de status', and: 'E (AND)', or: 'OU (OR)',
}

const OPERAND_TYPES: StepConditionOperandValue[] = ['fixed', 'attribute', 'resource', 'context']
const OPERAND_TYPE_LABELS: Record<StepConditionOperandValue, string> = {
  fixed: 'Valor Fixo', attribute: 'Atributo', resource: 'Recurso', context: 'Contexto',
}

const EMPTY_STEP_EFFECT = (effects: GameEffect[]): AbilityStepEffectPayload => ({
  effect_id: effects[0]?.id ?? 0, calculation_id: null, order: 0,
})

const EMPTY_CONDITION = (): StepConditionPayload => ({
  type: 'compare', left_type: 'attribute', left_owner: 'self', operator: '>', right_type: 'fixed', right_value: '0',
  children: [],
})

const EMPTY_STEP = (isElse: boolean, order: number): AbilityStepPayload => ({
  is_else: isElse, trigger: null, priority: 0, order, condition: null, step_effects: [], children: [],
})

const EMPTY: AbilityPayload = {
  name: '', slug: '', description: '', icon: '', is_passive: false, is_hidden: false, display_order: 0,
  range: null, target_type: 'self', target_filter: 'any', cooldown_base: null,
  atributo: null, resource_id: null, is_innate: false, custo: 1,
  is_bloqueio: false, range_calculation_id: null, builder_mode: 'advanced',
  steps: [],
}

function mapConditionToPayload(sc: StepCondition): StepConditionPayload {
  return {
    type: sc.type,
    left_type: sc.left_type, left_value: sc.left_value, left_ref_id: sc.left_ref_id, left_owner: sc.left_owner,
    operator: sc.operator,
    right_type: sc.right_type, right_value: sc.right_value, right_ref_id: sc.right_ref_id, right_owner: sc.right_owner,
    condition_owner: sc.condition_owner, condition_id: sc.condition_id,
    children: sc.children.map(mapConditionToPayload),
  }
}

function mapStepToPayload(s: AbilityStep): AbilityStepPayload {
  return {
    id: s.id,
    is_else: s.is_else,
    trigger: s.trigger,
    priority: s.priority,
    order: s.order,
    condition: s.condition_link ? mapConditionToPayload(s.condition_link.step_condition) : null,
    step_effects: s.step_effects.map(se => ({ effect_id: se.effect_id, calculation_id: se.calculation_id, order: se.order })),
    children: s.child_steps.map(mapStepToPayload),
  }
}

function OperandEditor({
  label, type, value, refId, owner, onChange, attributes, resources,
}: {
  label: string
  type: StepConditionOperandValue | null | undefined
  value: string | null | undefined
  refId: number | null | undefined
  owner: StepConditionOwnerValue | null | undefined
  onChange: (patch: { type?: StepConditionOperandValue; value?: string | null; ref_id?: number | null; owner?: StepConditionOwnerValue | null }) => void
  attributes: Attribute[]
  resources: GameResource[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={type ?? 'fixed'} onChange={e => onChange({ type: e.target.value as StepConditionOperandValue, ref_id: null, value: null })} style={{ width: 140 }}>
          {OPERAND_TYPES.map(t => <option key={t} value={t}>{OPERAND_TYPE_LABELS[t]}</option>)}
        </Select>

        {type === 'attribute' && (
          <Select value={refId ?? ''} onChange={e => onChange({ ref_id: e.target.value ? Number(e.target.value) : null })} style={{ width: 160 }}>
            <option value="">Selecione…</option>
            {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        )}
        {type === 'resource' && (
          <Select value={refId ?? ''} onChange={e => onChange({ ref_id: e.target.value ? Number(e.target.value) : null })} style={{ width: 160 }}>
            <option value="">Selecione…</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        )}
        {(type === 'fixed' || type === 'context') && (
          <Input value={value ?? ''} onChange={e => onChange({ value: e.target.value })} placeholder={type === 'fixed' ? 'ex: 0' : 'chave de contexto'} style={{ width: 140 }} />
        )}

        {(type === 'attribute' || type === 'resource') && (
          <Select value={owner ?? 'self'} onChange={e => onChange({ owner: e.target.value as StepConditionOwnerValue })} style={{ width: 130 }}>
            {OWNERS.map(o => <option key={o} value={o}>{OWNER_LABELS[o]}</option>)}
          </Select>
        )}
      </div>
    </div>
  )
}

function ConditionEditor({
  condition, onChange, attributes, resources, conditions,
}: {
  condition: StepConditionPayload | null
  onChange: (c: StepConditionPayload | null) => void
  attributes: Attribute[]
  resources: GameResource[]
  conditions: Condition[]
}) {
  if (!condition) {
    return (
      <button onClick={() => onChange(EMPTY_CONDITION())} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer' }}>
        + Adicionar condição
      </button>
    )
  }

  function patch(p: Partial<StepConditionPayload>) {
    onChange({ ...condition!, ...p })
  }

  function addChild() {
    patch({ children: [...condition!.children, EMPTY_CONDITION()] })
  }
  function updateChild(i: number, updated: StepConditionPayload) {
    patch({ children: condition!.children.map((c, idx) => idx === i ? updated : c) })
  }
  function removeChild(i: number) {
    patch({ children: condition!.children.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="card" style={{ padding: '0.75rem', borderRadius: 8, background: 'var(--bg)', border: '1px solid rgba(var(--text-rgb),0.12)' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={condition.type} onChange={e => patch({ type: e.target.value as StepConditionTypeValue })} style={{ width: 190 }}>
          {CONDITION_TYPES.map(t => <option key={t} value={t}>{CONDITION_TYPE_LABELS[t]}</option>)}
        </Select>
        <button onClick={() => onChange(null)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover condição</button>
      </div>

      {condition.type === 'compare' && (
        <div className="flex flex-col gap-2" style={{ marginTop: '0.6rem' }}>
          <OperandEditor
            label="Esquerda" type={condition.left_type} value={condition.left_value} refId={condition.left_ref_id} owner={condition.left_owner}
            onChange={p => patch({
              left_type: p.type ?? condition.left_type, left_value: p.value !== undefined ? p.value : condition.left_value,
              left_ref_id: p.ref_id !== undefined ? p.ref_id : condition.left_ref_id, left_owner: p.owner !== undefined ? p.owner : condition.left_owner,
            })}
            attributes={attributes} resources={resources}
          />
          <Field label="Operador" required>
            <Select value={condition.operator ?? ''} onChange={e => patch({ operator: e.target.value as StepConditionOperatorValue })} style={{ width: 220 }}>
              <option value="">Selecione…</option>
              {OPERATORS.map(o => <option key={o} value={o}>{OPERATOR_LABELS[o]}</option>)}
            </Select>
          </Field>
          <OperandEditor
            label="Direita" type={condition.right_type} value={condition.right_value} refId={condition.right_ref_id} owner={condition.right_owner}
            onChange={p => patch({
              right_type: p.type ?? condition.right_type, right_value: p.value !== undefined ? p.value : condition.right_value,
              right_ref_id: p.ref_id !== undefined ? p.ref_id : condition.right_ref_id, right_owner: p.owner !== undefined ? p.owner : condition.right_owner,
            })}
            attributes={attributes} resources={resources}
          />
        </div>
      )}

      {condition.type === 'has_condition' && (
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.6rem' }}>
          <Field label="Quem" required>
            <Select value={condition.condition_owner ?? 'target'} onChange={e => patch({ condition_owner: e.target.value as StepConditionOwnerValue })} style={{ width: 130 }}>
              {OWNERS.map(o => <option key={o} value={o}>{OWNER_LABELS[o]}</option>)}
            </Select>
          </Field>
          <Field label="Condição" required>
            <Select value={condition.condition_id ?? ''} onChange={e => patch({ condition_id: e.target.value ? Number(e.target.value) : null })} style={{ width: 200 }}>
              <option value="">Selecione…</option>
              {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
      )}

      {(condition.type === 'and' || condition.type === 'or') && (
        <div className="flex flex-col gap-2" style={{ marginTop: '0.6rem', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(var(--text-rgb),0.15)' }}>
          {condition.children.map((child, i) => (
            <div key={i} className="flex items-start gap-2">
              <div style={{ flex: 1 }}>
                <ConditionEditor condition={child} onChange={c => c ? updateChild(i, c) : removeChild(i)} attributes={attributes} resources={resources} conditions={conditions} />
              </div>
            </div>
          ))}
          <button onClick={addChild} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar sub-condição</button>
        </div>
      )}
    </div>
  )
}

function StepEditor({
  step, onChange, onRemove, isRoot, effects, calculations, attributes, resources, conditions,
}: {
  step: AbilityStepPayload
  onChange: (updated: AbilityStepPayload) => void
  onRemove: () => void
  isRoot: boolean
  effects: GameEffect[]
  calculations: Calculation[]
  attributes: Attribute[]
  resources: GameResource[]
  conditions: Condition[]
}) {
  function patch(p: Partial<AbilityStepPayload>) {
    onChange({ ...step, ...p })
  }

  function addStepEffect() {
    if (effects.length === 0) return
    patch({ step_effects: [...step.step_effects, { ...EMPTY_STEP_EFFECT(effects), order: step.step_effects.length }] })
  }
  function updateStepEffect(i: number, p: Partial<AbilityStepEffectPayload>) {
    patch({ step_effects: step.step_effects.map((se, idx) => idx === i ? { ...se, ...p } : se) })
  }
  function removeStepEffect(i: number) {
    patch({ step_effects: step.step_effects.filter((_, idx) => idx !== i) })
  }

  const thenChildren = step.children.filter(c => !c.is_else)
  const elseChildren = step.children.filter(c => c.is_else)

  function addBranchStep(isElse: boolean) {
    const branch = isElse ? elseChildren : thenChildren
    patch({ children: [...step.children, EMPTY_STEP(isElse, branch.length)] })
  }
  function updateChild(original: AbilityStepPayload, updated: AbilityStepPayload) {
    patch({ children: step.children.map(c => c === original ? updated : c) })
  }
  function removeChild(target: AbilityStepPayload) {
    patch({ children: step.children.filter(c => c !== target) })
  }

  return (
    <div className="card" style={{ padding: '0.85rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {isRoot && (
          <Field label="Gatilho" required>
            <Select value={step.trigger ?? ''} onChange={e => patch({ trigger: e.target.value as AbilityTriggerEventValue })}>
              <option value="">Selecione…</option>
              {TRIGGER_EVENTS.map(ev => <option key={ev} value={ev}>{TRIGGER_EVENT_LABELS[ev]}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Prioridade">
          <Input type="number" value={step.priority} onChange={e => patch({ priority: Number(e.target.value) })} />
        </Field>
        <Field label="Ordem">
          <Input type="number" value={step.order} onChange={e => patch({ order: Number(e.target.value) })} />
        </Field>
        <div className="flex items-end">
          <button onClick={onRemove} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover Step</button>
        </div>
      </div>

      <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0.85rem 0 0.4rem' }}>
        Condição
      </h4>
      <ConditionEditor condition={step.condition} onChange={c => patch({ condition: c })} attributes={attributes} resources={resources} conditions={conditions} />

      <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0.85rem 0 0.4rem' }}>
        Step Effects
      </h4>
      <div className="flex flex-col gap-2">
        {effects.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum Effect cadastrado.</p>}
        {step.step_effects.map((se, ei) => (
          <div key={ei} className="flex items-center gap-2 flex-wrap">
            <Select value={se.effect_id} onChange={e => updateStepEffect(ei, { effect_id: Number(e.target.value) })} style={{ width: 220 }}>
              {effects.map(eff => <option key={eff.id} value={eff.id}>{eff.name}</option>)}
            </Select>
            <Select
              value={se.calculation_id ?? ''}
              onChange={e => updateStepEffect(ei, { calculation_id: e.target.value ? Number(e.target.value) : null })}
              style={{ width: 220 }}
            >
              <option value="">Sem Cálculo</option>
              {calculations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input type="number" value={se.order} onChange={e => updateStepEffect(ei, { order: Number(e.target.value) })} style={{ width: 90 }} placeholder="Ordem" />
            <button onClick={() => removeStepEffect(ei)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover</button>
          </div>
        ))}
        <button onClick={addStepEffect} disabled={effects.length === 0} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar step effect</button>
      </div>

      {step.condition && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginTop: '0.85rem' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Então
            </h4>
            <div className="flex flex-col gap-2">
              {thenChildren.map((child, i) => (
                <StepEditor
                  key={i} step={child} isRoot={false}
                  onChange={updated => updateChild(child, updated)}
                  onRemove={() => removeChild(child)}
                  effects={effects} calculations={calculations} attributes={attributes} resources={resources} conditions={conditions}
                />
              ))}
              <button onClick={() => addBranchStep(false)} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar step (então)</button>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Senão
            </h4>
            <div className="flex flex-col gap-2">
              {elseChildren.map((child, i) => (
                <StepEditor
                  key={i} step={child} isRoot={false}
                  onChange={updated => updateChild(child, updated)}
                  onRemove={() => removeChild(child)}
                  effects={effects} calculations={calculations} attributes={attributes} resources={resources} conditions={conditions}
                />
              ))}
              <button onClick={() => addBranchStep(true)} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar step (senão)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminHabilidadesPage() {
  const { token } = useAuth()
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [effects, setEffects] = useState<GameEffect[]>([])
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [resources, setResources] = useState<GameResource[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [elements, setElements] = useState<Element[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [builderMode, setBuilderMode] = useState<'simple_attack' | 'advanced' | null>(null)
  const [form, setForm] = useState<AbilityPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminEffects.list(token).then(setEffects)
    adminCalculations.list(token).then(setCalculations)
    adminAttributes.list(token).then(setAttributes)
    adminResources.list(token).then(setResources)
    adminConditions.list(token).then(setConditions)
    adminElements.list(token).then(setElements)
    return adminAbilities.list(token).then(setAbilities).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  const editingAbility = editingId ? abilities.find(a => a.id === editingId) ?? null : null

  function startCreate(mode: 'simple_attack' | 'advanced') {
    setEditingId(0)
    setBuilderMode(mode)
    setForm(EMPTY)
    setError(null)
  }
  function startEdit(a: Ability) {
    setEditingId(a.id)
    setBuilderMode(a.builder_mode)
    setForm({
      name: a.name,
      slug: a.slug,
      description: a.description,
      icon: a.icon,
      is_passive: a.is_passive,
      is_hidden: a.is_hidden,
      display_order: a.display_order,
      range: a.range,
      target_type: a.target_type,
      target_filter: a.target_filter,
      cooldown_base: a.cooldown_base,
      atributo: a.atributo,
      resource_id: a.resource?.id ?? null,
      is_innate: a.is_innate,
      custo: a.custo,
      is_bloqueio: a.is_bloqueio,
      range_calculation_id: a.range_calculation?.id ?? null,
      builder_mode: a.builder_mode,
      steps: a.steps.map(mapStepToPayload),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setBuilderMode(null); setForm(EMPTY); setError(null) }

  function addRootStep() {
    setForm({ ...form, steps: [...form.steps, { ...EMPTY_STEP(false, form.steps.length), trigger: 'on_use' }] })
  }
  function updateRootStep(original: AbilityStepPayload, updated: AbilityStepPayload) {
    setForm({ ...form, steps: form.steps.map(s => s === original ? updated : s) })
  }
  function removeRootStep(target: AbilityStepPayload) {
    setForm({ ...form, steps: form.steps.filter(s => s !== target) })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminAbilities.update(token, editingId, form)
      else await adminAbilities.create(token, form)
      await load()
      cancel()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    try {
      await adminAbilities.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  function countAllSteps(steps: AbilityStep[]): number {
    return steps.reduce((n, s) => n + 1 + countAllSteps(s.child_steps), 0)
  }
  function countAllEffects(steps: AbilityStep[]): number {
    return steps.reduce((n, s) => n + s.step_effects.length + countAllEffects(s.child_steps), 0)
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1200 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Habilidades</h1>
        {editingId === null && (
          <div className="flex items-center gap-2">
            <button onClick={() => startCreate('simple_attack')} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Ataque (simples)</button>
            <button onClick={() => startCreate('advanced')} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem', borderRadius: 6 }}>+ Avançado</button>
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', maxWidth: 700 }}>
        A Ability orquestra uma árvore de Steps: cada step raiz responde a um evento (trigger); uma Condição (árvore de comparações/E/OU/status) decide entre os ramos Então/Senão, que por sua vez podem ter suas próprias condições aninhadas; cada step executa Step Effects (um Effect + opcionalmente uma Calculation que parametriza o valor, só pra este step).
      </p>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && builderMode === 'simple_attack' && (
        <SimpleAttackEditor
          token={token}
          ability={editingAbility}
          attributes={attributes}
          resources={resources}
          elements={elements}
          conditions={conditions}
          onSaved={() => { load(); cancel() }}
          onCancel={cancel}
        />
      )}

      {editingId !== null && builderMode === 'advanced' && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Habilidade' : 'Nova Habilidade'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Ícone (URL/chave)"><Input value={form.icon ?? ''} onChange={e => setForm({ ...form, icon: e.target.value })} /></Field>
            <Field label="Ordem de exibição"><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></Field>
            <Field label="Alcance"><Input type="number" min={0} value={form.range ?? ''} onChange={e => setForm({ ...form, range: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Cooldown base (turnos)"><Input type="number" min={0} value={form.cooldown_base ?? ''} onChange={e => setForm({ ...form, cooldown_base: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Forma do alvo" required>
              <Select value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value as AbilityTargetTypeValue })}>
                {TARGET_TYPES.map(t => <option key={t} value={t}>{TARGET_TYPE_LABELS[t]}</option>)}
              </Select>
            </Field>
            <Field label="Filtro do alvo" required>
              <Select value={form.target_filter} onChange={e => setForm({ ...form, target_filter: e.target.value as AbilityTargetFilterValue })}>
                {TARGET_FILTERS.map(f => <option key={f} value={f}>{TARGET_FILTER_LABELS[f]}</option>)}
              </Select>
            </Field>
            <Field label="Atributo (rolagem)">
              <Select value={form.atributo ?? ''} onChange={e => setForm({ ...form, atributo: e.target.value ? e.target.value as AtributoRolavel : null })}>
                <option value="">— nenhum —</option>
                {ATRIBUTOS.map(a => <option key={a} value={a}>{ATRIBUTO_LABELS[a]}</option>)}
              </Select>
            </Field>
            <Field label="Recurso do Esforço">
              <Select value={form.resource_id ?? ''} onChange={e => setForm({ ...form, resource_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— sem Esforço —</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </Field>
            <Field label="Custo (1º uso, sem Esforço)" required>
              <Input type="number" min={1} value={form.custo} onChange={e => setForm({ ...form, custo: Number(e.target.value) })} />
            </Field>
            <Field label="Cálculo de Alcance (exibição)">
              <Select value={form.range_calculation_id ?? ''} onChange={e => setForm({ ...form, range_calculation_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— sem cálculo de alcance —</option>
                {calculations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <div className="flex items-center gap-4" style={{ paddingTop: '1.5rem' }}>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_passive" checked={form.is_passive} onChange={e => setForm({ ...form, is_passive: e.target.checked })} />
                <label htmlFor="is_passive" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Passiva</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_hidden" checked={form.is_hidden} onChange={e => setForm({ ...form, is_hidden: e.target.checked })} />
                <label htmlFor="is_hidden" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Oculta</label>
              </div>
            </div>
            <div className="flex items-center gap-4" style={{ paddingTop: '0.5rem' }}>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_innate" checked={form.is_innate} onChange={e => setForm({ ...form, is_innate: e.target.checked })} />
                <label htmlFor="is_innate" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Inata (todo personagem já tem)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_bloqueio" checked={form.is_bloqueio} onChange={e => setForm({ ...form, is_bloqueio: e.target.checked })} />
                <label htmlFor="is_bloqueio" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>É bloqueio (não conta como ataque)</label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field label="Descrição" required><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Steps
          </h3>
          <div className="flex flex-col gap-3">
            {form.steps.map((step, si) => (
              <StepEditor
                key={si} step={step} isRoot
                onChange={updated => updateRootStep(step, updated)}
                onRemove={() => removeRootStep(step)}
                effects={effects} calculations={calculations} attributes={attributes} resources={resources} conditions={conditions}
              />
            ))}
            <button onClick={addRootStep} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar step</button>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Passiva', 'Alvo', 'Steps', '']}>
          {abilities.map(a => (
            <Tr key={a.id}>
              <Td>{a.name}</Td>
              <Td>{a.is_passive ? 'Sim' : 'Não'}</Td>
              <Td>{TARGET_TYPE_LABELS[a.target_type]} / {TARGET_FILTER_LABELS[a.target_filter]}</Td>
              <Td>
                {a.steps.map(s => s.trigger ? TRIGGER_EVENT_LABELS[s.trigger] : '-').join(', ') || '-'}
                {a.steps.length > 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {' '}({countAllSteps(a.steps)} step(s), {countAllEffects(a.steps)} effect(s))
                  </span>
                )}
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(a)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(a.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
