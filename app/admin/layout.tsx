'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'

const navItems = [
  { href: '/admin', label: 'Visão Geral' },
  { href: '/admin/tamanhos', label: 'Tamanhos' },
  { href: '/admin/tracos', label: 'Traços' },
  // Fora do ar temporariamente enquanto a engine de Effects/Behavior/Calculation
  // está em teste — descomentar conforme forem retomados.
  // { href: '/admin/tags', label: 'Tags' },
  // { href: '/admin/itens', label: 'Itens' },
  // { href: '/admin/pacotes', label: 'Pacotes de Equipamento' },
  // { href: '/admin/trilhas', label: 'Trilhas' },
  { href: '/admin/habilidades', label: 'Habilidades' },
  { href: '/admin/efeitos', label: 'Efeitos' },
  { href: '/admin/atributos', label: 'Atributos' },
  { href: '/admin/recursos', label: 'Recursos' },
  { href: '/admin/elementos', label: 'Elementos' },
  { href: '/admin/condicoes', label: 'Condições' },
  { href: '/admin/comportamentos', label: 'Comportamentos' },
  { href: '/admin/calculos', label: 'Cálculos' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.replace('/painel')
    }
  }, [isLoading, user, router])

  if (isLoading || !user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Carregando…
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <aside style={{
        width: 230,
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid rgba(var(--error-rgb),0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(var(--error-rgb),0.12)' }}>
          <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(var(--error-rgb),0.85)', marginBottom: '0.25rem' }}>
            ⚠ Acesso restrito
          </p>
          <Link href="/admin" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1rem', color: 'var(--text)', textDecoration: 'none' }}>
            Painel Administrativo
          </Link>
        </div>

        <nav className="flex flex-col" style={{ padding: '0.85rem 0.65rem', gap: '0.2rem', flex: 1 }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.6rem 0.75rem',
                borderRadius: 6,
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                color: pathname === item.href ? 'rgba(var(--error-rgb),0.95)' : 'var(--text-muted)',
                background: pathname === item.href ? 'rgba(var(--error-rgb),0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0.85rem', borderTop: '1px solid rgba(var(--error-rgb),0.12)' }}>
          <Link href="/painel" style={{ display: 'block', fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--gold)', marginBottom: '0.5rem', textDecoration: 'none' }}>
            ← Voltar ao Painel
          </Link>
          <button
            onClick={() => logout()}
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Sair ({user.name})
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0" style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
