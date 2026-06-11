function Block({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton rounded-lg ${className ?? ''}`} style={style} />
}

export function RepoCardSkeleton() {
  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{
        border: '1px solid oklch(0.91 0.012 264)',
        boxShadow: '0 1px 4px oklch(0 0 0 / 4%)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Block className="h-8 w-8 shrink-0 rounded-lg" />
            <Block className="h-4 w-40 rounded-md" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Block className="h-5 w-16 rounded-md" />
            <Block className="h-5 w-12 rounded-md" />
          </div>
        </div>
        <Block className="h-6 w-20 rounded-full" />
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between">
          <Block className="h-3 w-16" />
          <Block className="h-3 w-20" />
        </div>
        <Block className="h-2 w-full rounded-full" />
      </div>

      <div
        className="mt-4 flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid oklch(0.93 0.01 264)' }}
      >
        <Block className="h-3 w-36" />
        <div className="flex gap-2">
          <Block className="h-7 w-16 rounded-lg" />
          <Block className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{
        border: '1px solid oklch(0.91 0.012 264)',
        boxShadow: '0 1px 4px oklch(0 0 0 / 4%)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Block className="h-8 w-8 shrink-0 rounded-lg" />
            <Block className="h-5 w-20 rounded-md" />
            <Block className="h-4 w-32 rounded-md" />
          </div>
          <Block className="mt-2 h-4 w-64 rounded-md" />
        </div>
        <Block className="h-7 w-20 rounded-full" />
      </div>

      <div
        className="mt-4 space-y-2 rounded-xl p-3"
        style={{ background: 'oklch(0.975 0.005 264)' }}
      >
        {[80, 60, 72].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Block className="h-4 w-4 shrink-0 rounded" />
            <Block className={`h-4 rounded-md`} style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>

      <div
        className="mt-3 flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid oklch(0.93 0.01 264)' }}
      >
        <Block className="h-3 w-32" />
        <Block className="h-3 w-16" />
      </div>
    </div>
  )
}
