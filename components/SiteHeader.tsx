'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'

const SoulLogo = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="16" r="14" fill="rgba(var(--bg-rgb),0.8)" stroke="rgba(var(--gold-rgb),0.4)" strokeWidth="1" />
    <ellipse cx="16" cy="16" rx="5" ry="7" fill="none" stroke="rgba(var(--gold-rgb),0.7)" strokeWidth="1.4" />
    <path d="M16 6 C16 6, 13 11, 16 14 C19 11, 16 6, 16 6Z" fill="rgba(var(--gold-rgb),0.5)" />
    <circle cx="16" cy="16" r="2.2" fill="rgba(var(--gold-rgb),0.9)" />
  </svg>
)

const navLinks = [
  { href: '/locais',       label: 'Mundo' },
  { href: '/como-jogar',   label: 'Como Jogar' },
  { href: '/criar-personagem', label: 'Criação de Personagem' },
  { href: '/#legado',      label: 'Minhas Fichas' },
  { href: '/#partidas',    label: 'Campanhas' },
]

export default function SiteHeader({ activePath }: { activePath?: string }) {
  const [open, setOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    setOpen(false)
    router.push('/')
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: 44,
          background: 'rgba(var(--bg-rgb),0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(var(--gold-rgb),0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SoulLogo />
            <span
              className="whitespace-nowrap hidden sm:inline"
              style={{
                fontFamily: 'var(--font-cinzel-decorative)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text)',
                textShadow: '0 0 10px rgba(var(--gold-rgb),0.45)',
              }}
            >
              Filhos do Vazio
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-0.5 flex-1 overflow-x-auto" aria-label="Menu principal">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="ddb-nav-link"
                style={activePath === href ? { color: 'var(--gold)' } : undefined}
              >
                {label}
              </Link>
            ))}
            {!isLoading && (
              user ? (
                <>
                  <Link href="/painel" className="ddb-nav-link ml-2 shrink-0">
                    Painel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ddb-nav-link shrink-0 border-0 bg-transparent cursor-pointer"
                    style={{
                      color: 'var(--gold)',
                      border: '1px solid rgba(var(--gold-rgb),0.35)',
                      background: 'rgba(var(--gold-rgb),0.06)',
                      borderRadius: 4,
                    }}
                  >
                    Sair ({user.name})
                  </button>
                </>
              ) : (
                <Link
                  href="/entrar"
                  className="ddb-nav-link ml-2 shrink-0"
                  style={{
                    color: 'var(--gold)',
                    border: '1px solid rgba(var(--gold-rgb),0.35)',
                    background: 'rgba(var(--gold-rgb),0.06)',
                    borderRadius: 4,
                  }}
                >
                  Entrar
                </Link>
              )
            )}
          </nav>

          <button
            className="sm:hidden ml-auto flex flex-col gap-1.25 p-1.5 border-0 bg-transparent cursor-pointer"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className="block w-5 rounded transition-all duration-300"
              style={{
                height: 2,
                background: 'var(--text)',
                transform: open ? 'translateY(7px) rotate(45deg)' : undefined,
              }}
            />
            <span
              className="block w-5 rounded transition-all duration-300"
              style={{ height: 2, background: 'var(--text)', opacity: open ? 0 : 1 }}
            />
            <span
              className="block w-5 rounded transition-all duration-300"
              style={{
                height: 2,
                background: 'var(--text)',
                transform: open ? 'translateY(-7px) rotate(-45deg)' : undefined,
              }}
            />
          </button>
        </div>
      </header>

      {open && (
        <nav
          className="fixed z-40 flex flex-col gap-1 px-6 py-4 sm:hidden"
          style={{
            top: 44,
            left: 0,
            right: 0,
            background: 'rgba(var(--bg-rgb),0.98)',
            borderBottom: '1px solid rgba(var(--gold-rgb),0.1)',
            backdropFilter: 'blur(14px)',
          }}
          aria-label="Menu mobile"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="ddb-nav-link py-3 rounded"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {!isLoading && (
            user ? (
              <>
                <Link
                  href="/painel"
                  className="ddb-nav-link py-3 rounded"
                  style={{ color: 'var(--gold)' }}
                  onClick={() => setOpen(false)}
                >
                  Painel
                </Link>
                <button
                  onClick={handleLogout}
                  className="ddb-nav-link py-3 rounded text-left border-0 bg-transparent cursor-pointer"
                  style={{ color: 'var(--gold)' }}
                >
                  Sair ({user.name})
                </button>
              </>
            ) : (
              <Link
                href="/entrar"
                className="ddb-nav-link py-3 rounded"
                style={{ color: 'var(--gold)' }}
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            )
          )}
        </nav>
      )}
    </>
  )
}
