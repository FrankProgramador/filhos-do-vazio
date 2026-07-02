'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminBooks, type BookPayload } from '@/app/lib/adminData'
import type { Book } from '@/app/lib/bookData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const EMPTY: BookPayload = { title: '', slug: '', type: 'regras', description: '', cover_image: '', version: '1.0', order: 0 }

export default function AdminLivrosPage() {
  const { token } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<BookPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  const load = () => adminBooks.list(token).then(setBooks).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(b: Book) { setEditingId(b.id); setForm({ ...b }); setError(null) }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminBooks.update(token, editingId, form)
      else await adminBooks.create(token, form)
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
      await adminBooks.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  async function publish(id: number) {
    try {
      await adminBooks.publish(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao publicar.')
    }
  }

  async function runImport() {
    setImporting(true)
    setError(null)
    try {
      await adminBooks.import(token, undefined, false)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao importar.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Livros</h1>
        <div className="flex items-center gap-2">
          <button onClick={runImport} disabled={importing} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem', borderRadius: 6 }}>
            {importing ? 'Importando...' : 'Importar de storage/books'}
          </button>
          {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Livro</button>}
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Livro' : 'Novo Livro'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Título" required><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Slug"><Input value={form.slug ?? ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="gerado a partir do título" /></Field>
            <Field label="Tipo" required>
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as BookPayload['type'] })}>
                <option value="regras">Regras</option>
                <option value="lore">Lore</option>
                <option value="aventuras">Aventuras</option>
                <option value="anexo">Anexo</option>
                <option value="compendium">Compêndio</option>
              </Select>
            </Field>
            <Field label="Versão"><Input value={form.version ?? ''} onChange={e => setForm({ ...form, version: e.target.value })} /></Field>
            <Field label="Capa (URL)"><Input value={form.cover_image ?? ''} onChange={e => setForm({ ...form, cover_image: e.target.value })} /></Field>
            <Field label="Ordem"><Input type="number" value={form.order ?? 0} onChange={e => setForm({ ...form, order: Number(e.target.value) })} /></Field>
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
        <AdminTable headers={['Título', 'Tipo', 'Status', 'Versão', '']}>
          {books.map(b => (
            <Tr key={b.id}>
              <Td><Link href={`/admin/livros/${b.id}`} style={{ color: 'var(--gold)' }}>{b.title}</Link></Td>
              <Td>{b.type}</Td>
              <Td>
                <span className={b.status === 'published' ? 'badge badge--success' : 'ddb-badge ddb-badge-dim'} style={{ fontSize: '0.6rem' }}>
                  {b.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </Td>
              <Td>{b.version}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => publish(b.id)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>
                    {b.status === 'published' ? 'Publicar alterações' : 'Publicar'}
                  </button>
                  <button onClick={() => startEdit(b)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(b.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
