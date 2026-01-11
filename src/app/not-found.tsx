import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded bg-white p-6 text-center shadow">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Return to home
      </Link>
    </div>
  );
}
