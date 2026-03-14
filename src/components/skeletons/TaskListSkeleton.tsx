export function TaskListSkeleton() {
  return (
    <div
      className="animate-pulse space-y-3"
      aria-label="Loading tasks"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
      <span className="sr-only">Loading tasks...</span>
    </div>
  );
}
