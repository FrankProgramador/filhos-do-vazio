'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/auth-context'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const COLLAPSE_KEY = 'fdv_sidebar_collapsed'

/**
 * Conteúdo de "Mundo" e "Como Jogar" é compartilhado entre visitantes e usuários
 * logados — mas a moldura muda: dentro do painel (Sidebar/Topbar) para quem está
 * logado, página pública (SiteHeader/SiteFooter) para quem não está.
 */
export default function ContentShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_KEY)
    if (stored === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time read from localStorage, runs once before any user interaction
      setCollapsed(true)
    }
  }, [])

  function toggleCollapse() {
    setCollapsed(prev => {
      const next = !prev
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Carregando…
        </span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="dash-shell">
        <Sidebar
          activePath={pathname}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar title={title} onOpenMobile={() => setMobileOpen(true)} />
          <main className="dash-content">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath={pathname} />
      <div className="flex-1 w-full" style={{ paddingTop: 44 }}>{children}</div>
      <SiteFooter />
    </div>
  )
}
