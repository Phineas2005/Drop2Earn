type BrandedLoaderProps = {
  message: string;
  detail?: string;
};

export function BrandedLoader({ message, detail }: BrandedLoaderProps) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-100/70 blur-3xl dark:bg-green-900/20" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl dark:bg-emerald-900/20" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-[2rem] border border-green-200 bg-white/70 shadow-xl shadow-green-950/5 dark:border-green-800/60 dark:bg-slate-900/70" />
          <span className="absolute inset-[-10px] rounded-[2.35rem] border border-dashed border-green-300/80 motion-safe:animate-[spin_12s_linear_infinite] dark:border-green-700/70" />
          <span className="absolute inset-[-19px] rounded-[2.7rem] border border-green-200/50 dark:border-green-900/60" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-3xl font-bold text-white shadow-lg shadow-green-600/25">
            D
          </span>
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-gray-50 bg-emerald-400 text-white dark:border-[#0b1220]">
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5l5 5-5 5" />
            </svg>
          </span>
        </div>

        <p className="mt-12 text-xs font-bold uppercase tracking-[0.28em] text-green-700 dark:text-green-300">
          Drop2Earn
        </p>
        <h1 className="branded-loader-title mt-3 text-xl font-semibold tracking-tight">
          {message}
        </h1>
        {detail && (
          <p className="branded-loader-detail mt-2 max-w-xs text-sm leading-6">
            {detail}
          </p>
        )}

        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-green-600 motion-safe:animate-[bounce_1.2s_ease-in-out_infinite]" />
          <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-[bounce_1.2s_0.2s_ease-in-out_infinite]" />
          <span className="h-2 w-2 rounded-full bg-green-300 motion-safe:animate-[bounce_1.2s_0.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </main>
  );
}
