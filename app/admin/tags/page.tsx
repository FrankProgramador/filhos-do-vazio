'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminTags, type TagPayload } from '@/app/lib/adminData'
import type { Tag, TagGroup } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const GROUPS: TagGroup[] = ['tracos', 'armas', 'habilidades', 'lore']
const GROUP_LABELS: Record<TagGroup, string> = { tracos: 'Traços', armas: 'Armas', habilidades: 'Habilidades', lore: 'Lore' }

const EMPTY: TagPayload = { name: '', group: 'tracos', color: '', icon: '', description: '' }

export default function AdminTagsPage() {
  const { token } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [filterGroup, setFilterGroup] = useState<TagGroup | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TagPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminTags.list(token).then(setTags).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(tag: Tag) { setEditingId(tag.id); setForm({ ...tag }); setError(null) }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminTags.update(token, editingId, form)
      else await adminTags.create(token, form)
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
      await adminTags.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  const visible = filterGroup === 'all' ? tags : tags.filter(t => t.group === filterGroup)

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Tags</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Nova Tag</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Tag' : 'Nova Tag'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Grupo" required>
              <Select value={form.group} onChange={e => setForm({ ...form, group: e.target.value as TagGroup })}>
                {GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
              </Select>
            </Field>
            <Field label="Ícone"><Input value={form.icon ?? ''} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🧬" /></Field>
            <Field label="Cor"><Input value={form.color ?? ''} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#c9a227" /></Field>
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

      <div className="flex items-center gap-2">
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Filtrar por grupo:</span>
        <Select value={filterGroup} onChange={e => setFilterGroup(e.target.value as TagGroup | 'all')} style={{ width: 200 }}>
          <option value="all">Todos</option>
          {GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
        </Select>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Ícone', 'Nome', 'Grupo', '']}>
          {visible.map(tag => (
            <Tr key={tag.id}>
              <Td>{tag.icon}</Td>
              <Td>{tag.name}</Td>
              <Td>{GROUP_LABELS[tag.group]}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(tag)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(tag.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
