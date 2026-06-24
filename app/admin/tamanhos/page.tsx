'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminSizes, type SizePayload } from '@/app/lib/adminData'
import type { Size } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Td, Textarea, Tr } from '../AdminUI'

const ATTR_FIELDS: Array<keyof SizePayload> = [
  'poder', 'saber', 'casca', 'graca', 'coracao', 'estamina', 'alma', 'velocidade', 'fofo', 'assustador',
]

const EMPTY: SizePayload = {
  slug: '', name: '', description: '', image: '',
  poder: 1, saber: 1, casca: 1, graca: 1, coracao: 1, estamina: 1, alma: 1, velocidade: 1, fofo: 1, assustador: 1,
  sustento_inicial: 0, sustento_maximo: 1, order: 0,
}

export default function AdminTamanhosPage() {
  const { token } = useAuth()
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SizePayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminSizes.list(token).then(setSizes).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() {
    setEditingId(0)
    setForm(EMPTY)
    setError(null)
  }

  function startEdit(size: Size) {
    setEditingId(size.id)
    setForm({ ...size })
    setError(null)
  }

  function cancel() {
    setEditingId(null)
    setForm(EMPTY)
    setError(null)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await adminSizes.update(token, editingId, form)
      } else {
        await adminSizes.create(token, form)
      }
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
      await adminSizes.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Tamanhos</h1>
        {editingId === null && (
          <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Tamanho</button>
        )}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Tamanho' : 'Novo Tamanho'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Ordem"><Input type="number" value={form.order ?? 0} onChange={e => setForm({ ...form, order: Number(e.target.value) })} /></Field>
            <Field label="Imagem (chave/slug)"><Input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Atributos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ATTR_FIELDS.map(attr => (
              <Field key={attr} label={attr}>
                <Input type="number" step="1" value={form[attr] as number} onChange={e => setForm({ ...form, [attr]: Number(e.target.value) })} />
              </Field>
            ))}
          </div>

          <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
            Sustento
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sustento inicial"><Input type="number" value={form.sustento_inicial} onChange={e => setForm({ ...form, sustento_inicial: Number(e.target.value) })} /></Field>
            <Field label="Sustento (ração/descanso)"><Input type="number" value={form.sustento_maximo} onChange={e => setForm({ ...form, sustento_maximo: Number(e.target.value) })} /></Field>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      ) : (
        <AdminTable headers={['Nome', 'Slug', 'Sustento', 'Ordem', '']}>
          {sizes.map(size => (
            <Tr key={size.id}>
              <Td>{size.name}</Td>
              <Td>{size.slug}</Td>
              <Td>{size.sustento_maximo}</Td>
              <Td>{size.order ?? '-'}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(size)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(size.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
