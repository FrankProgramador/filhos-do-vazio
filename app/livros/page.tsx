'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ContentShell from '@/components/ContentShell'
import { fetchBooks, type Book } from '@/app/lib/bookData'

const TYPE_LABEL: Record<Book['type'], string> = {
  regras: 'Regras',
  lore: 'Lore',
  aventuras: 'Aventuras',
  anexo: 'Anexo',
  compendium: 'Compêndio',
}

export default function LivrosPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks().then(setBooks).finally(() => setLoading(false))
  }, [])

  return (
    <ContentShell title="Livros">
      <div className="mx-auto" style={{ maxWidth: 900, padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
          Livros
        </h1>
        <p style={{ fontFamily: 'var(--font-im-fell)', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Regras, lore, aventuras e anexos de Filhos do Vazio.
        </p>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map(book => (
            <Link
              key={book.id}
              href={`/livros/${book.slug}`}
              className="card"
              style={{ padding: '1.25rem', borderRadius: 10, display: 'block', textDecoration: 'none' }}
            >
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)' }}>
                {TYPE_LABEL[book.type]}
              </span>
              <h2 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.2rem', color: 'var(--text)', margin: '0.35rem 0' }}>
                {book.title}
              </h2>
              {book.description && (
                <p style={{ fontFamily: 'var(--font-im-fell)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {book.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {!loading && books.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum livro publicado ainda.</p>
        )}
      </div>
    </ContentShell>
  )
}
