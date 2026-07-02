'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminChapters, adminSections, type SectionPayload } from '@/app/lib/adminData'
import type { Chapter, Section } from '@/app/lib/bookData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Tr } from '../../../AdminUI'

const EMPTY: SectionPayload = { title: '', slug: '', status: 'draft', order: 0 }

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list]
  const swapIndex = index + dir
  if (swapIndex < 0 || swapIndex >= next.length) return list
  ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  return next
}

export default function AdminSecoesPage() {
  const params = useParams()
  const bookId = Number(params.bookId)
  const chapterId = Number(params.chapterId)
  const { token } = useAuth()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SectionPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminChapters.list(token, bookId).then(chapters => setChapter(chapters.find(c => c.id === chapterId) ?? null))
    return adminSections.list(token, bookId, chapterId).then(setSections).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token, bookId, chapterId])

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(s: Section) { setEditingId(s.id); setForm({ title: s.title, slug: s.slug, status: s.status, order: s.order }); setError(null) }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminSections.update(token, editingId, form)
      else await adminSections.create(token, bookId, chapterId, form)
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
      await adminSections.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const reordered = moveItem(sections, index, dir)
    if (reordered === sections) return
    setSections(reordered)
    try {
      await adminSections.reorder(token, bookId, chapterId, reordered.map(s => s.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao reordenar.')
      await load()
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div>
        <Link href={`/admin/livros/${bookId}`} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Capítulos</Link>
        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>
            Seções {chapter ? `— ${chapter.title}` : ''}
          </h1>
          {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Nova Seção</button>}
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Seção' : 'Nova Seção'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Título" required><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Slug"><Input value={form.slug ?? ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="gerado a partir do título" /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as SectionPayload['status'] })}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </Select>
            </Field>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            O conteúdo da seção é editado na tela seguinte, após salvar.
          </p>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Ordem', 'Título', 'Status', '']}>
          {sections.map((s, index) => (
            <Tr key={s.id}>
              <Td>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(index, -1)} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === sections.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>▼</button>
                </div>
              </Td>
              <Td><Link href={`/admin/livros/${bookId}/${chapterId}/${s.id}`} style={{ color: 'var(--gold)' }}>{s.title}</Link></Td>
              <Td>
                <span className={s.status === 'published' ? 'badge badge--success' : 'ddb-badge ddb-badge-dim'} style={{ fontSize: '0.6rem' }}>
                  {s.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(s)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(s.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
