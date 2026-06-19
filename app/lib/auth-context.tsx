'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/app/lib/api'

const STORAGE_KEY = 'fdv_token'

export type AuthUser = {
  id: number
  name: string
  email: string
}

type ForgotPasswordResponse = {
  message: string
  token: string
}

type ResetPasswordParams = {
  email: string
  token: string
  password: string
  password_confirmation: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>
  resetPassword: (params: ResetPasswordParams) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time check, runs once before any user interaction
      setIsLoading(false)
      return
    }

    setToken(stored)

    apiFetch<AuthUser>('/api/user', {}, stored)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: AuthUser; token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    window.localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      await apiFetch('/api/logout', { method: 'POST' }, token).catch(() => {})
    }

    window.localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  const forgotPassword = useCallback((email: string) => {
    return apiFetch<ForgotPasswordResponse>('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }, [])

  const resetPassword = useCallback((params: ResetPasswordParams) => {
    return apiFetch<void>('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }

  return context
}
