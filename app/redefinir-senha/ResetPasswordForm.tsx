'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'

export default function ResetPasswordForm() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
      setTimeout(() => router.push('/entrar'), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="alert alert--success mt-6" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
        Senha redefinida com sucesso. Redirecionando para a página de entrada…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
      <label className="flex flex-col gap-1.5">
        <span className="input-label">E-mail</span>
        <input
          type="email"
          required
          autoComplete="email"
          className="input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="input-label">Token</span>
        <input
          type="text"
          required
          className="input"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="input-label">Nova senha</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="input-label">Confirmar nova senha</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          className="input"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
        />
      </label>

      {error && (
        <div className="alert alert--error" style={{ fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="hk-btn hk-btn-gold rounded-md py-2.5 mt-2"
      >
        {isSubmitting ? 'Redefinindo…' : 'Redefinir senha'}
      </button>

      <Link href="/esqueci-senha" style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textAlign: 'center' }}>
        Gerar um novo token
      </Link>
    </form>
  )
}
