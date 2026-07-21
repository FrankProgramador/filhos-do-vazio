'use client'

import { useState } from 'react'
import { ApiError } from '@/app/lib/api'
import {
  adminAbilities,
  type SimpleAttackAbilityPayload, type SimpleAttackAction, type SimpleAttackAmountSource,
  type SimpleAttackConditionSource, type SimpleAttackExtraRulePayload,
} from '@/app/lib/adminData'
import type {
  Ability, AbilityStep, AbilityStepEffect, Attribute, CalculationComponent, Condition, Element, GameResource,
  StepCondition, StepConditionOperatorValue, StepConditionOwnerValue,
} from '@/app/lib/gameData'
import { Field, Input, Select, Textarea } from '../AdminUI'
import { ATRIBUTO_LABELS, ATRIBUTOS, type AtributoRolavel, OPERATOR_LABELS, OPERATORS, OWNER_LABELS, OWNERS } from './shared'

function emptyDamageAction(): SimpleAttackAction {
  return { type: 'damage', amount: { kind: 'fixed', value: 1 }, element_id: null, cap_attribute_id: null, extra_successes: false }
}

function emptyExtraRule(): SimpleAttackExtraRulePayload {
  return { condition: { kind: 'hits', operator: '>=', value: 1 }, action: emptyDamageAction() }
}

function emptyForm(): SimpleAttackAbilityPayload {
  return {
    name: '', slug: '', description: '', icon: '', display_order: 0,
    atributo: 'poder', resource_id: null, custo: 1, cooldown_base: null,
    base_rule: { action: emptyDamageAction() },
    extra_rules: [],
  }
}

/**
 * Reconhece o padrão de Cálculo gerado por `AdminAbilityController::damageComponents`
 * (backend) e reconstrói a fonte de dano — se os componentes não baterem em nenhum dos
 * 3 formatos conhecidos (a habilidade foi mexida no editor avançado), retorna `null` e
 * quem chama cai pro aviso de "modo avançado".
 */
function amountFromComponents(components: CalculationComponent[]): { amount: SimpleAttackAmountSource; capAttributeId: number | null; extraSuccesses: boolean } | null {
  let comps = [...components].sort((a, b) => a.order - b.order)
  let capAttributeId: number | null = null

  const last = comps[comps.length - 1]
  if (last && last.operation === 'min' && last.source_type === 'attribute' && last.source_id !== null) {
    capAttributeId = last.source_id
    comps = comps.slice(0, -1)
  }

  // Arma/escudo já embutem "+hits -1" sempre — checa esse formato exato antes de
  // tentar tirar o sufixo de sucessos extras (senão os 3 componentes viram 1 só e
  // o reconhecimento de weapon_damage/weapon_block abaixo nunca bate).
  if (
    comps.length === 3 &&
    comps[0].operation === 'add' && comps[0].source_type === 'context' &&
    (comps[0].context_key === 'weapon_base_damage' || comps[0].context_key === 'weapon_block_value') &&
    comps[1].operation === 'add' && comps[1].source_type === 'context' && comps[1].context_key === 'hits' &&
    comps[2].operation === 'subtract' && comps[2].source_type === 'fixed_value'
  ) {
    return { amount: { kind: comps[0].context_key === 'weapon_base_damage' ? 'weapon_damage' : 'weapon_block' }, capAttributeId, extraSuccesses: false }
  }

  // Sufixo opcional "+hits -1" (fonte fixa/atributo com "sucessos extras aumentam
  // o dano" marcado) — tira antes de reconhecer a fonte em si.
  let extraSuccesses = false
  const [maybeHits, maybeSub] = comps.slice(-2)
  if (
    maybeHits?.operation === 'add' && maybeHits.source_type === 'context' && maybeHits.context_key === 'hits' &&
    maybeSub?.operation === 'subtract' && maybeSub.source_type === 'fixed_value'
  ) {
    extraSuccesses = true
    comps = comps.slice(0, -2)
  }

  if (comps.length === 1 && comps[0].operation === 'add' && comps[0].source_type === 'fixed_value') {
    return { amount: { kind: 'fixed', value: comps[0].value ?? 0 }, capAttributeId, extraSuccesses }
  }

  if (comps.length >= 1 && comps.length <= 2 && comps[0].operation === 'add' && comps[0].source_type === 'attribute' && comps[0].source_id !== null) {
    const multiplierComp = comps[1]
    const multiplier = multiplierComp && multiplierComp.operation === 'multiply' && multiplierComp.source_type === 'fixed_value' ? multiplierComp.value : null
    return { amount: { kind: 'attribute', attribute_id: comps[0].source_id, multiplier }, capAttributeId, extraSuccesses }
  }

  return null
}

function actionFromStepEffect(se: AbilityStepEffect, conditions: Condition[]): SimpleAttackAction | null {
  const behaviorSlug = se.effect.behavior.slug

  if (behaviorSlug === 'damage') {
    if (!se.calculation) return null
    const parsed = amountFromComponents(se.calculation.components)
    if (!parsed) return null
    return { type: 'damage', amount: parsed.amount, element_id: se.effect.element_id, cap_attribute_id: parsed.capAttributeId, extra_successes: parsed.extraSuccesses }
  }

  if (behaviorSlug === 'apply_condition') {
    const conditionDef = se.effect.behavior.field_definitions.find(d => d.name === 'condition')
    const fieldValue = conditionDef
      ? se.effect.behavior_field_values.find(v => v.behavior_field_definition_id === conditionDef.id)
      : undefined
    const condition = fieldValue ? conditions.find(c => c.slug === fieldValue.value) : undefined
    const owner: StepConditionOwnerValue = se.effect.target === 'self' || se.effect.target === 'source' ? se.effect.target : 'target'
    return { type: 'apply_condition', condition_id: condition?.id ?? null, owner }
  }

  return null
}

function conditionSourceFromStepCondition(sc: StepCondition): SimpleAttackConditionSource | null {
  if (sc.type !== 'compare') return null
  const operator: StepConditionOperatorValue = sc.operator ?? '>'
  const value = Number(sc.right_value ?? 0)

  if (sc.left_type === 'context' && sc.left_value === 'hits') {
    return { kind: 'hits', operator, value }
  }
  if (sc.left_type === 'resource') {
    return { kind: 'resource', resource_id: sc.left_ref_id, owner: sc.left_owner ?? 'self', operator, value }
  }
  if (sc.left_type === 'attribute') {
    return { kind: 'attribute', attribute_id: sc.left_ref_id, owner: sc.left_owner ?? 'self', operator, value }
  }
  return null
}

/**
 * Reconstrói o formulário simples a partir da árvore real de uma Ability já salva —
 * só reconhece o formato exato que este editor (e o backend `simple-attack`) gera:
 * 1 root `on_attack` por regra, condição implícita `hits > 0` na primeira, então/senão
 * com 1 efeito reconhecível. Qualquer desvio (mexido no editor avançado) retorna `null`.
 */
function abilityToSimpleAttackForm(ability: Ability, conditions: Condition[]): SimpleAttackAbilityPayload | null {
  const roots = [...ability.steps]
    .filter(s => s.trigger === 'on_attack')
    .sort((a, b) => a.priority - b.priority || a.order - b.order)
  if (roots.length === 0) return null

  function ruleAction(root: AbilityStep): SimpleAttackAction | null {
    const thenChild = root.child_steps.find(c => !c.is_else)
    const se = thenChild?.step_effects?.[0]
    return se ? actionFromStepEffect(se, conditions) : null
  }

  const baseAction = ruleAction(roots[0])
  if (!baseAction) return null

  const extraRules: SimpleAttackExtraRulePayload[] = []
  for (const root of roots.slice(1)) {
    const sc = root.condition_link?.step_condition
    const condition = sc ? conditionSourceFromStepCondition(sc) : null
    const action = ruleAction(root)
    if (!condition || !action) return null
    extraRules.push({ condition, action })
  }

  return {
    name: ability.name,
    slug: ability.slug,
    description: ability.description,
    icon: ability.icon,
    display_order: ability.display_order,
    atributo: (ability.atributo as AtributoRolavel | null) ?? 'poder',
    resource_id: ability.resource?.id ?? null,
    custo: ability.custo,
    cooldown_base: ability.cooldown_base ?? null,
    base_rule: { action: baseAction },
    extra_rules: extraRules,
  }
}

function AmountSourcePicker({
  value, onChange, attributes, elements, capAttributeId, onCapChange, elementId, onElementChange,
  extraSuccesses, onExtraSuccessesChange,
}: {
  value: SimpleAttackAmountSource
  onChange: (v: SimpleAttackAmountSource) => void
  attributes: Attribute[]
  elements: Element[]
  capAttributeId: number | null
  onCapChange: (v: number | null) => void
  elementId: number | null
  onElementChange: (v: number | null) => void
  extraSuccesses: boolean
  onExtraSuccessesChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={value.kind}
        onChange={e => {
          const kind = e.target.value as SimpleAttackAmountSource['kind']
          if (kind === 'fixed') onChange({ kind: 'fixed', value: 1 })
          else if (kind === 'weapon_damage') onChange({ kind: 'weapon_damage' })
          else if (kind === 'weapon_block') onChange({ kind: 'weapon_block' })
          else onChange({ kind: 'attribute', attribute_id: attributes[0]?.id ?? null, multiplier: null })
        }}
        style={{ width: 190 }}
      >
        <option value="fixed">Valor fixo</option>
        <option value="weapon_damage">Dano da arma equipada</option>
        <option value="weapon_block">Bloqueio da arma equipada</option>
        <option value="attribute">Baseado em atributo</option>
      </Select>

      {value.kind === 'fixed' && (
        <Input type="number" value={value.value} onChange={e => onChange({ kind: 'fixed', value: Number(e.target.value) })} style={{ width: 90 }} />
      )}

      {value.kind === 'attribute' && (
        <>
          <Select
            value={value.attribute_id ?? ''}
            onChange={e => onChange({ ...value, attribute_id: e.target.value ? Number(e.target.value) : null })}
            style={{ width: 150 }}
          >
            <option value="">Selecione…</option>
            {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Input
            type="number" step="0.1" placeholder="× (opcional)"
            value={value.multiplier ?? ''}
            onChange={e => onChange({ ...value, multiplier: e.target.value ? Number(e.target.value) : null })}
            style={{ width: 110 }}
          />
        </>
      )}

      {value.kind !== 'weapon_damage' && value.kind !== 'weapon_block' && (
        <label className="flex items-center gap-1.5" style={{ cursor: 'pointer', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={extraSuccesses} onChange={e => onExtraSuccessesChange(e.target.checked)} />
          Sucessos extras aumentam o dano (+1 cada)
        </label>
      )}

      <Select value={elementId ?? ''} onChange={e => onElementChange(e.target.value ? Number(e.target.value) : null)} style={{ width: 160 }}>
        <option value="">Elemento (opcional)</option>
        {elements.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
      </Select>
      <Select value={capAttributeId ?? ''} onChange={e => onCapChange(e.target.value ? Number(e.target.value) : null)} style={{ width: 170 }}>
        <option value="">Sem limite</option>
        {attributes.map(a => <option key={a.id} value={a.id}>Limitar em {a.name}</option>)}
      </Select>
    </div>
  )
}

function ActionPicker({
  value, onChange, attributes, elements, conditions,
}: {
  value: SimpleAttackAction
  onChange: (v: SimpleAttackAction) => void
  attributes: Attribute[]
  elements: Element[]
  conditions: Condition[]
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ flex: 1 }}>
      <Select
        value={value.type}
        onChange={e => {
          const type = e.target.value as SimpleAttackAction['type']
          onChange(
            type === 'damage'
              ? emptyDamageAction()
              : { type: 'apply_condition', condition_id: conditions[0]?.id ?? null, owner: 'target' }
          )
        }}
        style={{ width: 170 }}
      >
        <option value="damage">Causar dano</option>
        <option value="apply_condition">Aplicar condição</option>
      </Select>

      {value.type === 'damage' ? (
        <AmountSourcePicker
          value={value.amount}
          onChange={amount => onChange({ ...value, amount })}
          attributes={attributes}
          elements={elements}
          capAttributeId={value.cap_attribute_id}
          onCapChange={cap_attribute_id => onChange({ ...value, cap_attribute_id })}
          elementId={value.element_id}
          onElementChange={element_id => onChange({ ...value, element_id })}
          extraSuccesses={value.extra_successes}
          onExtraSuccessesChange={extra_successes => onChange({ ...value, extra_successes })}
        />
      ) : (
        <>
          <Select
            value={value.condition_id ?? ''}
            onChange={e => onChange({ ...value, condition_id: e.target.value ? Number(e.target.value) : null })}
            style={{ width: 180 }}
          >
            <option value="">Selecione…</option>
            {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={value.owner} onChange={e => onChange({ ...value, owner: e.target.value as StepConditionOwnerValue })} style={{ width: 130 }}>
            {OWNERS.map(o => <option key={o} value={o}>{OWNER_LABELS[o]}</option>)}
          </Select>
        </>
      )}
    </div>
  )
}

function ConditionSourcePicker({
  value, onChange, resources, attributes,
}: {
  value: SimpleAttackConditionSource
  onChange: (v: SimpleAttackConditionSource) => void
  resources: GameResource[]
  attributes: Attribute[]
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ flex: 1 }}>
      <Select
        value={value.kind}
        onChange={e => {
          const kind = e.target.value as SimpleAttackConditionSource['kind']
          if (kind === 'hits') onChange({ kind: 'hits', operator: value.operator, value: value.value })
          else if (kind === 'resource') onChange({ kind: 'resource', resource_id: resources[0]?.id ?? null, owner: 'self', operator: value.operator, value: value.value })
          else onChange({ kind: 'attribute', attribute_id: attributes[0]?.id ?? null, owner: 'self', operator: value.operator, value: value.value })
        }}
        style={{ width: 190 }}
      >
        <option value="hits">Número de acertos</option>
        <option value="resource">Quantidade de recurso</option>
        <option value="attribute">Comparação de atributo</option>
      </Select>

      {value.kind === 'resource' && (
        <Select value={value.resource_id ?? ''} onChange={e => onChange({ ...value, resource_id: e.target.value ? Number(e.target.value) : null })} style={{ width: 150 }}>
          <option value="">Selecione…</option>
          {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      )}
      {value.kind === 'attribute' && (
        <Select value={value.attribute_id ?? ''} onChange={e => onChange({ ...value, attribute_id: e.target.value ? Number(e.target.value) : null })} style={{ width: 150 }}>
          <option value="">Selecione…</option>
          {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
      )}
      {value.kind !== 'hits' && (
        <Select value={value.owner} onChange={e => onChange({ ...value, owner: e.target.value as StepConditionOwnerValue })} style={{ width: 130 }}>
          {OWNERS.map(o => <option key={o} value={o}>{OWNER_LABELS[o]}</option>)}
        </Select>
      )}

      <Select value={value.operator} onChange={e => onChange({ ...value, operator: e.target.value as StepConditionOperatorValue })} style={{ width: 200 }}>
        {OPERATORS.map(o => <option key={o} value={o}>{OPERATOR_LABELS[o]}</option>)}
      </Select>
      <Input type="number" value={value.value} onChange={e => onChange({ ...value, value: Number(e.target.value) })} style={{ width: 90 }} />
    </div>
  )
}

export default function SimpleAttackEditor({
  token, ability, attributes, resources, elements, conditions, onSaved, onCancel,
}: {
  token: string | null
  ability: Ability | null
  attributes: Attribute[]
  resources: GameResource[]
  elements: Element[]
  conditions: Condition[]
  onSaved: () => void
  onCancel: () => void
}) {
  const reconstructed = ability ? abilityToSimpleAttackForm(ability, conditions) : null
  const unsupported = ability !== null && reconstructed === null

  const [form, setForm] = useState<SimpleAttackAbilityPayload>(reconstructed ?? emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [grantAll, setGrantAll] = useState(false)

  if (unsupported) {
    return (
      <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Esta habilidade foi editada no modo avançado (ou tem uma estrutura fora do padrão de Ataque simples) e não pode
          ser editada por aqui. Abra em modo avançado pra mexer nela.
        </p>
        <button onClick={onCancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Fechar</button>
      </div>
    )
  }

  function addExtraRule() {
    setForm({ ...form, extra_rules: [...form.extra_rules, emptyExtraRule()] })
  }
  function updateExtraRule(i: number, patch: Partial<SimpleAttackExtraRulePayload>) {
    setForm({ ...form, extra_rules: form.extra_rules.map((r, idx) => idx === i ? { ...r, ...patch } : r) })
  }
  function removeExtraRule(i: number) {
    setForm({ ...form, extra_rules: form.extra_rules.filter((_, idx) => idx !== i) })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const saved = ability
        ? await adminAbilities.updateSimpleAttack(token, ability.id, form)
        : await adminAbilities.createSimpleAttack(token, form)
      if (grantAll) await adminAbilities.grantToAll(token, saved.id)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
      <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
        {ability ? 'Editar Ataque' : 'Novo Ataque'}
      </h2>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label="Ícone (URL/chave)"><Input value={form.icon ?? ''} onChange={e => setForm({ ...form, icon: e.target.value })} /></Field>
        <Field label="Ordem de exibição"><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></Field>
        <Field label="Teste de atributo" required>
          <Select value={form.atributo} onChange={e => setForm({ ...form, atributo: e.target.value as AtributoRolavel })}>
            {ATRIBUTOS.map(a => <option key={a} value={a}>{ATRIBUTO_LABELS[a]}</option>)}
          </Select>
        </Field>
        <div className="flex items-end gap-2">
          <Field label="Recurso (Uso)">
            <Select value={form.resource_id ?? ''} onChange={e => setForm({ ...form, resource_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— sem Esforço —</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
          <Field label="Custo" required>
            <Input type="number" min={1} value={form.custo} onChange={e => setForm({ ...form, custo: Number(e.target.value) })} style={{ width: 80 }} />
          </Field>
          <Field label="Cooldown (turnos)">
            <Input
              type="number" min={0}
              value={form.cooldown_base ?? ''}
              onChange={e => setForm({ ...form, cooldown_base: e.target.value ? Number(e.target.value) : null })}
              placeholder="Sem cooldown"
              style={{ width: 110 }}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Descrição" required><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
        Ao acertar (SE acertos {'>'} 0)
      </h3>
      <ActionPicker
        value={form.base_rule.action}
        onChange={action => setForm({ ...form, base_rule: { action } })}
        attributes={attributes} elements={elements} conditions={conditions}
      />

      <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
        Condições extra
      </h3>
      <div className="flex flex-col gap-3">
        {form.extra_rules.map((rule, i) => (
          <div key={i} className="card" style={{ padding: '0.85rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
            <div className="flex items-start gap-2 flex-wrap">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.7rem', color: 'var(--gold)', paddingTop: '0.4rem' }}>SE</span>
              <ConditionSourcePicker value={rule.condition} onChange={condition => updateExtraRule(i, { condition })} resources={resources} attributes={attributes} />
            </div>
            <div className="flex items-start gap-2 flex-wrap" style={{ marginTop: '0.6rem' }}>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.7rem', color: 'var(--gold)', paddingTop: '0.4rem' }}>→</span>
              <ActionPicker value={rule.action} onChange={action => updateExtraRule(i, { action })} attributes={attributes} elements={elements} conditions={conditions} />
              <button onClick={() => removeExtraRule(i)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover</button>
            </div>
          </div>
        ))}
        <button onClick={addExtraRule} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar condição</button>
      </div>

      <label className="flex items-center gap-2" style={{ marginTop: '1.25rem', cursor: 'pointer', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={grantAll} onChange={e => setGrantAll(e.target.checked)} />
        Conceder a todos os personagens ao salvar (atalho de teste)
      </label>

      <div className="flex items-center gap-2" style={{ marginTop: '0.75rem' }}>
        <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        <button onClick={onCancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
      </div>
    </div>
  )
}
