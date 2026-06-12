function Block({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton rounded-lg ${className ?? ''}`} style={style} />
}

export function RepoCardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      <div className="flex items-start gap-3 mb-4">
        <Block className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1">
          <Block className="h-4 w-36 rounded-md" />
          <Block className="mt-1.5 h-3 w-20 rounded-md" />
        </div>
        <Block className="h-7 w-7 rounded-lg" />
      </div>
      <div className="border-t border-outline-variant/30 pt-4 flex items-center gap-2">
        <Block className="h-5 w-16 rounded" />
        <Block className="ml-auto h-5 w-20 rounded-full" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between">
          <Block className="h-3 w-16" />
          <Block className="h-3 w-20" />
        </div>
        <Block className="h-1.5 w-full rounded-full" />
      </div>
      <Block className="mt-3 h-3 w-36" />
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Block className="h-4 w-4 shrink-0 rounded" />
            <Block className="h-5 w-20 rounded-md" />
            <Block className="h-4 w-32 rounded-md" />
          </div>
          <Block className="mt-2 h-4 w-64 rounded-md" />
        </div>
        <Block className="h-7 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2 rounded-lg bg-surface-container-low p-3">
        {[80, 60, 72].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Block className="h-4 w-4 shrink-0 rounded" />
            <Block className="h-4 rounded-md" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-outline-variant/50 pt-3">
        <Block className="h-3 w-32" />
        <Block className="h-3 w-16" />
      </div>
    </div>
  )
}
