// Reusable pager for admin list pages backed by the { data, page, limit,
// total, totalPages } envelope returned by backend/src/routes/admin.js's
// paginate() helper.
export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-muted/10 text-sm">
      <span className="text-muted">
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-line font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/5"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-line font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}