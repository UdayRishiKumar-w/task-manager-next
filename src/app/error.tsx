"use client";

export default function RootError({ error, reset }: Readonly<{ error: Error; reset: () => void }>) {
  const showDetails = process.env.NODE_ENV !== "production";

  return (
    <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
      <h2 className="text-2xl font-semibold text-red-600">Something went wrong</h2>
      {showDetails ? (
        <pre className="mt-4 text-sm text-slate-700">{error.message}</pre>
      ) : (
        <p className="mt-4 text-sm text-slate-700">An unexpected error occurred. Please try again later.</p>
      )}
      <button onClick={reset} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Try again
      </button>
    </div>
  );
}
