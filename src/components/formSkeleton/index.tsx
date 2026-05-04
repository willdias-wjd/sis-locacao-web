export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, row) => (
        <div key={row} className="grid grid-cols-2 gap-4">
          {Array.from({ length: row === 5 ? 1 : 2 }).map((_, col) => (
            <div key={col} className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}