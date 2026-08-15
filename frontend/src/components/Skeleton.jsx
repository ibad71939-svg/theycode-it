// Content-shaped loading placeholders. Prefer these over LoadingSpinner
// whenever the final layout is already known (a grid of cards, a table,
// a row of stat tiles) — it keeps the page from "jumping" once real data
// arrives, and reads as noticeably more polished than a centered spinner.

export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <SkeletonBlock className="w-11 h-11 rounded-xl mb-4" />
      <SkeletonBlock className="h-4 w-3/4 mb-2" />
      <SkeletonBlock className="h-3 w-full mb-1.5" />
      <SkeletonBlock className="h-3 w-5/6" />
    </div>
  );
}

export function SkeletonCardGrid({ count = 6, className = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="stat-card">
      <SkeletonBlock className="h-3 w-20 mb-3" />
      <SkeletonBlock className="h-7 w-16" />
    </div>
  );
}

export function SkeletonStatRow({ count = 4 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 6, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3">
              <SkeletonBlock className="h-3.5 w-full max-w-[10rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}