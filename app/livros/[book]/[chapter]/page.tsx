'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchChapter, type Chapter } from '@/app/lib/bookData'

export default function CapituloPage() {
  const params = useParams()
  const bookSlug = params.book as string
  const chapterSlug = params.chapter as string
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchChapter(bookSlug, chapterSlug).then(setChapter).catch(() => setError(true)).finally(() => setLoading(false))
  }, [bookSlug, chapterSlug])

  return (
    <ContentShell title="Livros">
      <div className="mx-auto" style={{ maxWidth: 900, padding: '2.5rem 1.5rem' }}>
        <Link href={`/livros/${bookSlug}`} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Voltar</Link>

        {loading && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Carregando...</p>}
        {error && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Capítulo não encontrado.</p>}

        {chapter && (
          <>
            <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '2rem', color: 'var(--gold)', marginTop: '1rem', marginBottom: '1.5rem' }}>
              {chapter.title}
            </h1>

            <ol className="flex flex-col gap-2">
              {(chapter.published_sections ?? []).map((section, index) => (
                <li key={section.id}>
                  <Link
                    href={`/livros/${bookSlug}/${chapterSlug}/${section.slug}`}
                    className="card"
                    style={{ display: 'block', padding: '0.85rem 1.1rem', borderRadius: 8, textDecoration: 'none' }}
                  >
                    <span style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--gold-light)', marginRight: '0.5rem' }}>{index + 1}.</span>
                    <span style={{ fontFamily: 'var(--font-im-fell)', color: 'var(--text)' }}>{section.title}</span>
                  </Link>
                </li>
              ))}
            </ol>

            {(chapter.published_sections ?? []).length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma seção publicada ainda.</p>
            )}
          </>
        )}
      </div>
    </ContentShell>
  )
}
