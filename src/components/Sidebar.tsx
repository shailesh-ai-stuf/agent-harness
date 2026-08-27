import { NAV } from "../data/guide";
import { downloadGuide } from "../lib/markdown";

interface Props {
  active: string;
}

export function Sidebar({ active }: Props) {
  return (
    <aside className="hidden lg:block">
      <nav aria-label="Guide contents" className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-10 pr-3">
        {NAV.map((group) => (
          <div key={group.label} className="mt-8 first:mt-0">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-mist-600">{group.label}</p>
            <ul>
              {group.items.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`group flex items-baseline gap-2.5 border-l py-[7px] pl-3.5 text-[13px] leading-snug transition-all duration-200 ${
                        isActive
                          ? "border-route bg-ink-800/50 font-medium text-mist-100"
                          : "border-ink-700 text-mist-500 hover:border-ink-500 hover:text-mist-200"
                      }`}
                    >
                      <span
                        className={`font-mono text-[9.5px] tracking-wider ${
                          isActive ? "text-route" : "text-mist-600 group-hover:text-mist-400"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-10 rounded-lg border border-ink-700 bg-ink-900/70 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-600">Offline copy</p>
          <p className="mt-2 text-[12.5px] leading-5 text-mist-400">
            The whole guide as one Markdown file — drop it into your repo or feed it to your AI coder.
          </p>
          <button
            type="button"
            onClick={downloadGuide}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-route/50 bg-route/10 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-route transition-all duration-200 hover:bg-route hover:text-ink-950"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            agent-harness-build-guide.md
          </button>
        </div>
      </nav>
    </aside>
  );
}

export function MobileNav({ active }: Props) {
  const all = NAV.flatMap((g) => g.items);
  return (
    <div className="sticky top-14 z-40 -mx-5 border-b border-ink-700/70 bg-ink-950/92 px-5 backdrop-blur-md md:-mx-8 md:px-8 lg:hidden">
      <div className="flex gap-2 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {all.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10.5px] transition-colors duration-200 ${
                isActive
                  ? "border-route/70 bg-route/10 text-route"
                  : "border-ink-600 text-mist-500 hover:border-ink-500 hover:text-mist-300"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
