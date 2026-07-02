'use client'

import { useEffect, useState } from 'react'
import ContentShell from '@/components/ContentShell'
import { fetchCompendium, type Compendium } from '@/app/lib/bookData'
import TipTapRenderer from '@/components/TipTapRenderer'

export default function CompendioPage() {
  const [compendium, setCompendium] = useState<Compendium | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChapter, setActiveChapter] = useState(0)

  useEffect(() => {
    fetchCompendium().then(setCompendium).finally(() => setLoading(false))
  }, [])

  return (
    <ContentShell title="Compêndio">
      <div className="mx-auto" style={{ maxWidth: 1000, padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
          Compêndio
        </h1>
        <p style={{ fontFamily: 'var(--font-im-fell)', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Trilhas, traços, itens e habilidades — gerado a partir dos dados atuais do jogo.
        </p>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>}

        {compendium && (
          <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
            <nav className="flex flex-col gap-1.5" style={{ width: 200, flexShrink: 0 }}>
              {compendium.chapters.map((chapter, index) => (
                <button
                  key={chapter.title}
                  onClick={() => setActiveChapter(index)}
                  style={{
                    textAlign: 'left',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                    color: activeChapter === index ? 'var(--gold)' : 'var(--text-muted)',
                    background: activeChapter === index ? 'rgba(var(--gold-rgb),0.1)' : 'transparent',
                  }}
                >
                  {chapter.title}
                </button>
              ))}
            </nav>

            <div className="flex-1 min-w-0 flex flex-col gap-8">
              {compendium.chapters[activeChapter]?.sections.map(section => (
                <section key={section.title}>
                  <h2 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.18)', paddingBottom: '0.4rem' }}>
                    {section.title}
                  </h2>
                  <TipTapRenderer content={section.content} />
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </ContentShell>
  )
}
