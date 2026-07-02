import { apiFetch } from '@/app/lib/api'

export type BookType = 'regras' | 'lore' | 'aventuras' | 'anexo' | 'compendium'
export type ContentStatus = 'draft' | 'published'

export type TipTapMark = { type: string; attrs?: Record<string, unknown> }
export type TipTapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}
export type TipTapDoc = TipTapNode | null

export type Book = {
  id: number
  title: string
  slug: string
  type: BookType
  description: string | null
  cover_image: string | null
  version: string
  status: ContentStatus
  order: number
  published_at: string | null
  published_chapters?: Chapter[]
}

export type Chapter = {
  id: number
  book_id: number
  title: string
  slug: string
  description: string | null
  status: ContentStatus
  order: number
  published_sections?: Section[]
}

export type Section = {
  id: number
  chapter_id: number
  title: string
  slug: string
  content: TipTapDoc | null
  status: ContentStatus
  order: number
}

export type CompendiumSection = { title: string; content: TipTapDoc }
export type CompendiumChapter = { title: string; sections: CompendiumSection[] }
export type Compendium = { chapters: CompendiumChapter[] }

// ── Público (sem auth) ──────────────────────────────────────────────────────

export const fetchBooks = () => apiFetch<Book[]>('/api/livros')
export const fetchBook = (slug: string) => apiFetch<Book>(`/api/livros/${slug}`)
export const fetchChapter = (bookSlug: string, chapterSlug: string) =>
  apiFetch<Chapter>(`/api/livros/${bookSlug}/${chapterSlug}`)
export const fetchSection = (bookSlug: string, chapterSlug: string, sectionSlug: string) =>
  apiFetch<Section>(`/api/livros/${bookSlug}/${chapterSlug}/${sectionSlug}`)
export const fetchCompendium = () => apiFetch<Compendium>('/api/compendium')

export function bookPdfUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost').replace(/\/+$/, '')
  return `${base}/api/livros/${slug}/pdf`
}
