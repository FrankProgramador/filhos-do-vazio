'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminTrilhas, type TrilhaPayload } from '@/app/lib/adminData'
import type { Trilha } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const EMPTY: TrilhaPayload = { slug: '', nome: '', tipo: 'marcial', thumb: '', nivel: null, beneficios: '', barra_aumentada: 'estamina', aumento: 1 }

export default function AdminTrilhasPage() {
  const { token } = useAuth()
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TrilhaPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminTrilhas.list(token).then(setTrilhas).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(t: Trilha) { setEditingId(t.id); setForm({ ...t }); setError(null) }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminTrilhas.update(token, editingId, form)
      else await adminTrilhas.create(token, form)
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
      await adminTrilhas.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Trilhas</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Nova Trilha</button>}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Trilha' : 'Nova Trilha'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Nome" required><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></Field>
            <Field label="Tipo" required>
              <Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TrilhaPayload['tipo'] })}>
                <option value="marcial">Marcial</option>
                <option value="mistico">Místico</option>
              </Select>
            </Field>
            <Field label="Barra Aumentada" required>
              <Select value={form.barra_aumentada} onChange={e => setForm({ ...form, barra_aumentada: e.target.value as TrilhaPayload['barra_aumentada'] })}>
                <option value="estamina">Estamina</option>
                <option value="alma">Alma</option>
              </Select>
            </Field>
            <Field label="Aumento" required><Input type="number" value={form.aumento} onChange={e => setForm({ ...form, aumento: Number(e.target.value) })} /></Field>
            <Field label="Nível"><Input type="number" value={form.nivel ?? ''} onChange={e => setForm({ ...form, nivel: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Thumb (URL)"><Input value={form.thumb ?? ''} onChange={e => setForm({ ...form, thumb: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Benefícios" required><Textarea value={form.beneficios} onChange={e => setForm({ ...form, beneficios: e.target.value })} /></Field>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Tipo', 'Barra', 'Aumento', '']}>
          {trilhas.map(t => (
            <Tr key={t.id}>
              <Td>{t.nome}</Td>
              <Td>{t.tipo}</Td>
              <Td>{t.barra_aumentada}</Td>
              <Td>+{t.aumento}</Td>
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
