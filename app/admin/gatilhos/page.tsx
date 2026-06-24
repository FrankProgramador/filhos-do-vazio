'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminTriggers, type TriggerPayload } from '@/app/lib/adminData'
import type { AreaShape, Trigger, TriggerConditionType, TriggerTargetType } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const CONDITION_TYPES: TriggerConditionType[] = ['none', 'target_health_less_than', 'target_has_status', 'caster_has_effect', 'custom']
const CONDITION_LABELS: Record<TriggerConditionType, string> = {
  none: 'Nenhuma', target_health_less_than: 'Vida do alvo menor que', target_has_status: 'Alvo possui status', caster_has_effect: 'Conjurador possui efeito', custom: 'Customizada',
}
const TARGET_TYPES: TriggerTargetType[] = ['self', 'target', 'allies', 'enemies', 'area']
const TARGET_LABELS: Record<TriggerTargetType, string> = {
  self: 'Próprio', target: 'Alvo', allies: 'Aliados', enemies: 'Inimigos', area: 'Área',
}
const AREA_SHAPES: AreaShape[] = ['self', 'cone', 'explosion', 'line', 'cube']
const AREA_SHAPE_LABELS: Record<AreaShape, string> = {
  self: 'Próprio', cone: 'Cone', explosion: 'Explosão', line: 'Linha', cube: 'Cubo',
}

type TriggerForm = Omit<TriggerPayload, 'condition_value' | 'area_params'> & {
  condition_value_text: string
  area_params_text: string
}

const EMPTY: TriggerForm = {
  name: '', slug: '', description: '', condition_type: 'none', target_type: 'self', area_shape: null,
  condition_value_text: '', area_params_text: '',
}

export default function AdminGatilhosPage() {
  const { token } = useAuth()
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TriggerForm>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminTriggers.list(token).then(setTriggers).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(t: Trigger) {
    setEditingId(t.id)
    setForm({
      ...t,
      condition_value_text: t.condition_value ? JSON.stringify(t.condition_value, null, 2) : '',
      area_params_text: t.area_params ? JSON.stringify(t.area_params, null, 2) : '',
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setError(null)

    let condition_value: Record<string, unknown> | null = null
    let area_params: Record<string, unknown> | null = null
    try {
      condition_value = form.condition_value_text.trim() ? JSON.parse(form.condition_value_text) : null
      area_params = form.area_params_text.trim() ? JSON.parse(form.area_params_text) : null
    } catch {
      setError('JSON inválido em "Valor da condição" ou "Parâmetros da área".')
      return
    }

    const { condition_value_text, area_params_text, ...rest } = form
    const payload: TriggerPayload = { ...rest, condition_value, area_params }

    setSaving(true)
    try {
      if (editingId) await adminTriggers.update(token, editingId, payload)
      else await adminTriggers.create(token, payload)
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
      await adminTriggers.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Gatilhos</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Gatilho</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Gatilho' : 'Novo Gatilho'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome (evento)" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex: on_hit" /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Tipo de Condição" required>
              <Select value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value as TriggerConditionType })}>
                {CONDITION_TYPES.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
              </Select>
            </Field>
            <Field label="Tipo de Alvo" required>
              <Select value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value as TriggerTargetType })}>
                {TARGET_TYPES.map(t => <option key={t} value={t}>{TARGET_LABELS[t]}</option>)}
              </Select>
            </Field>
            {form.target_type === 'area' && (
              <Field label="Formato da Área">
                <Select value={form.area_shape ?? ''} onChange={e => setForm({ ...form, area_shape: e.target.value ? (e.target.value as AreaShape) : null })}>
                  <option value="">Nenhum</option>
                  {AREA_SHAPES.map(s => <option key={s} value={s}>{AREA_SHAPE_LABELS[s]}</option>)}
                </Select>
              </Field>
            )}
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <Field label="Valor da Condição (JSON)"><Textarea value={form.condition_value_text} onChange={e => setForm({ ...form, condition_value_text: e.target.value })} placeholder='{"distance": 1}' /></Field>
            {form.target_type === 'area' && (
              <Field label="Parâmetros da Área (JSON)"><Textarea value={form.area_params_text} onChange={e => setForm({ ...form, area_params_text: e.target.value })} placeholder='{"range": 1}' /></Field>
            )}
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Condição', 'Alvo', '']}>
          {triggers.map(t => (
            <Tr key={t.id}>
              <Td>{t.name}</Td>
              <Td>{CONDITION_LABELS[t.condition_type]}</Td>
              <Td>{TARGET_LABELS[t.target_type]}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(t)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(t.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
