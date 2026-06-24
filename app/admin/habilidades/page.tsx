'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminAbilities, adminTriggers, type AbilityPayload } from '@/app/lib/adminData'
import type { Ability, AbilityType, Trigger } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const TYPES: AbilityType[] = ['active', 'passive', 'reaction']
const TYPE_LABELS: Record<AbilityType, string> = { active: 'Ativa', passive: 'Passiva', reaction: 'Reação' }

type AbilityForm = Omit<AbilityPayload, 'activation_cost'> & { activation_cost_text: string }

const EMPTY: AbilityForm = {
  name: '', slug: '', description: '', type: 'passive', activation_cost_text: '', cooldown: 0,
  is_magic: false, is_unique: false, image: '', trigger_ids: [],
}

export default function AdminHabilidadesPage() {
  const { token } = useAuth()
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AbilityForm>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminAbilities.list(token).then(setAbilities).finally(() => setLoading(false))
  useEffect(() => { load(); adminTriggers.list(token).then(setTriggers) }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(a: Ability) {
    setEditingId(a.id)
    setForm({
      ...a,
      activation_cost_text: a.activation_cost ? JSON.stringify(a.activation_cost, null, 2) : '',
      trigger_ids: a.triggers.map(t => t.id),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function toggleTrigger(triggerId: number) {
    setForm({
      ...form,
      trigger_ids: form.trigger_ids.includes(triggerId)
        ? form.trigger_ids.filter(id => id !== triggerId)
        : [...form.trigger_ids, triggerId],
    })
  }

  async function save() {
    setError(null)

    let activation_cost: Record<string, number> | null = null
    try {
      activation_cost = form.activation_cost_text.trim() ? JSON.parse(form.activation_cost_text) : null
    } catch {
      setError('JSON inválido em "Custo de Ativação".')
      return
    }

    const { activation_cost_text, ...rest } = form
    const payload: AbilityPayload = { ...rest, activation_cost }

    setSaving(true)
    try {
      if (editingId) await adminAbilities.update(token, editingId, payload)
      else await adminAbilities.create(token, payload)
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

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Habilidades</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Nova Habilidade</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Habilidade' : 'Nova Habilidade'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Tipo" required>
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AbilityType })}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </Select>
            </Field>
            <Field label="Cooldown (turnos)" required><Input type="number" min={0} value={form.cooldown} onChange={e => setForm({ ...form, cooldown: Number(e.target.value) })} /></Field>
            <Field label="Imagem (URL)"><Input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value })} /></Field>
            <div className="flex items-center gap-4" style={{ paddingTop: '1.5rem' }}>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_magic" checked={form.is_magic} onChange={e => setForm({ ...form, is_magic: e.target.checked })} />
                <label htmlFor="is_magic" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Mágica</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_unique" checked={form.is_unique} onChange={e => setForm({ ...form, is_unique: e.target.checked })} />
                <label htmlFor="is_unique" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Única</label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Field label="Descrição" required><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <Field label="Custo de Ativação (JSON)"><Textarea value={form.activation_cost_text} onChange={e => setForm({ ...form, activation_cost_text: e.target.value })} placeholder='{"stamina": 2, "soul": 1}' /></Field>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Gatilhos
          </h3>
          <div className="flex flex-wrap gap-3">
            {triggers.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Nenhum gatilho cadastrado ainda.</p>}
            {triggers.map(t => (
              <label key={t.id} className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.8rem', color: 'var(--text)' }}>
                <input type="checkbox" checked={form.trigger_ids.includes(t.id)} onChange={() => toggleTrigger(t.id)} />
                {t.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({t.slug})</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Tipo', 'Mágica', 'Gatilhos', '']}>
          {abilities.map(a => (
            <Tr key={a.id}>
              <Td>{a.name}</Td>
              <Td>{TYPE_LABELS[a.type]}</Td>
              <Td>{a.is_magic ? 'Sim' : 'Não'}</Td>
              <Td>{a.triggers.map(t => t.name).join(', ') || '-'}</Td>
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
