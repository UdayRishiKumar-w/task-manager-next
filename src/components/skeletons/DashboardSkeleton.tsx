export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading dashboard">
      <div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
