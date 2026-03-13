export function AuthStatusSkeleton() {
  return (
    <div
      className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
      aria-label="Loading authentication status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
