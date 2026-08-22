export default function CirclesLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}