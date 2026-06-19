'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/auth-context'
import { IconLogout, IconMenu } from '@/components/dashboard/icons'

type TopbarProps = {
  title: string
  onOpenMobile: () => void
}

export default function Topbar({ title, onOpenMobile }: TopbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <header className="dash-topbar">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="dash-icon-btn dash-mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Abrir menu"
        >
          <IconMenu />
        </button>
        <span className="dash-topbar-title">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="dash-user-chip">
          <span className="dash-avatar">{initial}</span>
          <span className="dash-user-name hidden sm:inline">{user?.name}</span>
        </div>
        <button type="button" className="dash-icon-btn" onClick={handleLogout} aria-label="Sair">
          <IconLogout />
        </button>
      </div>
    </header>
  )
}
