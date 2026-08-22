import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
          404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          The page may have been removed, or you may not
          have access to it.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Go to dashboard
          </Link>

          <Link
            href="/circles"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            My circles
          </Link>
        </div>
      </div>
    </main>
  );
}