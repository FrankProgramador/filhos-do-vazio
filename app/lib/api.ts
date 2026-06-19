const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(
      data?.message ?? 'Não foi possível completar a operação. Tente novamente.',
      res.status,
      data?.errors
    )
  }

  return data as T
}
