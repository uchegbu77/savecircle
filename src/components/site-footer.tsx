import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} SaveCircle. All rights reserved.
        </p>

        <nav aria-label="Footer navigation" className="flex gap-5">
          <Link href="/" className="hover:text-emerald-600">
            Privacy
          </Link>

          <Link href="/" className="hover:text-emerald-600">
            Terms
          </Link>

          <Link href="/" className="hover:text-emerald-600">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}