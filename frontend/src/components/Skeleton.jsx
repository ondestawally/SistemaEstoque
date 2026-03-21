export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded w-1/4"></div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-100 rounded w-full"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-slate-100 rounded w-1/2"></div>
        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}