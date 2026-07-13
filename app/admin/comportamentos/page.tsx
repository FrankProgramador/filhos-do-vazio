'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminBehaviors, type BehaviorFieldDefinitionPayload, type BehaviorPayload } from '@/app/lib/adminData'
import type { Behavior, EffectFieldTypeValue, SelectOption } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const FIELD_TYPES: EffectFieldTypeValue[] = [
  'text', 'textarea', 'number', 'boolean', 'select', 'multi_select',
  'attribute', 'resource', 'condition', 'dice', 'expression', 'entity', 'effect', 'target', 'direction', 'calculation',
]

const FIELD_TYPE_LABELS: Record<EffectFieldTypeValue, string> = {
  text: 'Texto', textarea: 'Texto longo', number: 'Número', boolean: 'Booleano',
  select: 'Seleção única', multi_select: 'Seleção múltipla', attribute: 'Atributo',
  resource: 'Recurso', condition: 'Condição', dice: 'Dado', expression: 'Expressão',
  entity: 'Entidade', effect: 'Efeito', target: 'Alvo', direction: 'Direção', calculation: 'Cálculo',
}

const OPTIONS_FIELD_TYPES = new Set<EffectFieldTypeValue>(['select', 'multi_select'])

const EMPTY_FIELD: BehaviorFieldDefinitionPayload = {
  name: '', label: '', description: '', field_type: 'text',
  is_required: false, default_value: '', min_value: null, max_value: null,
  options: null, order: 0,
}

const EMPTY: BehaviorPayload = {
  name: '', slug: '', description: '', requires_calculation: false, field_definitions: [],
}

export default function AdminComportamentosPage() {
  const { token } = useAuth()
  const [behaviors, setBehaviors] = useState<Behavior[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<BehaviorPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminBehaviors.list(token).then(setBehaviors).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(behavior: Behavior) {
    setEditingId(behavior.id)
    setForm({
      name: behavior.name,
      slug: behavior.slug,
      description: behavior.description,
      requires_calculation: behavior.requires_calculation,
      field_definitions: behavior.field_definitions.map(f => ({ ...f })),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function addField() {
    setForm({ ...form, field_definitions: [...form.field_definitions, { ...EMPTY_FIELD, order: form.field_definitions.length }] })
  }
  function updateField(i: number, patch: Partial<BehaviorFieldDefinitionPayload>) {
    setForm({ ...form, field_definitions: form.field_definitions.map((f, idx) => idx === i ? { ...f, ...patch } : f) })
  }
  function removeField(i: number) {
    setForm({ ...form, field_definitions: form.field_definitions.filter((_, idx) => idx !== i) })
  }

  function updateFieldOptions(i: number, raw: string) {
    let options: SelectOption[] | null = null
    try {
      options = raw.trim() ? JSON.parse(raw) : null
    } catch {
      // Ignora enquanto o JSON está incompleto — mantém o texto no textarea até ficar válido.
      return
    }
    updateField(i, { options })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminBehaviors.update(token, editingId, form)
      else await adminBehaviors.create(token, form)
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
      await adminBehaviors.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Comportamentos</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Comportamento</button>}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', maxWidth: 700 }}>
        O Behavior diz COMO a engine executa um Effect (o algoritmo: Damage, Heal, Move...). É diferente do Tipo de Efeito, que diz O QUE o efeito é (ex: Fogo).
      </p>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Comportamento' : 'Novo Comportamento'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                <input
                  type="checkbox"
                  checked={form.requires_calculation}
                  onChange={e => setForm({ ...form, requires_calculation: e.target.checked })}
                />
                Exige um Cálculo (Effects com este comportamento precisam de calculation_id)
              </label>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Parâmetros
          </h3>
          <div className="flex flex-col gap-3">
            {form.field_definitions.map((field, i) => (
              <div key={i} className="card" style={{ padding: '0.85rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Field label="Identificador (name)" required>
                    <Input value={field.name} onChange={e => updateField(i, { name: e.target.value })} />
                  </Field>
                  <Field label="Rótulo (label)" required>
                    <Input value={field.label} onChange={e => updateField(i, { label: e.target.value })} />
                  </Field>
                  <Field label="Tipo de campo" required>
                    <Select value={field.field_type} onChange={e => updateField(i, { field_type: e.target.value as EffectFieldTypeValue })}>
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                    </Select>
                  </Field>
                  <div className="md:col-span-3">
                    <Field label="Descrição"><Textarea value={field.description ?? ''} onChange={e => updateField(i, { description: e.target.value })} /></Field>
                  </div>
                  <Field label="Valor padrão">
                    <Input value={field.default_value ?? ''} onChange={e => updateField(i, { default_value: e.target.value })} />
                  </Field>
                  <Field label="Mínimo">
                    <Input type="number" value={field.min_value ?? ''} onChange={e => updateField(i, { min_value: e.target.value ? Number(e.target.value) : null })} />
                  </Field>
                  <Field label="Máximo">
                    <Input type="number" value={field.max_value ?? ''} onChange={e => updateField(i, { max_value: e.target.value ? Number(e.target.value) : null })} />
                  </Field>
                  <Field label="Ordem">
                    <Input type="number" value={field.order} onChange={e => updateField(i, { order: Number(e.target.value) })} />
                  </Field>
                  <div className="flex items-center" style={{ paddingTop: '1.3rem' }}>
                    <label className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                      <input type="checkbox" checked={field.is_required} onChange={e => updateField(i, { is_required: e.target.checked })} />
                      Obrigatório
                    </label>
                  </div>
                  {OPTIONS_FIELD_TYPES.has(field.field_type) && (
                    <div className="md:col-span-3">
                      <Field label='Opções (JSON: [{"label": "...", "value": "..."}])'>
                        <Textarea
                          defaultValue={field.options ? JSON.stringify(field.options, null, 2) : ''}
                          onChange={e => updateFieldOptions(i, e.target.value)}
                        />
                      </Field>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <button onClick={() => removeField(i)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover campo</button>
                </div>
              </div>
            ))}
            <button onClick={addField} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar campo</button>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Slug', 'Exige Cálculo', 'Parâmetros', '']}>
          {behaviors.map(behavior => (
            <Tr key={behavior.id}>
              <Td>{behavior.name}</Td>
              <Td>{behavior.slug}</Td>
              <Td>{behavior.requires_calculation ? 'Sim' : 'Não'}</Td>
              <Td>{behavior.field_definitions.length}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(behavior)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(behavior.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
