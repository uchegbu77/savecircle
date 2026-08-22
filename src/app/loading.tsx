export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
          aria-hidden="true"
        />

        <p className="mt-4 font-semibold text-slate-700">
          Loading SaveCircle...
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Preparing your savings information.
        </p>
      </div>
    </div>
  );
}