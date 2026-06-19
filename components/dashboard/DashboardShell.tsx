'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/auth-context'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

const COLLAPSE_KEY = 'fdv_sidebar_collapsed'

export default function DashboardShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
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

  useEffect(() => {
    if (!isLoading && !user) router.replace('/entrar')
  }, [isLoading, user, router])

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Carregando…
        </span>
      </div>
    )
  }

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
