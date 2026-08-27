import type { ReactNode } from "react";
import { useCopy } from "../lib/hooks";

/* ------------------------------------------------------------------ */
/*  tiny regex tokenizer — just enough color to read like an editor    */
/* ------------------------------------------------------------------ */

interface Spec {
  rx: RegExp;
  /** class per capture group (index 0 → group 1) */
  cls: string[];
}

const C = {
  comment: "italic text-mist-500",
  string: "text-mint",
  kw: "text-route",
  num: "text-flare",
  key: "text-skyx",
  prompt: "font-semibold text-mint",
  flag: "text-skyx",
};

const SPECS: Record<string, Spec> = {
  ts: {
    rx: /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|let|var|await|async|for|of|in|new|return|type|interface|extends|if|else|void|function)\b|(\b\d+(?:\.\d+)?\b)/g,
    cls: [C.comment, C.string, C.kw, C.num],
  },
  json: {
    rx: /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g,
    cls: [C.key, C.string, C.num, C.num],
  },
  yaml: {
    rx: /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'])*')|(^[ \t]*(?:-[ \t]+)?[\w$./-]+(?=[ \t]*:))|(\b(?:true|false|null)\b)|(\b\d+(?:\.\d+)?\b)/gm,
    cls: [C.comment, C.string, C.key, C.num, C.num],
  },
  bash: {
    rx: /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'[^']*')|(^\$[ \t]?)|( --?[A-Za-z][\w-]*)/gm,
    cls: [C.comment, C.string, C.prompt, C.flag],
  },
  md: {
    rx: /(^---[ \t]*$)|(^[ \t]*(?:-[ \t]+)?[\w]+(?=[ \t]*:))|("(?:[^"])*"|'[^']*')|(^[ \t]*#{1,3}[^\n]*)/gm,
    cls: [C.comment, C.key, C.string, C.kw],
  },
};

function tokenize(code: string, lang: string): ReactNode[] {
  const spec = SPECS[lang];
  if (!spec) return [code];
  const rx = new RegExp(spec.rx.source, spec.rx.flags);
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    let cls = "";
    for (let g = 1; g < m.length; g++) {
      if (m[g] !== undefined) {
        cls = spec.cls[g - 1] ?? "";
        break;
      }
    }
    out.push(
      cls ? (
        <span key={out.length} className={cls}>
          {m[0]}
        </span>
      ) : (
        m[0]
      ),
    );
    last = m.index + m[0].length;
    if (m[0].length === 0) rx.lastIndex += 1;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

/* ------------------------------------------------------------------ */
/*  component                                                          */
/* ------------------------------------------------------------------ */

const ACCENT: Record<string, string> = {
  ts: "var(--color-route)",
  json: "var(--color-skyx)",
  yaml: "var(--color-mint)",
  bash: "var(--color-ink-500)",
  md: "var(--color-flare)",
};

export function CodeBlock({ lang, file, code }: { lang: string; file?: string; code: string }) {
  const [copied, copy] = useCopy();
  return (
    <figure
      className="group/cb relative my-5 overflow-hidden rounded-lg border border-ink-700 bg-ink-900/85 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.9)] transition-colors duration-300 hover:border-ink-500"
      style={{ boxShadow: `inset 2px 0 0 ${ACCENT[lang] ?? "var(--color-ink-500)"}` }}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-ink-700/70 bg-ink-850 px-4 py-2">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-mist-400">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-mist-500">
            <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{file ?? lang}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist-500">
            {lang}
          </span>
          <button
            type="button"
            onClick={() => copy(code)}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 ${
              copied
                ? "border-mint/60 bg-mint/10 text-mint"
                : "border-ink-600 text-mist-500 hover:border-mist-500 hover:text-mist-200"
            }`}
            aria-label="Copy code"
          >
            {copied ? (
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="m3 8.5 3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
            {copied ? "copied" : "copy"}
          </button>
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7] text-mist-200">
        <code>{tokenize(code, lang)}</code>
      </pre>
    </figure>
  );
}
