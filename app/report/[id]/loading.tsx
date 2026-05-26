export default function PublicReportLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_42%,#fbfbfd_100%)] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-44 animate-pulse rounded-2xl bg-white/80" />
          <div className="hidden h-10 w-64 animate-pulse rounded-2xl bg-white/80 md:block" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-sm md:p-8">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-8 h-12 max-w-3xl animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-4 h-5 max-w-xl animate-pulse rounded-full bg-slate-200" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>

          <div className="min-h-[420px] animate-pulse rounded-[36px] bg-slate-900/90" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[28px] bg-white/80"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-[32px] bg-white/80" />
          <div className="h-96 animate-pulse rounded-[32px] bg-white/80" />
        </div>
      </div>
    </main>
  );
}
