'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminSections } from '@/app/lib/adminData'
import type { Section, TipTapDoc } from '@/app/lib/bookData'
import TipTapEditor from '@/components/TipTapEditor'

export default function AdminEditarSecaoPage() {
  const params = useParams()
  const bookId = Number(params.bookId)
  const chapterId = Number(params.chapterId)
  const sectionId = Number(params.sectionId)
  const { token } = useAuth()
  const [section, setSection] = useState<Section | null>(null)
  const [content, setContent] = useState<TipTapDoc>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminSections.list(token, bookId, chapterId)
      .then(sections => {
        const found = sections.find(s => s.id === sectionId) ?? null
        setSection(found)
        setContent(found?.content ?? null)
      })
      .finally(() => setLoading(false))
  }, [token, bookId, chapterId, sectionId])

  async function save() {
    if (!section) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await adminSections.update(token, sectionId, {
        title: section.title,
        slug: section.slug,
        status: section.status,
        content,
      })
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
  if (!section) return <p style={{ color: 'var(--text-muted)' }}>Seção não encontrada.</p>

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div>
        <Link href={`/admin/livros/${bookId}/${chapterId}`} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Seções</Link>
        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>{section.title}</h1>
          <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}
      {saved && <div className="alert alert--success" style={{ fontSize: '0.75rem' }}>Conteúdo salvo.</div>}

      <TipTapEditor content={content} onChange={setContent} />
    </div>
  )
}
