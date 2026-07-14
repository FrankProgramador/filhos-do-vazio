'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import {
  IconChevronLeft,
  IconDice,
  IconGrid,
  IconHome,
  IconMap,
  IconPlay,
  IconQuestion,
  IconScroll,
  IconShield,
} from '@/components/dashboard/icons'

type NavItem = {
  href: string
  label: string
  icon: typeof IconHome
  children?: Array<{ href: string; label: string }>
}

const navItems: NavItem[] = [
  { href: '/painel', label: 'Início', icon: IconHome },
  { href: '/criar-personagem', label: 'Criar Personagem', icon: IconScroll },
  { href: '/painel/personagens', label: 'Meus Personagens', icon: IconShield },
  { href: '/painel/mapas', label: 'Mapas', icon: IconGrid },
  { href: '/painel/jogo', label: 'Jogo (teste)', icon: IconPlay },
  { href: '/painel/colecao-de-dados', label: 'Coleção de Dados', icon: IconDice },
  {
    href: '/locais',
    label: 'Mundo',
    icon: IconMap,
    children: [
      { href: '/historia', label: 'História' },
      { href: '/locais', label: 'Locais' },
      { href: '/faccoes', label: 'Facções' },
    ],
  },
  {
    href: '/como-jogar',
    label: 'Como Jogar',
    icon: IconQuestion,
    children: [
      { href: '/como-jogar', label: 'Regras' },
      { href: '/como-jogar/tracos', label: 'Traços' },
      { href: '/como-jogar/itens', label: 'Itens' },
    ],
  },
]

type SidebarProps = {
  activePath?: string
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export default function Sidebar({ activePath, collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState<string | null>(
    navItems.find(item => item.children?.some(c => c.href === activePath))?.href ?? null
  )

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
          {navItems.map(({ href, label, icon: Icon, children }) => {
            const isGroupActive = activePath === href || children?.some(c => c.href === activePath)
            const isExpanded = expanded === href

            if (!children) {
              return (
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
              )
            }

            return (
              <div key={href}>
                <button
                  type="button"
                  className={`dash-nav-item ${isGroupActive ? 'active' : ''}`}
                  style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : href)}
                  title={collapsed ? label : undefined}
                  aria-expanded={isExpanded}
                >
                  <Icon className="dash-nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="dash-nav-label" style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                      <span style={{ display: 'inline-flex', transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <IconChevronLeft />
                      </span>
                    </>
                  )}
                </button>

                {!collapsed && isExpanded && (
                  <div className="flex flex-col" style={{ marginLeft: '1.6rem', gap: '0.1rem' }}>
                    {children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`dash-nav-item ${activePath === child.href ? 'active' : ''}`}
                        style={{ padding: '0.45rem 0.75rem' }}
                        onClick={onCloseMobile}
                      >
                        <span className="dash-nav-label" style={{ fontSize: '0.66rem' }}>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="dash-sidebar-footer">
          {user?.is_admin && (
            <Link
              href="/admin"
              className="dash-nav-item"
              style={{ color: 'rgba(var(--error-rgb),0.85)', marginBottom: '0.3rem' }}
              onClick={onCloseMobile}
              title={collapsed ? 'Painel Administrativo' : undefined}
            >
              <IconShield className="dash-nav-icon" />
              {!collapsed && <span className="dash-nav-label">Admin</span>}
            </Link>
          )}
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
