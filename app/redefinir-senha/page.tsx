import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Redefinir senha – Filhos do Vazio',
}

export default function RedefinirSenhaPage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/redefinir-senha" />

      <main
        className="flex-1 flex items-center justify-center px-6"
        style={{ paddingTop: 104, paddingBottom: 64 }}
      >
        <div className="parchment hk-frame w-full rounded-xl p-8" style={{ maxWidth: 440 }}>
          <nav
            className="flex items-center gap-2 mb-6"
            aria-label="Navegação estrutural"
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            <Link href="/entrar" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">
              ← Entrar
            </Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Redefinir senha</span>
          </nav>

          <h1
            className="gold-glow"
            style={{
              fontFamily: 'var(--font-cinzel-decorative)',
              fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
              fontWeight: 900,
              color: 'var(--text)',
              marginBottom: '0.4rem',
            }}
          >
            Redefinir senha
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'rgba(var(--text-rgb),0.55)',
              lineHeight: 1.7,
            }}
          >
            Confirme o e-mail, o token de redefinição e escolha uma nova senha.
          </p>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
