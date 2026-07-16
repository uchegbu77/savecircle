import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-emerald-600"
        >
          SaveCircle
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-3 sm:gap-5"
        >
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600"
          >
            Home
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}