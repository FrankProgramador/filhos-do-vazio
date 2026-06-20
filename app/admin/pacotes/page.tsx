'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminItems, adminPackages, type EquipmentPackagePayload } from '@/app/lib/adminData'
import type { EquipmentPackage, Item } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const EMPTY: EquipmentPackagePayload = { name: '', slug: '', description: '', geo_bonus: 0, image: '', items: [] }

export default function AdminPacotesPage() {
  const { token } = useAuth()
  const [packages, setPackages] = useState<EquipmentPackage[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EquipmentPackagePayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([adminPackages.list(token), adminItems.list(token)])
    .then(([pkgs, its]) => { setPackages(pkgs); setItems(its) })
    .finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(pkg: EquipmentPackage) {
    setEditingId(pkg.id)
    setForm({ ...pkg, items: pkg.items.map(i => ({ item_id: i.id, quantity: i.pivot.quantity })) })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function addItemRow() {
    if (items.length === 0) return
    setForm({ ...form, items: [...form.items, { item_id: items[0].id, quantity: 1 }] })
  }
  function updateItemRow(i: number, patch: Partial<{ item_id: number; quantity: number }>) {
    setForm({ ...form, items: form.items.map((row, idx) => idx === i ? { ...row, ...patch } : row) })
  }
  function removeItemRow(i: number) {
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminPackages.update(token, editingId, form)
      else await adminPackages.create(token, form)
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
      await adminPackages.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Pacotes de Equipamento</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Pacote</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Pacote' : 'Novo Pacote'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Bônus de Geo" required><Input type="number" value={form.geo_bonus} onChange={e => setForm({ ...form, geo_bonus: Number(e.target.value) })} /></Field>
            <Field label="Imagem"><Input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Itens do Pacote
          </h3>
          <div className="flex flex-col gap-2">
            {form.items.map((row, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <Select value={row.item_id} onChange={e => updateItemRow(i, { item_id: Number(e.target.value) })} style={{ minWidth: 180 }}>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                </Select>
                <Input type="number" min={1} value={row.quantity} onChange={e => updateItemRow(i, { quantity: Number(e.target.value) })} style={{ width: 80 }} />
                <button onClick={() => removeItemRow(i)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Remover</button>
              </div>
            ))}
            <button onClick={addItemRow} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Adicionar item</button>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Bônus Geo', 'Itens', '']}>
          {packages.map(pkg => (
            <Tr key={pkg.id}>
              <Td>{pkg.name}</Td>
              <Td>+{pkg.geo_bonus}</Td>
              <Td>{pkg.items.length}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(pkg)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(pkg.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
