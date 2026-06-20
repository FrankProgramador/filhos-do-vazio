'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminTraits, type TraitModifierPayload, type TraitPayload } from '@/app/lib/adminData'
import type { GameTrait, TraitCategory, TraitRarity } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const CATEGORIES: TraitCategory[] = ['body', 'senses', 'movement', 'defense', 'social', 'mystic', 'personality']
const CATEGORY_LABELS: Record<TraitCategory, string> = {
  body: 'Corporais', senses: 'Sentidos', movement: 'Movimento', defense: 'Defesa', social: 'Social', mystic: 'Místicos', personality: 'Personalidade',
}
const RARITIES: TraitRarity[] = ['common', 'remarkable', 'rare', 'personality']
const RARITY_LABELS: Record<TraitRarity, string> = { common: 'Comum', remarkable: 'Marcante', rare: 'Raro', personality: 'Personalidade' }

const ATTRS = ['poder', 'saber', 'casca', 'graca', 'coracao', 'estamina', 'alma', 'velocidade', 'fofo', 'assustador']
const OPERATIONS: TraitModifierPayload['operation'][] = ['add', 'subtract', 'multiply', 'set']

const EMPTY: TraitPayload = {
  slug: '', name: '', category: 'body', rarity: 'common', description: '', mechanical_effect: '',
  roleplay_obligation: '', sustento_cost: 0, max_selections: 1, is_inherent: false, prerequisite_trait_id: null,
  thumb: '', modifiers: [],
}

export default function AdminTracosPage() {
  const { token } = useAuth()
  const [traits, setTraits] = useState<GameTrait[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TraitPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminTraits.list(token).then(setTraits).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(trait: GameTrait) {
    setEditingId(trait.id)
    setForm({
      ...trait,
      modifiers: trait.modifiers.map(m => ({ attribute: m.attribute, operation: m.operation, value: Number(m.value) })),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function addModifier() {
    setForm({ ...form, modifiers: [...form.modifiers, { attribute: 'poder', operation: 'add', value: 1 }] })
  }
  function updateModifier(i: number, patch: Partial<TraitModifierPayload>) {
    setForm({ ...form, modifiers: form.modifiers.map((m, idx) => idx === i ? { ...m, ...patch } : m) })
  }
  function removeModifier(i: number) {
    setForm({ ...form, modifiers: form.modifiers.filter((_, idx) => idx !== i) })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminTraits.update(token, editingId, form)
      else await adminTraits.create(token, form)
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
      await adminTraits.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Traços</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Traço</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Traço' : 'Novo Traço'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Categoria" required>
              <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as TraitCategory })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </Select>
            </Field>
            <Field label="Raridade" required>
              <Select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value as TraitRarity })}>
                {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </Select>
            </Field>
            <Field label="Máx. de seleções" required><Input type="number" min={1} value={form.max_selections} onChange={e => setForm({ ...form, max_selections: Number(e.target.value) })} /></Field>
            <Field label="Pré-requisito (sub-traço de)">
              <Select
                value={form.prerequisite_trait_id ?? ''}
                onChange={e => setForm({ ...form, prerequisite_trait_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Nenhum</option>
                {traits.filter(t => t.id !== editingId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição" required><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Efeito mecânico"><Textarea value={form.mechanical_effect ?? ''} onChange={e => setForm({ ...form, mechanical_effect: e.target.value })} /></Field>
            </div>
            {form.rarity === 'personality' && (
              <div className="md:col-span-2">
                <Field label="Obrigação de interpretação" required><Textarea value={form.roleplay_obligation ?? ''} onChange={e => setForm({ ...form, roleplay_obligation: e.target.value })} /></Field>
              </div>
            )}
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Modificadores de Atributo
          </h3>
          <div className="flex flex-col gap-2">
            {form.modifiers.map((mod, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <Select value={mod.attribute} onChange={e => updateModifier(i, { attribute: e.target.value })} style={{ width: 120 }}>
                  {ATTRS.map(a => <option key={a} value={a}>{a}</option>)}
                </Select>
                <Select value={mod.operation} onChange={e => updateModifier(i, { operation: e.target.value as TraitModifierPayload['operation'] })} style={{ width: 110 }}>
                  {OPERATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
                <Input type="number" step="0.1" value={mod.value} onChange={e => updateModifier(i, { value: Number(e.target.value) })} style={{ width: 90 }} />
                <button onClick={() => removeModifier(i)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover</button>
              </div>
            ))}
            <button onClick={addModifier} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar modificador</button>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Categoria', 'Raridade', 'Pré-requisito', '']}>
          {traits.map(trait => (
            <Tr key={trait.id}>
              <Td>{trait.name}</Td>
              <Td>{CATEGORY_LABELS[trait.category]}</Td>
              <Td>{RARITY_LABELS[trait.rarity]}</Td>
              <Td>{trait.prerequisite_trait_id ? traits.find(t => t.id === trait.prerequisite_trait_id)?.name ?? '-' : '-'}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(trait)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(trait.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
