'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchSection, type Section } from '@/app/lib/bookData'
import TipTapRenderer from '@/components/TipTapRenderer'

export default function SecaoPage() {
  const params = useParams()
  const bookSlug = params.book as string
  const chapterSlug = params.chapter as string
  const sectionSlug = params.section as string
  const [section, setSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchSection(bookSlug, chapterSlug, sectionSlug).then(setSection).catch(() => setError(true)).finally(() => setLoading(false))
  }, [bookSlug, chapterSlug, sectionSlug])

  return (
    <ContentShell title="Livros">
      <div className="mx-auto" style={{ maxWidth: 760, padding: '2.5rem 1.5rem' }}>
        <Link href={`/livros/${bookSlug}/${chapterSlug}`} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Voltar</Link>

        {loading && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Carregando...</p>}
        {error && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Seção não encontrada.</p>}

        {section && (
          <>
            <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.8rem', color: 'var(--gold)', margin: '1rem 0 1.5rem' }}>
              {section.title}
            </h1>
            <TipTapRenderer content={section.content} />
          </>
        )}
      </div>
    </ContentShell>
  )
}
