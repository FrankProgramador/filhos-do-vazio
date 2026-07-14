type IconProps = {
  className?: string
}

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconHome({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
      <path d="M9.5 19.5v-6h5v6" />
    </svg>
  )
}

export function IconScroll({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 4a2 2 0 1 0 0 4" />
      <path d="M9 9h7M9 13h7M9 17h4" />
    </svg>
  )
}

export function IconMap({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function IconShield({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 4.5 6v6c0 5 3.5 7.5 7.5 9 4-1.5 7.5-4 7.5-9V6Z" />
    </svg>
  )
}

export function IconBook({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  )
}

export function IconQuestion({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.9" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4.5v15l13-7.5Z" />
    </svg>
  )
}

export function IconDice({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" />
    </svg>
  )
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h11" />
    </svg>
  )
}
