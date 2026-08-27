import { useProgress } from "../lib/hooks";
import { downloadGuide } from "../lib/markdown";

export function TopBar() {
  const p = useProgress();
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-ink-700/70 bg-ink-950/88 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className="transition-transform duration-300 group-hover:rotate-90">
            <path d="M11 2 20 11 11 20 2 11Z" stroke="var(--color-route)" strokeWidth="1.8" />
            <circle cx="11" cy="11" r="2.6" fill="var(--color-mint)" />
          </svg>
          <span className="font-mono text-[13.5px] font-semibold tracking-tight text-mist-100">agent-harness</span>
          <span className="hidden rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-mist-500 sm:inline">
            build guide
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist-600 md:inline">
            {Math.round(p * 100)}% read
          </span>
          <button
            type="button"
            onClick={downloadGuide}
            className="flex items-center gap-2 rounded-md border border-ink-600 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-400 transition-all duration-200 hover:border-route hover:text-route"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">get .md</span>
          </button>
        </div>
      </div>
      <div
        className="absolute bottom-[-1px] left-0 h-[2px] transition-[width] duration-150 ease-out"
        style={{
          width: `${p * 100}%`,
          background: "linear-gradient(90deg, var(--color-route), var(--color-mint) 55%, var(--color-skyx))",
        }}
      />
    </div>
  );
}
