export function TaskFormSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading form">
      <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
      <span className="sr-only">Loading form...</span>
    </div>
  );
}
