import type { CSSProperties, ReactNode } from "react";
import type { Block, GuideSection } from "../data/guide";
import { useReveal } from "../lib/hooks";
import { CodeBlock } from "./CodeBlock";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ---------------- reveal wrapper ---------------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={cn("rv", shown && "in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- block renderer ---------------- */

const CALLOUT_TONE: Record<string, { bar: string; title: string; label: string }> = {
  info: { bar: "var(--color-skyx)", title: "text-skyx", label: "NOTE" },
  warn: { bar: "var(--color-route)", title: "text-route", label: "HEADS UP" },
  tip: { bar: "var(--color-mint)", title: "text-mint", label: "TIP" },
};

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return <p className="my-4 leading-[1.85] text-mist-300 first:mt-0">{block.text}</p>;
    case "list":
      return (
        <ul className="my-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="group/item flex gap-3 leading-[1.7] text-mist-300">
              <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rotate-45 bg-route/80 transition-transform duration-200 group-hover/item:scale-125 group-hover/item:bg-route" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock lang={block.lang} file={block.file} code={block.code} />;
    case "callout": {
      const tone = CALLOUT_TONE[block.tone];
      return (
        <aside
          className="my-5 rounded-r-lg border-l-2 bg-ink-900/70 px-4 py-3.5"
          style={{ borderLeftColor: tone.bar }}
        >
          <p className={cn("font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em]", tone.title)}>
            {tone.label} — {block.title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-400">{block.text}</p>
        </aside>
      );
    }
    case "table":
      return (
        <div className="my-5 overflow-x-auto rounded-lg border border-ink-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-850">
              <tr>
                {block.head.map((h) => (
                  <th key={h} className="border-b border-ink-600 px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-ink-700/60 transition-colors duration-150 last:border-0 hover:bg-ink-800/50">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        "px-4 py-3 align-top",
                        j === 0 && "whitespace-nowrap font-mono text-[12.5px] font-semibold text-mist-100",
                        j > 0 && "text-mist-400",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/* ---------------- section shell ---------------- */

interface SectionProps extends GuideSection {
  extra?: ReactNode;
  style?: CSSProperties;
}

export function Section({ id, num, kicker, title, intro, blocks, extra }: SectionProps) {
  const { ref, shown } = useReveal();
  return (
    <section id={id} ref={ref} className={cn("relative scroll-mt-28 pt-16 md:pt-24", shown && "in")}>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 right-0 hidden select-none font-display text-[6.2rem] font-extrabold leading-none text-ink-800 md:block"
      >
        {num}
      </span>

      <Reveal>
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.26em] text-route">
          <span className="inline-block h-[6px] w-[6px] rotate-45 bg-route" />
          {kicker}
        </p>
      </Reveal>

      <h2 className="lm mt-3 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-mist-100 md:text-[2.7rem]">
        <span>{title}</span>
      </h2>

      {intro && (
        <Reveal delay={90}>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-8 text-mist-400">{intro}</p>
        </Reveal>
      )}

      <div className="mt-5">
        {blocks.map((block, i) => (
          <Reveal key={i} delay={Math.min(i * 60, 240)}>
            <BlockView block={block} />
          </Reveal>
        ))}
      </div>

      {extra}
    </section>
  );
}
