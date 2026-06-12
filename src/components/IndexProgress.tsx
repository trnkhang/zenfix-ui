interface Props {
  chunksIndexed: number
  filesTotal: number
  filesDone: number
  isActive: boolean
}

export function IndexProgress({ chunksIndexed, filesTotal, filesDone, isActive }: Props) {
  if (!isActive && chunksIndexed === 0) return null

  const hasTotals = filesTotal > 0
  const pct = hasTotals ? Math.round((filesDone / filesTotal) * 100) : 0

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between text-xs text-on-surface-variant">
        {isActive ? (
          hasTotals ? (
            <span>{filesDone.toLocaleString()} / {filesTotal.toLocaleString()} files</span>
          ) : (
            <span>Indexing…</span>
          )
        ) : (
          <span>Indexed</span>
        )}
        <span className="font-mono">{chunksIndexed.toLocaleString()} chunks</span>
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-container">
        {isActive ? (
          hasTotals ? (
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          ) : (
            <div className="animate-indeterminate absolute h-full rounded-full bg-primary" />
          )
        ) : (
          <div className="h-full w-full rounded-full bg-green-500" />
        )}
      </div>

      {isActive && hasTotals && (
        <p className="text-right text-xs text-on-surface-variant">{pct}%</p>
      )}
    </div>
  )
}
