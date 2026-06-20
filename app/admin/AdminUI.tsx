'use client'

import { useState } from 'react'

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(var(--gold-rgb),0.15)',
  borderRadius: 6,
  color: 'var(--text)',
  fontFamily: 'var(--font-im-fell)',
  fontSize: '0.88rem',
  outline: 'none',
}

export const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cinzel)',
  fontSize: '0.58rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--gold-light)',
  display: 'block',
  marginBottom: '0.3rem',
}

export function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 70, resize: 'vertical', ...props.style }} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />
}

export function ConfirmButton({ onConfirm, children, className, style }: { onConfirm: () => void; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Confirmar?</span>
        <button
          onClick={() => { setConfirming(false); onConfirm() }}
          className="badge badge--error"
          style={{ fontSize: '0.55rem', border: 'none', cursor: 'pointer' }}
        >
          Sim
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="ddb-badge ddb-badge-dim"
          style={{ fontSize: '0.55rem', border: 'none', cursor: 'pointer' }}
        >
          Não
        </button>
      </span>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className={className} style={style}>
      {children}
    </button>
  )
}

export function AdminTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(var(--gold-rgb),0.15)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr style={{ borderBottom: '1px solid rgba(var(--gold-rgb),0.08)' }}>{children}</tr>
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '0.5rem 0.75rem', color: 'rgba(var(--text-rgb),0.8)', verticalAlign: 'top' }}>{children}</td>
}
