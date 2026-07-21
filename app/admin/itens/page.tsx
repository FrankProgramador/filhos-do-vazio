'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminAbilities, adminItems, type ItemPayload } from '@/app/lib/adminData'
import type { Ability, Item } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const TYPES: Item['type'][] = ['weapon', 'armor', 'shield', 'tool', 'consumable', 'accessory', 'other']
const TYPE_LABELS: Record<Item['type'], string> = {
  weapon: 'Arma', armor: 'Armadura', shield: 'Escudo', tool: 'Ferramenta', consumable: 'Consumível', accessory: 'Acessório', other: 'Outro',
}

const EMPTY: ItemPayload = {
  name: '', slug: '', description: '', weight: 1, quality: '', base_price: 10, durability: null, is_consumable: false, type: 'weapon', image: '',
  base_damage: null, block_value: null, is_two_handed: false, ability_ids: [],
  min_range: null, max_range: null, parent_item_id: null,
}

export default function AdminItensPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ItemPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminAbilities.list(token).then(setAbilities)
    return adminItems.list(token).then(setItems).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(item: Item) {
    const { id, abilities, ...rest } = item
    setEditingId(id)
    setForm({ ...rest, ability_ids: abilities.map(a => a.id) })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function duplicateFrom(sourceId: number) {
    const source = items.find(i => i.id === sourceId)
    if (!source) return
    const { id, abilities, ...rest } = source
    setForm({ ...rest, name: `${source.name} (cópia)`, slug: '', ability_ids: abilities.map(a => a.id), parent_item_id: source.id })
  }

  function toggleAbility(abilityId: number) {
    setForm({
      ...form,
      ability_ids: form.ability_ids.includes(abilityId)
        ? form.ability_ids.filter(id => id !== abilityId)
        : [...form.ability_ids, abilityId],
    })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminItems.update(token, editingId, form)
      else await adminItems.create(token, form)
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
      await adminItems.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Itens</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Item</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Item' : 'Novo Item'}
          </h2>

          {!editingId && items.length > 0 && (
            <Field label="Duplicar de...">
              <Select value="" onChange={e => e.target.value && duplicateFrom(Number(e.target.value))}>
                <option value="">— começar do zero —</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginTop: '0.75rem' }}>
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Tipo" required>
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Item['type'] })}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </Select>
            </Field>
            <Field label="Preço (Geo)" required><Input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} /></Field>
            <Field label="Peso" required><Input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} /></Field>
            <Field label="Durabilidade"><Input type="number" value={form.durability ?? ''} onChange={e => setForm({ ...form, durability: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Qualidade"><Input value={form.quality ?? ''} onChange={e => setForm({ ...form, quality: e.target.value })} /></Field>
            <Field label="Imagem"><Input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value })} /></Field>
            <Field label="Dano base (arma)"><Input type="number" value={form.base_damage ?? ''} onChange={e => setForm({ ...form, base_damage: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Bloqueio base (escudo)"><Input type="number" value={form.block_value ?? ''} onChange={e => setForm({ ...form, block_value: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Alcance mínimo"><Input type="number" min={0} value={form.min_range ?? ''} onChange={e => setForm({ ...form, min_range: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Alcance máximo"><Input type="number" min={0} value={form.max_range ?? ''} onChange={e => setForm({ ...form, max_range: e.target.value ? Number(e.target.value) : null })} /></Field>
            <div className="md:col-span-2">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Habilidades ao equipar</span>
              <div className="flex flex-wrap gap-3" style={{ marginTop: '0.4rem' }}>
                {abilities.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhuma habilidade cadastrada.</p>}
                {abilities.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <input type="checkbox" id={`ability-${a.id}`} checked={form.ability_ids.includes(a.id)} onChange={() => toggleAbility(a.id)} />
                    <label htmlFor={`ability-${a.id}`} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>{a.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2" style={{ paddingTop: '1.5rem' }}>
              <input type="checkbox" id="is_consumable" checked={form.is_consumable} onChange={e => setForm({ ...form, is_consumable: e.target.checked })} />
              <label htmlFor="is_consumable" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Consumível</label>
            </div>
            <div className="flex items-center gap-2" style={{ paddingTop: '1.5rem' }}>
              <input type="checkbox" id="is_two_handed" checked={form.is_two_handed} onChange={e => setForm({ ...form, is_two_handed: e.target.checked })} />
              <label htmlFor="is_two_handed" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'var(--text)' }}>Duas mãos</label>
            </div>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Tipo', 'Preço', 'Peso', '']}>
          {items.map(item => (
            <Tr key={item.id}>
              <Td>{item.name}</Td>
              <Td>{TYPE_LABELS[item.type]}</Td>
              <Td>{item.base_price} Geo</Td>
              <Td>{item.weight}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(item.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
