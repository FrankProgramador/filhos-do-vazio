'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import {
  adminAttributes, adminBehaviors, adminCalculations, adminConditions, adminEffects, adminElements, adminResources,
  type BehaviorFieldValuePayload, type EffectPayload,
} from '@/app/lib/adminData'
import type {
  Attribute, Behavior, BehaviorFieldDefinition, Calculation, Condition, Element as GameElement, EffectTargetValue,
  GameEffect, GameResource,
} from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const TARGETS = ['self', 'target', 'allies', 'enemies', 'area']
const DIRECTIONS = ['frente', 'tras', 'esquerda', 'direita', 'cima', 'baixo']

const EFFECT_TARGETS: EffectTargetValue[] = ['self', 'target', 'source', 'owner']
const EFFECT_TARGET_LABELS: Record<EffectTargetValue, string> = {
  self: 'Você mesmo', target: 'Alvo', source: 'Origem', owner: 'Dono',
}

const EMPTY: EffectPayload = {
  behavior_id: 0, element_id: null, target: 'target',
  name: '', slug: '', description: '', behavior_field_values: [],
}

function FieldInput({
  definition, value, onChange, attributes, resources, calculations, conditions,
}: {
  definition: BehaviorFieldDefinition
  value: string | null
  onChange: (value: string | null) => void
  attributes: Attribute[]
  resources: GameResource[]
  calculations: Calculation[]
  conditions: Condition[]
}) {
  switch (definition.field_type) {
    case 'textarea':
    case 'expression':
      return <Textarea value={value ?? ''} onChange={e => onChange(e.target.value)} />

    case 'number':
      return (
        <Input
          type="number"
          min={definition.min_value ?? undefined}
          max={definition.max_value ?? undefined}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      )

    case 'boolean':
      return (
        <label className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
          <input type="checkbox" checked={value === 'true'} onChange={e => onChange(e.target.checked ? 'true' : 'false')} />
          Ativo
        </label>
      )

    case 'select':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {(definition.options ?? []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </Select>
      )

    case 'multi_select': {
      const selected: string[] = value ? JSON.parse(value) : []
      const toggle = (v: string) => {
        const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]
        onChange(next.length ? JSON.stringify(next) : null)
      }
      return (
        <div className="flex flex-wrap gap-2">
          {(definition.options ?? []).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={selected.includes(opt.value) ? 'ddb-badge ddb-badge-gold' : 'ddb-badge ddb-badge-dim'}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    }

    case 'attribute':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {attributes.map(a => <option key={a.id} value={a.slug}>{a.name}</option>)}
        </Select>
      )

    case 'resource':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {resources.map(r => <option key={r.id} value={r.slug}>{r.name}</option>)}
        </Select>
      )

    case 'calculation':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {calculations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      )

    case 'target':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      )

    case 'direction':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
      )

    case 'dice':
      return <Input placeholder="ex: 2d6+1" value={value ?? ''} onChange={e => onChange(e.target.value)} />

    case 'condition':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {conditions.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </Select>
      )

    case 'entity':
    case 'effect':
    case 'text':
    default:
      return <Input value={value ?? ''} onChange={e => onChange(e.target.value)} />
  }
}

export default function AdminEfeitosPage() {
  const { token } = useAuth()
  const [effects, setEffects] = useState<GameEffect[]>([])
  const [behaviors, setBehaviors] = useState<Behavior[]>([])
  const [elements, setElements] = useState<GameElement[]>([])
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [resources, setResources] = useState<GameResource[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EffectPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminBehaviors.list(token).then(setBehaviors)
    adminElements.list(token).then(setElements)
    adminCalculations.list(token).then(setCalculations)
    adminAttributes.list(token).then(setAttributes)
    adminResources.list(token).then(setResources)
    adminConditions.list(token).then(setConditions)
    return adminEffects.list(token).then(setEffects).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  const selectedBehavior = useMemo(
    () => behaviors.find(b => b.id === form.behavior_id) ?? null,
    [behaviors, form.behavior_id],
  )

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(effect: GameEffect) {
    setEditingId(effect.id)
    setForm({
      behavior_id: effect.behavior_id,
      element_id: effect.element_id,
      target: effect.target,
      name: effect.name,
      slug: effect.slug,
      description: effect.description,
      behavior_field_values: effect.behavior_field_values.map(v => ({ behavior_field_definition_id: v.behavior_field_definition_id, value: v.value })),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function selectBehavior(behaviorId: number) {
    setForm({ ...form, behavior_id: behaviorId, behavior_field_values: [] })
  }

  function behaviorValueFor(definitionId: number): string | null {
    return form.behavior_field_values.find(v => v.behavior_field_definition_id === definitionId)?.value ?? null
  }
  function setBehaviorValueFor(definitionId: number, value: string | null) {
    const rest = form.behavior_field_values.filter(v => v.behavior_field_definition_id !== definitionId)
    const entry: BehaviorFieldValuePayload = { behavior_field_definition_id: definitionId, value }
    setForm({ ...form, behavior_field_values: [...rest, entry] })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminEffects.update(token, editingId, form)
      else await adminEffects.create(token, form)
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
      await adminEffects.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Efeitos</h1>
        {editingId === null && behaviors.length > 0 && (
          <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Efeito</button>
        )}
      </div>

      {behaviors.length === 0 && !loading && (
        <div className="alert" style={{ fontSize: '0.8rem' }}>
          Cadastre ao menos um Comportamento antes de criar Efeitos.
        </div>
      )}

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Efeito' : 'Novo Efeito'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Comportamento" required>
              <Select value={form.behavior_id || ''} onChange={e => selectBehavior(Number(e.target.value))}>
                <option value="">Selecione…</option>
                {behaviors.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Alvo" required>
              <Select value={form.target} onChange={e => setForm({ ...form, target: e.target.value as EffectTargetValue })}>
                {EFFECT_TARGETS.map(t => <option key={t} value={t}>{EFFECT_TARGET_LABELS[t]}</option>)}
              </Select>
            </Field>
            <Field label="Elemento">
              <Select
                value={form.element_id ?? ''}
                onChange={e => setForm({ ...form, element_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Nenhum</option>
                {elements.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
              </Select>
            </Field>
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            {selectedBehavior?.requires_calculation && (
              <div className="md:col-span-2">
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.55)' }}>
                  Este comportamento exige um Cálculo — ele é escolhido por Step, em Admin → Habilidades (o mesmo Effect pode ter valores diferentes dependendo de quem o usa).
                </p>
              </div>
            )}
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Parâmetros de {selectedBehavior?.name ?? 'Comportamento'}
          </h3>
          {!selectedBehavior ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selecione um Comportamento.</p>
          ) : selectedBehavior.field_definitions.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Este comportamento não tem parâmetros próprios.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedBehavior.field_definitions.map(definition => (
                <div key={definition.id}>
                  <Field label={definition.label} required={definition.is_required}>
                    <FieldInput
                      definition={definition}
                      value={behaviorValueFor(definition.id) ?? definition.default_value}
                      onChange={v => setBehaviorValueFor(definition.id, v)}
                      attributes={attributes}
                      resources={resources}
                      calculations={calculations}
                      conditions={conditions}
                    />
                  </Field>
                  {definition.description && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{definition.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Slug', 'Comportamento', 'Alvo', '']}>
          {effects.map(effect => (
            <Tr key={effect.id}>
              <Td>{effect.name}</Td>
              <Td>{effect.slug}</Td>
              <Td>{effect.behavior.name}</Td>
              <Td>{EFFECT_TARGET_LABELS[effect.target]}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(effect)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(effect.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
