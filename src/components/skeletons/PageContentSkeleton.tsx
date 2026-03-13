export function PageContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Loading page content">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-32 rounded bg-gray-200 dark:bg-gray-700" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
