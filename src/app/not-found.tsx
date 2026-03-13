import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="mx-auto max-w-2xl rounded bg-white p-6 text-center shadow dark:bg-gray-800"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <h1 id="not-found-heading" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        404 - Page not found
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block cursor-pointer text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-blue-400"
        aria-label="Return to home page"
      >
        Return to home
      </Link>
    </main>
  );
}
