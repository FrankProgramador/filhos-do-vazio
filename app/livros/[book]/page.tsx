'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchBook, bookPdfUrl, type Book } from '@/app/lib/bookData'

export default function LivroPage() {
  const params = useParams()
  const slug = params.book as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchBook(slug).then(setBook).catch(() => setError(true)).finally(() => setLoading(false))
  }, [slug])

  return (
    <ContentShell title="Livros">
      <div className="mx-auto" style={{ maxWidth: 900, padding: '2.5rem 1.5rem' }}>
        <Link href="/livros" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)' }}>← Livros</Link>

        {loading && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Carregando...</p>}
        {error && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Livro não encontrado.</p>}

        {book && (
          <>
            <div className="flex items-center justify-between" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '2rem', color: 'var(--gold)' }}>{book.title}</h1>
              <a href={bookPdfUrl(book.slug)} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.5rem 1rem', borderRadius: 6, textDecoration: 'none' }}>
                Baixar PDF
              </a>
            </div>
            {book.description && (
              <p style={{ fontFamily: 'var(--font-im-fell)', color: 'var(--text-muted)', marginBottom: '2rem' }}>{book.description}</p>
            )}

            <ol className="flex flex-col gap-2" style={{ marginTop: '1.5rem' }}>
              {(book.published_chapters ?? []).map((chapter, index) => (
                <li key={chapter.id}>
                  <Link
                    href={`/livros/${book.slug}/${chapter.slug}`}
                    className="card"
                    style={{ display: 'block', padding: '0.85rem 1.1rem', borderRadius: 8, textDecoration: 'none' }}
                  >
                    <span style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--gold-light)', marginRight: '0.5rem' }}>{index + 1}.</span>
                    <span style={{ fontFamily: 'var(--font-im-fell)', color: 'var(--text)' }}>{chapter.title}</span>
                  </Link>
                </li>
              ))}
            </ol>

            {(book.published_chapters ?? []).length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>Nenhum capítulo publicado ainda.</p>
            )}
          </>
        )}
      </div>
    </ContentShell>
  )
}
