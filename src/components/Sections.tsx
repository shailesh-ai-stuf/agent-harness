import type { CSSProperties, ReactNode } from "react";
import {
  CHECKLIST,
  COST_BEHAVIORS,
  COST_TIERS,
  DECISIONS,
  FILE_TREE,
  ROADMAP,
  SUPPORT,
  type TreeNode,
} from "../data/guide";
import { useCopy, useCountUp, useLocalStorage, useReveal } from "../lib/hooks";
import { downloadGuide } from "../lib/markdown";
import { Reveal, cn } from "./Blocks";

const VAR = {
  mint: "var(--color-mint)",
  skyx: "var(--color-skyx)",
  route: "var(--color-route)",
  flare: "var(--color-flare)",
} as const;

/* ================================================================== */
/*  package ledger                                                     */
/* ================================================================== */

const PACKAGES = [
  {
    name: "core",
    path: "packages/core",
    color: VAR.route,
    desc: "Type definitions, the criticality-aware LLM router, and the plan → execute → review → correct orchestration loop.",
    exports: "Orchestrator · routeTask · core types",
  },
  {
    name: "registry",
    path: "packages/registry",
    color: VAR.mint,
    desc: "Reads agent YAML files and skill Markdown with frontmatter, validates with Zod, returns typed configs.",
    exports: "loadAgents · loadSkills",
  },
  {
    name: "infra",
    path: "packages/infra",
    color: VAR.skyx,
    desc: "One-call OpenTelemetry bootstrap — OTLP exporter, auto-instrumentations, graceful shutdown.",
    exports: "initTelemetry · shutdownTelemetry",
  },
];

export function PackageLedger() {
  return (
    <Reveal className="mt-8">
      <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-mist-600">
        workspace packages — 03
      </p>
      <div className="border-b border-ink-700">
        {PACKAGES.map((p) => (
          <article
            key={p.name}
            className="group relative grid gap-x-8 gap-y-1.5 border-t border-ink-700 py-5 pl-4 transition-colors duration-300 hover:bg-ink-900/70 md:grid-cols-[minmax(170px,230px)_1fr] md:pl-6"
          >
            <span
              className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
              style={{ background: p.color }}
            />
            <div>
              <h3 className="font-display text-[1.5rem] font-bold leading-none text-mist-100">
                @agent-harness/<span style={{ color: p.color }}>{p.name}</span>
              </h3>
              <p className="mt-2 font-mono text-[11px] text-mist-600">{p.path}</p>
            </div>
            <div className="flex flex-col justify-center gap-1.5">
              <p className="text-sm leading-relaxed text-mist-400">{p.desc}</p>
              <p className="font-mono text-[11px] tracking-wide" style={{ color: p.color }}>
                ↳ exports: {p.exports}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  prerequisites                                                      */
/* ================================================================== */

function ToolIcon({ d, extra }: { d: string; extra?: ReactNode }) {
  return (
    <svg width="19" height="19" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {extra}
    </svg>
  );
}

const PREREQS = [
  {
    name: "Node.js",
    req: "version 20 or higher",
    icon: <ToolIcon d="M8 1.7 13.6 5v6L8 14.3 2.4 11V5Z" extra={<circle cx="8" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.4" />} />,
  },
  {
    name: "pnpm",
    req: "9+ · npm i -g pnpm",
    icon: <ToolIcon d="M2.5 5.5 8 2.7l5.5 2.8v5L8 13.3l-5.5-2.8Z M2.5 5.5 8 8.3l5.5-2.8 M8 8.3v5" />,
  },
  {
    name: "Git",
    req: "latest version",
    icon: <ToolIcon d="M5 3.5v6.2 M5 9.7c0 1.5 1.3 2.3 3 2.3h1.5 M5 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z M13.5 6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z M13.5 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z M11.5 8v2" />,
  },
  {
    name: "Code editor",
    req: "VS Code recommended",
    icon: <ToolIcon d="M2.5 13.5h11 M11.8 2.9l1.3 1.3-7.3 7.3-1.8.5.5-1.8Z" />,
  },
  {
    name: "LLM API keys",
    req: "OpenAI · Anthropic · Google — at least one",
    icon: <ToolIcon d="M7.2 8.8 13.5 2.5 M11 5l1.8 1.8 M9 7l1.3 1.3 M7.5 5.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z M5.5 10.5 3.5 12.5 4.5 13.5" />,
  },
];

export function PrereqGrid() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {PREREQS.map((p, i) => (
        <Reveal key={p.name} delay={i * 70} className={cn(i === PREREQS.length - 1 && "sm:col-span-2")}>
          <div className="group flex h-full items-center gap-4 rounded-lg border border-ink-700 bg-ink-900/60 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-500">
            <span className="shrink-0 text-mist-500 transition-colors duration-200 group-hover:text-route">{p.icon}</span>
            <span className="text-[15px] font-semibold text-mist-100">{p.name}</span>
            <span className="ml-auto text-right font-mono text-[10.5px] leading-relaxed text-mist-500">{p.req}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  file tree                                                          */
/* ================================================================== */

function flatten(node: TreeNode, depth: number, out: { node: TreeNode; depth: number }[] = []) {
  out.push({ node, depth });
  for (const child of node.children ?? []) flatten(child, depth + 1, out);
  return out;
}

export function FileTreeView() {
  const rows = flatten(FILE_TREE, 0);
  return (
    <Reveal className="mt-6">
      <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/70">
        <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850 px-4 py-2.5">
          <span className="font-mono text-[11px] text-mist-400">$ tree agent-harness —L 3</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-mist-600 sm:inline">
            hover for annotations
          </span>
        </div>
        <div className="p-4 md:p-5">
          {rows.map(({ node, depth }, i) => (
            <div
              key={i}
              className="group/row flex items-baseline gap-2.5 rounded px-1.5 py-[3.5px] transition-colors duration-150 hover:bg-ink-800/70"
              style={{ paddingLeft: `${depth * 20 + 6}px` }}
            >
              {node.kind === "dir" ? (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 self-center text-route/80">
                  <path d="M1.8 4.2c0-.7.5-1.2 1.2-1.2h3l1.4 1.6h5.6c.7 0 1.2.5 1.2 1.2v6c0 .7-.5 1.2-1.2 1.2H3c-.7 0-1.2-.5-1.2-1.2Z" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 self-center text-mist-600">
                  <path d="M3.5 1.8h6l3 3v9.4h-9Z M9.5 1.8v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              )}
              <span
                className={cn(
                  "font-mono text-[12.5px]",
                  node.kind === "dir" ? "font-semibold text-mist-100" : "text-mist-300",
                )}
              >
                {node.name}
              </span>
              {node.note && (
                <span className="ml-auto hidden truncate pl-4 font-mono text-[10.5px] text-mist-600 opacity-70 transition-all duration-200 group-hover/row:text-mist-400 group-hover/row:opacity-100 md:inline">
                  {node.note}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  interactive verification checklist                                 */
/* ================================================================== */

function CheckRow({
  item,
  checked,
  onToggle,
}: {
  item: (typeof CHECKLIST)[number];
  checked: boolean;
  onToggle: () => void;
}) {
  const [copied, copy] = useCopy(1200);
  return (
    <li
      className={cn(
        "flex items-center gap-3.5 rounded-lg border px-4 py-3 transition-all duration-200",
        checked ? "border-mint/40 bg-mint/[0.04]" : "border-ink-700 bg-ink-900/50 hover:border-ink-500",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className="group flex flex-1 items-center gap-3.5 text-left"
      >
        <span
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-200",
            checked ? "border-mint bg-mint text-ink-950" : "border-ink-500 group-hover:border-mint/70",
          )}
        >
          {checked && (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="m3 8.5 3.2 3.2L13 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span
          className={cn(
            "text-[14px] leading-snug transition-all duration-200",
            checked ? "text-mist-500 line-through decoration-mint/50" : "text-mist-200",
          )}
        >
          {item.label}
        </span>
      </button>
      <button
        type="button"
        onClick={() => copy(item.cmd)}
        title="Copy command"
        className={cn(
          "hidden shrink-0 rounded-md border px-2.5 py-1 font-mono text-[10.5px] transition-all duration-200 sm:block",
          copied ? "border-mint/60 text-mint" : "border-ink-600 text-mist-500 hover:border-mist-500 hover:text-mist-200",
        )}
      >
        {copied ? "✓ copied" : `$ ${item.cmd}`}
      </button>
    </li>
  );
}

export function ChecklistView() {
  const [state, setState] = useLocalStorage<Record<string, boolean>>("ah-checklist-v1", {});
  const done = CHECKLIST.filter((c) => state[c.id]).length;
  const pct = Math.round((done / CHECKLIST.length) * 100);

  return (
    <Reveal className="mt-6">
      <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-mist-600">verification — persisted locally</p>
            <p className="mt-1.5 font-display text-[1.9rem] font-bold leading-none text-mist-100">
              {done}
              <span className="text-mist-500">/{CHECKLIST.length}</span> <span className="text-mint">verified</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setState({})}
            className="rounded-md border border-ink-600 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-500 transition-colors duration-200 hover:border-flare/70 hover:text-flare"
          >
            reset
          </button>
        </div>

        <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-ink-800">
          <div className="bar-anim h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
        </div>

        <ul className="mt-5 space-y-2.5">
          {CHECKLIST.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              checked={!!state[item.id]}
              onToggle={() => setState((s) => ({ ...s, [item.id]: !s[item.id] }))}
            />
          ))}
        </ul>

        {done === CHECKLIST.length && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-mint/50 bg-mint/10 px-4 py-3.5">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-mint">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="m5.2 8.2 2 2 3.6-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-mint">
              all seven boxes ticked — the harness is initialized. on to phase 2.
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  design decisions                                                   */
/* ================================================================== */

export function DecisionsView() {
  return (
    <Reveal className="mt-6">
      <div className="overflow-hidden rounded-xl border border-ink-700">
        <div className="hidden grid-cols-[46px_175px_200px_1fr] gap-4 bg-ink-850 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500 md:grid">
          {DECISIONS.head.map((h, i) => (
            <span key={h}>{i === 0 ? <>&nbsp;{h}</> : h}</span>
          ))}
          <span>&nbsp;</span>
        </div>
        {DECISIONS.rows.map((row, i) => (
          <div
            key={row[0]}
            className="group grid grid-cols-[46px_1fr] gap-x-4 gap-y-1 border-t border-ink-700/70 px-5 py-3.5 transition-colors duration-150 first:border-t-0 hover:bg-ink-900/80 md:grid-cols-[46px_175px_200px_1fr] md:items-baseline"
          >
            <span className="font-mono text-[11px] text-mist-600">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-display text-[15.5px] font-bold text-mist-100">{row[0]}</span>
            <span className="col-start-2 font-mono text-[12px] text-mint md:col-start-auto">{row[1]}</span>
            <span className="col-span-2 col-start-1 text-[13px] leading-relaxed text-mist-400 md:col-span-1 md:col-start-auto">
              {row[2]}
            </span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  cost optimization                                                  */
/* ================================================================== */

export function CostView() {
  const { ref, shown } = useReveal();
  const lo = useCountUp(40, shown);
  const hi = useCountUp(60, shown);

  return (
    <div ref={ref} className={cn("rv mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]", shown && "in")}>
      <div className="rounded-xl border border-ink-700 bg-ink-900/50 px-5 py-2 md:px-6">
        {COST_TIERS.map((tier) => (
          <div key={tier.criticality} className="group border-t border-ink-700 py-4 first:border-t-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-display text-[1.35rem] font-bold leading-none" style={{ color: VAR[tier.color] }}>
                {tier.criticality}
              </p>
              <p className="font-mono text-[12px] text-mist-300">
                {tier.model}
                <span className="ml-2.5 font-semibold" style={{ color: VAR[tier.color] }}>
                  {"$".repeat(tier.glyph)}
                </span>
                <span className="text-ink-500">{"$".repeat(4 - tier.glyph)}</span>
              </p>
            </div>
            <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-ink-800">
              <div
                className="bar-anim h-full rounded-full opacity-85 transition-opacity group-hover:opacity-100"
                style={{ width: shown ? `${tier.width}%` : "0%", background: VAR[tier.color] }}
              />
            </div>
          </div>
        ))}
        <p className="border-t border-ink-700 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist-600">
          relative cost per 1k routed tasks
        </p>
      </div>

      <div className="flex flex-col rounded-xl border border-ink-700 bg-ink-900/50 p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-mist-600">typical LLM spend reduction</p>
        <p className="mt-4 font-display text-[3.6rem] font-extrabold leading-none tracking-tight text-mist-100">
          {lo}
          <span className="text-mist-500">–</span>
          {hi}
          <span className="text-route">%</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist-400">
          compared to running every task on a single high-tier model.
        </p>
        <ul className="mt-6 space-y-3 border-t border-ink-700 pt-5">
          {COST_BEHAVIORS.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-mist-300">
              <span className="mt-[2px] font-mono text-[11px] font-semibold text-mint">{String(i + 1).padStart(2, "0")}</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  roadmap                                                            */
/* ================================================================== */

export function RoadmapView() {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {ROADMAP.map((phase, i) => (
        <Reveal key={phase.phase} delay={(i % 2) * 90}>
          <article
            className="group h-full rounded-lg border border-ink-700 bg-ink-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-(--pc)"
            style={{ "--pc": VAR[phase.color] } as CSSProperties}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: VAR[phase.color], borderColor: `color-mix(in srgb, ${VAR[phase.color]} 45%, transparent)` }}
              >
                {phase.phase}
              </span>
              <span className="h-[8px] w-[8px] rotate-45 transition-transform duration-300 group-hover:rotate-[225deg]" style={{ background: VAR[phase.color] }} />
            </div>
            <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-tight text-mist-100">{phase.title}</h3>
            <ul className="mt-3.5 space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-mist-400">
                  <span aria-hidden className="shrink-0 font-mono font-semibold" style={{ color: VAR[phase.color] }}>
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  support + license + footer                                         */
/* ================================================================== */

const SUPPORT_ICONS: ReactNode[] = [
  <ToolIcon key="i" d="M8 5.2V8.4 M8 10.8v.1 M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Z" />,
  <ToolIcon key="u" d="M13.2 8A5.2 5.2 0 1 1 11.6 4.2 M13.4 1.8v2.9h-2.9" />,
  <ToolIcon key="m" d="M1.8 8h2.6l1.6-4 2.6 8 1.8-5.4 1 1.4h2.8" />,
  <ToolIcon key="b" d="M2.5 5.5 8 2.7l5.5 2.8v5L8 13.3l-5.5-2.8Z M2.5 5.5 8 8.3l5.5-2.8 M8 8.3v5" />,
];

export function SupportView() {
  return (
    <Reveal className="mt-6">
      <div className="grid gap-3.5 sm:grid-cols-2">
        {SUPPORT.map((s, i) => (
          <div
            key={s.title}
            className="group rounded-lg border border-ink-700 bg-ink-900/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-route/60"
          >
            <p className="flex items-center gap-2.5 font-display text-[1.15rem] font-bold text-mist-100">
              <span className="text-mist-500 transition-colors duration-200 group-hover:text-route">{SUPPORT_ICONS[i]}</span>
              {s.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-ink-700 bg-ink-900/60 px-5 py-4.5 sm:flex-row sm:items-center md:px-6">
        <div>
          <p className="font-display text-[1.25rem] font-bold text-mist-100">
            MIT License <span className="text-route">◆</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-mist-500">see the LICENSE file for details</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadGuide}
            className="rounded-md border border-route/50 bg-route/10 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-route transition-all duration-200 hover:bg-route hover:text-ink-950"
          >
            download .md
          </button>
          <a
            href="#top"
            className="rounded-md border border-ink-600 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-400 transition-all duration-200 hover:border-mint/70 hover:text-mint"
          >
            back to top ↑
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-700/80 py-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="font-mono text-[11px] leading-relaxed text-mist-600">
          AGENT HARNESS · build guide v1.0 —
          <br className="md:hidden" /> a single source of truth for humans &amp; AI coders alike.
        </p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist-600">
          pnpm · tsup · biome · vitest · otel
        </p>
      </div>
    </footer>
  );
}
