'use client'

import Link from 'next/link'
import {
  IconBook,
  IconChevronLeft,
  IconHome,
  IconMap,
  IconQuestion,
  IconScroll,
  IconShield,
} from '@/components/dashboard/icons'

const navItems = [
  { href: '/painel', label: 'Início', icon: IconHome },
  { href: '/criar-personagem', label: 'Criar Personagem', icon: IconScroll },
  { href: '/locais', label: 'Mundo', icon: IconMap },
  { href: '/faccoes', label: 'Facções', icon: IconShield },
  { href: '/historia', label: 'História', icon: IconBook },
  { href: '/como-jogar', label: 'Como Jogar', icon: IconQuestion },
]

type SidebarProps = {
  activePath?: string
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export default function Sidebar({ activePath, collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen && <div className="dash-overlay" onClick={onCloseMobile} aria-hidden />}

      <aside
        className={`dash-sidebar ${collapsed ? 'dash-sidebar--collapsed' : ''} ${mobileOpen ? 'dash-sidebar--mobile-open' : ''}`}
        aria-label="Menu do painel"
      >
        <div className="dash-sidebar-header">
          <Link href="/painel" className="dash-sidebar-title" style={{ textDecoration: 'none' }} onClick={onCloseMobile}>
            {collapsed ? 'FV' : 'Filhos do Vazio'}
          </Link>
        </div>

        <nav className="dash-sidebar-nav" aria-label="Navegação do painel">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`dash-nav-item ${activePath === href ? 'active' : ''}`}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
            >
              <Icon className="dash-nav-icon" />
              {!collapsed && <span className="dash-nav-label">{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <button
            type="button"
            className="dash-toggle-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <span
              className="dash-nav-icon"
              style={{ display: 'inline-flex', transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 0.25s' }}
            >
              <IconChevronLeft />
            </span>
            {!collapsed && <span className="dash-nav-label">Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
