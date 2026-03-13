export function Skeleton({
  width = "100%",
  height = 12,
  className = "",
}: Readonly<{
  width?: string | number;
  height?: number;
  className?: string;
}>) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    />
  );
}

export default Skeleton;
