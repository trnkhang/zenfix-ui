interface Props {
  chunksIndexed: number
  isActive: boolean
}

export function IndexProgress({ chunksIndexed, isActive }: Props) {
  if (!isActive && chunksIndexed === 0) return null

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{isActive ? 'Indexing…' : 'Indexed'}</span>
        <span>{chunksIndexed.toLocaleString()} chunks</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-100">
        {isActive ? (
          <div className="animate-indeterminate absolute h-full rounded-full bg-blue-400" />
        ) : (
          <div className="h-full w-full rounded-full bg-emerald-400" />
        )}
      </div>
    </div>
  )
}
