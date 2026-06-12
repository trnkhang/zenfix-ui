interface Props {
  size?: number
  className?: string
}

/* Zenfix mark — rounded cyan square with a bold stroke Z */
export function ZenfixMark({ size = 32, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Zenfix"
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#0891B2" />

      {/* Z — single continuous stroked path: top bar → diagonal → bottom bar */}
      <path
        d="M8 9.5h16L8 22.5h16"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />

      {/* Lightning bolt accent — tiny highlight on the diagonal midpoint */}
      <path
        d="M17.5 14.5 L15 17.5 h1.8 L14.5 21 l4-5h-1.8z"
        fill="#A5F3FC"
        opacity="0.85"
      />
    </svg>
  )
}
