import type { ReactNode } from 'react'

interface Props {
  title: string
  description: string
  icon: ReactNode
}

export function PlaceholderPage({ title, description, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-3xl text-on-surface-variant">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-on-background" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
        {title}
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </div>
  )
}
