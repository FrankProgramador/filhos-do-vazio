'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import {
  adminAttributes, adminCalculations, adminResources,
  type CalculationComponentPayload, type CalculationPayload,
} from '@/app/lib/adminData'
import type {
  Attribute, Calculation, CalculationContextKeyValue, CalculationOperationValue, CalculationSourceTypeValue, GameResource,
} from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const OPERATIONS: CalculationOperationValue[] = ['add', 'subtract', 'multiply', 'divide', 'max', 'min']
const OPERATION_LABELS: Record<CalculationOperationValue, string> = {
  add: 'Somar', subtract: 'Subtrair', multiply: 'Multiplicar', divide: 'Dividir', max: 'Máximo', min: 'Mínimo',
}

const SOURCE_TYPES: CalculationSourceTypeValue[] = [
  'fixed_value', 'attribute', 'resource', 'fixed_dice', 'attribute_dice', 'distance', 'context', 'position',
]
const SOURCE_TYPE_LABELS: Record<CalculationSourceTypeValue, string> = {
  fixed_value: 'Valor Fixo', attribute: 'Atributo', resource: 'Recurso',
  fixed_dice: 'Dados Fixos', attribute_dice: 'Dados de Atributo', distance: 'Distância', context: 'Contexto',
  position: 'Posição (grid)',
}

const CONTEXT_KEYS: CalculationContextKeyValue[] = ['hits', 'weapon_base_damage', 'weapon_block_value', 'weapon_weight']
const CONTEXT_KEY_LABELS: Record<CalculationContextKeyValue, string> = {
  hits: 'Sucessos da rolagem (hits)',
  weapon_base_damage: 'Dano base da arma equipada',
  weapon_block_value: 'Bloqueio da arma equipada',
  weapon_weight: 'Peso da arma equipada',
}

const EMPTY_COMPONENT: CalculationComponentPayload = {
  order: 0, operation: 'add', source_type: 'fixed_value', source_id: null, value: null, context_key: null,
}

const EMPTY: CalculationPayload = { name: '', slug: '', description: '', components: [] }

export default function AdminCalculosPage() {
  const { token } = useAuth()
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [resources, setResources] = useState<GameResource[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CalculationPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminAttributes.list(token).then(setAttributes)
    adminResources.list(token).then(setResources)
    return adminCalculations.list(token).then(setCalculations).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(calculation: Calculation) {
    setEditingId(calculation.id)
    setForm({
      name: calculation.name,
      slug: calculation.slug,
      description: calculation.description,
      components: calculation.components.map(c => ({ ...c })),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function addComponent() {
    setForm({ ...form, components: [...form.components, { ...EMPTY_COMPONENT, order: form.components.length }] })
  }
  function updateComponent(i: number, patch: Partial<CalculationComponentPayload>) {
    setForm({ ...form, components: form.components.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
  }
  function removeComponent(i: number) {
    setForm({ ...form, components: form.components.filter((_, idx) => idx !== i) })
  }

  function changeSourceType(i: number, sourceType: CalculationSourceTypeValue) {
    updateComponent(i, { source_type: sourceType, source_id: null, context_key: null })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminCalculations.update(token, editingId, form)
      else await adminCalculations.create(token, form)
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
      await adminCalculations.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Cálculos</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Cálculo</button>}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', maxWidth: 700 }}>
        Uma Calculation é uma sequência ordenada de componentes (dados de atributo, valores fixos...) que produz um número. Lógica condicional (comparações, E/OU, condições de status) vive na árvore de Condições de cada Ability Step, não aqui.
      </p>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Cálculo' : 'Novo Cálculo'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Componentes
          </h3>
          <div className="flex flex-col gap-3">
            {form.components.map((component, i) => (
              <div key={i} className="card" style={{ padding: '0.85rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Field label="Ordem">
                    <Input type="number" value={component.order} onChange={e => updateComponent(i, { order: Number(e.target.value) })} />
                  </Field>
                  <Field label="Operação" required>
                    <Select value={component.operation} onChange={e => updateComponent(i, { operation: e.target.value as CalculationOperationValue })}>
                      {OPERATIONS.map(o => <option key={o} value={o}>{OPERATION_LABELS[o]}</option>)}
                    </Select>
                  </Field>
                  <Field label="Origem" required>
                    <Select value={component.source_type} onChange={e => changeSourceType(i, e.target.value as CalculationSourceTypeValue)}>
                      {SOURCE_TYPES.map(t => <option key={t} value={t}>{SOURCE_TYPE_LABELS[t]}</option>)}
                    </Select>
                  </Field>

                  {component.source_type === 'attribute' || component.source_type === 'attribute_dice' ? (
                    <Field label="Atributo" required>
                      <Select value={component.source_id ?? ''} onChange={e => updateComponent(i, { source_id: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">Selecione…</option>
                        {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </Select>
                    </Field>
                  ) : component.source_type === 'resource' ? (
                    <Field label="Recurso" required>
                      <Select value={component.source_id ?? ''} onChange={e => updateComponent(i, { source_id: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">Selecione…</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </Select>
                    </Field>
                  ) : component.source_type === 'context' ? (
                    <Field label="Chave de Contexto" required>
                      <Select value={component.context_key ?? ''} onChange={e => updateComponent(i, { context_key: e.target.value ? e.target.value as CalculationContextKeyValue : null })}>
                        <option value="">Selecione…</option>
                        {CONTEXT_KEYS.map(k => <option key={k} value={k}>{CONTEXT_KEY_LABELS[k]}</option>)}
                      </Select>
                    </Field>
                  ) : (
                    <Field label="Valor">
                      <Input
                        type="number"
                        step="0.1"
                        value={component.value ?? ''}
                        onChange={e => updateComponent(i, { value: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Field>
                  )}
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <button onClick={() => removeComponent(i)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover componente</button>
                </div>
              </div>
            ))}
            <button onClick={addComponent} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar componente</button>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Slug', 'Componentes', '']}>
          {calculations.map(calculation => (
            <Tr key={calculation.id}>
              <Td>{calculation.name}</Td>
              <Td>{calculation.slug}</Td>
              <Td>{calculation.components.length} componente(s)</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(calculation)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(calculation.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
