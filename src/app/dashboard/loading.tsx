export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl animate-pulse">
        <div className="h-8 w-64 rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="h-96 rounded-2xl border border-slate-200 bg-white" />

          <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </main>
  );
}