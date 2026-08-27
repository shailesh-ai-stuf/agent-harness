import { useEffect, useState, type ReactNode } from "react";
import { TERMINAL_LINES, TICKER } from "../data/guide";
import { downloadGuide } from "../lib/markdown";
import {
  usePrefersReducedMotion,
  useReveal,
  useScramble,
  useTypewriter,
} from "../lib/hooks";

/* ------------------------------------------------------------------ */
/*  orchestration loop diagram                                         */
/* ------------------------------------------------------------------ */

const ORBIT = "M 190 72 a 118 118 0 1 1 -0.1 0";

const NODES: {
  x: number;
  y: number;
  lx: number;
  ly: number;
  label: string;
  color: string;
  icon: ReactNode;
}[] = [
  {
    x: 190,
    y: 72,
    lx: 190,
    ly: 30,
    label: "PLAN",
    color: "var(--color-route)",
    icon: (
      <path d="M8 1.5v3.4M8 11.1v3.4M1.5 8h3.4M11.1 8h3.4M3.4 3.4l2.2 2.2M10.4 10.4l2.2 2.2M12.6 3.4l-2.2 2.2M5.6 10.4l-2.2 2.2" strokeLinecap="round" />
    ),
  },
  {
    x: 308,
    y: 190,
    lx: 348,
    ly: 194,
    label: "EXECUTE",
    color: "var(--color-mint)",
    icon: <path d="M5.2 3.2v9.6L12.8 8z" fill="currentColor" stroke="none" />,
  },
  {
    x: 190,
    y: 308,
    lx: 190,
    ly: 356,
    label: "REVIEW",
    color: "var(--color-skyx)",
    icon: (
      <>
        <circle cx="7" cy="7" r="4.1" />
        <path d="m10.3 10.3 3.7 3.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    x: 72,
    y: 190,
    lx: 32,
    ly: 194,
    label: "CORRECT",
    color: "var(--color-flare)",
    icon: (
      <path d="M13.2 8A5.2 5.2 0 1 1 11.6 4.2M13.4 1.8v2.9h-2.9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

function LoopDiagram() {
  const reduced = usePrefersReducedMotion();
  return (
    <figure className="drift relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900/70 p-4">
      <svg viewBox="0 0 380 380" className="h-auto w-full" role="img" aria-label="Orchestration loop: plan, execute, review, correct">
        {/* ambient rings */}
        <circle cx="190" cy="190" r="158" fill="none" stroke="var(--color-ink-600)" strokeDasharray="2 8" className="spin-slow" />
        <circle cx="190" cy="190" r="118" fill="none" stroke="var(--color-ink-700)" strokeWidth="1" />
        <circle cx="190" cy="190" r="78" fill="none" stroke="var(--color-ink-700)" strokeDasharray="1 6" opacity="0.7" />

        {/* travelling pulse */}
        {!reduced && (
          <g>
            <circle r="10" fill="rgb(255 180 84 / 0.2)">
              <animateMotion dur="9s" repeatCount="indefinite" path={ORBIT} />
            </circle>
            <circle r="4.5" fill="var(--color-route)">
              <animateMotion dur="9s" repeatCount="indefinite" path={ORBIT} />
            </circle>
          </g>
        )}

        {/* center */}
        <circle cx="190" cy="190" r="46" fill="none" stroke="var(--color-route)" opacity="0.45" className="pulse-ring" />
        <circle cx="190" cy="190" r="46" fill="var(--color-ink-850)" stroke="var(--color-ink-600)" />
        <text x="190" y="188" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2" fill="var(--color-mist-300)">
          ORCHESTRATOR
        </text>
        <text x="190" y="203" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="2.5" fill="var(--color-mist-600)">
          LOOP v0.1
        </text>

        {/* phase nodes */}
        {NODES.map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="34" fill="none" stroke={n.color} opacity="0.16" className="node-glow" />
            <circle cx={n.x} cy={n.y} r="27" fill="var(--color-ink-800)" stroke={n.color} strokeWidth="1.5" />
            <g transform={`translate(${n.x - 8} ${n.y - 8})`} stroke={n.color} strokeWidth="1.6" fill="none">
              {n.icon}
            </g>
            <text x={n.lx} y={n.ly} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fontWeight="600" letterSpacing="2.5" fill={n.color}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 flex items-center justify-between border-t border-ink-700/70 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mist-600">
        <span>fig. 01 — orchestration loop</span>
        <span className="hidden sm:inline">re-delegate on review failure</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  terminal                                                           */
/* ------------------------------------------------------------------ */

function lineStyle(line: string): { lead: string; leadColor: string; rest: string } {
  if (line.startsWith("$")) return { lead: "$", leadColor: "text-mint", rest: "text-mist-100" };
  if (line.startsWith("▸")) return { lead: "▸", leadColor: "text-skyx", rest: "text-mist-400" };
  if (line.startsWith("●")) return { lead: "●", leadColor: "text-mint", rest: "text-mist-300" };
  return { lead: "", leadColor: "", rest: "text-mist-300" };
}

function Terminal() {
  const { shown, caretLine } = useTypewriter(TERMINAL_LINES);
  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/85">
      <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-flare/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-route/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint/80" />
        <span className="ml-2 font-mono text-[11px] text-mist-500">harness — first run</span>
      </div>
      <div className="min-h-[212px] px-4 py-3.5 font-mono text-[12px] leading-[1.85] sm:text-[12.5px]">
        {shown.map((line, i) => {
          const s = lineStyle(line);
          const isCaret = i === caretLine;
          return (
            <div key={i} className="whitespace-pre-wrap break-words">
              {s.lead && <span className={`${s.leadColor} mr-1.5`}>{s.lead}</span>}
              <span className={`${s.rest} ${isCaret ? "caret" : ""}`}>{s.lead ? line.slice(2) : line}</span>
            </div>
          );
        })}
        {shown.length === 0 && <div className="caret">&nbsp;</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  masthead                                                           */
/* ------------------------------------------------------------------ */

const CHIPS = ["MIT license", "Node ≥ 20", "pnpm ≥ 9", "ESM only", "TS strict", "OpenTelemetry"];

export function Masthead() {
  const { ref, shown } = useReveal();
  const [phase2, setPhase2] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPhase2(true), 420);
    return () => window.clearTimeout(t);
  }, []);
  const line1 = useScramble("AGENT");
  const line2 = useScramble("HARNESS", phase2);

  return (
    <header ref={ref} className={`rv ${shown ? "in" : ""} relative pt-12 md:pt-16`}>
      <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div>
          <p className="flex items-center gap-2 font-mono text-[12px] text-route">
            <span className="inline-block h-[7px] w-[7px] rotate-45 bg-route" />
            ~/agent-harness · build guide v1.0
            <span className="caret" aria-hidden />
          </p>

          <h1 className="mt-5 font-display text-[clamp(3.4rem,9vw,6.6rem)] font-extrabold leading-[0.88] tracking-tight">
            <span className="block text-mist-100">{line1}</span>
            <span className="block text-transparent" style={{ WebkitTextStroke: "2px var(--color-route)" }}>
              {line2}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-8 text-mist-400">
            A step-by-step blueprint for the <strong className="font-semibold text-mist-200">centralized governance layer</strong> that makes
            GitHub Copilot, Cloud Code, and every other AI tool in your org pull in the same direction —{" "}
            <em className="text-mist-300">plan, delegate, review, self-correct</em> — while the router keeps the LLM bill honest.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span
                key={c}
                className="cursor-default rounded-full border border-ink-600 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-route/70 hover:text-mist-200"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadGuide}
              className="group flex items-center gap-2.5 rounded-md bg-route px-5 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-950 shadow-[0_10px_36px_-12px_rgba(255,180,84,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffc579] active:translate-y-0"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
                <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download the guide (.md)
            </button>
            <a
              href="#step-1"
              className="flex items-center gap-2 rounded-md border border-ink-600 px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-mist-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-mint/70 hover:text-mint"
            >
              Start at step 1
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <LoopDiagram />
          <Terminal />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  ticker                                                             */
/* ------------------------------------------------------------------ */

const TICKER_DOTS = ["bg-route", "bg-mint", "bg-skyx", "bg-flare"];

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative mt-14 overflow-hidden border-y border-ink-700/80 bg-ink-900/55 py-3" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-9">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-9 font-mono text-[11px] uppercase tracking-[0.28em] text-mist-500">
            <span className={`inline-block h-[6px] w-[6px] rotate-45 ${TICKER_DOTS[i % 4]}`} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
