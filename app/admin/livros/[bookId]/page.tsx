'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminBooks, adminChapters, type ChapterPayload } from '@/app/lib/adminData'
import type { Book, Chapter } from '@/app/lib/bookData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../../AdminUI'

const EMPTY: ChapterPayload = { title: '', slug: '', description: '', status: 'draft', order: 0 }

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list]
  const swapIndex = index + dir
  if (swapIndex < 0 || swapIndex >= next.length) return list
  ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  return next
}

export default function AdminCapitulosPage() {
  const params = useParams()
  const bookId = Number(params.bookId)
  const { token } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ChapterPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminBooks.list(token).then(books => setBook(books.find(b => b.id === bookId) ?? null))
    return adminChapters.list(token, bookId).then(setChapters).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token, bookId])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(c: Chapter) { setEditingId(c.id); setForm({ ...c }); setError(null) }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminChapters.update(token, editingId, form)
      else await adminChapters.create(token, bookId, form)
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
      await adminChapters.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const reordered = moveItem(chapters, index, dir)
    if (reordered === chapters) return
    setChapters(reordered)
    try {
      await adminChapters.reorder(token, bookId, reordered.map(c => c.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao reordenar.')
      await load()
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div>
        <Link href="/admin/livros" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Livros</Link>
        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>
            Capítulos {book ? `— ${book.title}` : ''}
          </h1>
          {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Capítulo</button>}
        </div>
        {book && book.status !== 'published' && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Este livro está em rascunho — capítulos publicados aqui ainda não ficam visíveis publicamente.
          </p>
        )}
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Capítulo' : 'Novo Capítulo'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Título" required><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Slug"><Input value={form.slug ?? ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="gerado a partir do título" /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ChapterPayload['status'] })}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </Select>
            </Field>
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
        <AdminTable headers={['Ordem', 'Título', 'Status', '']}>
          {chapters.map((c, index) => (
            <Tr key={c.id}>
              <Td>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(index, -1)} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === chapters.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>▼</button>
                </div>
              </Td>
              <Td><Link href={`/admin/livros/${bookId}/${c.id}`} style={{ color: 'var(--gold)' }}>{c.title}</Link></Td>
              <Td>
                <span className={c.status === 'published' ? 'badge badge--success' : 'ddb-badge ddb-badge-dim'} style={{ fontSize: '0.6rem' }}>
                  {c.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(c)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(c.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
