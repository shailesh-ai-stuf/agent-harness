import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------- prefers-reduced-motion ---------------- */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ---------------- scroll reveal ---------------- */

export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

/* ---------------- scrollspy ---------------- */

export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.24;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= probe) current = id;
      }
      const bottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 4;
      if (bottom && ids.length) current = ids[ids.length - 1];
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

/* ---------------- reading progress ---------------- */

export function useProgress(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

/* ---------------- scramble-decode text ---------------- */

const GLYPHS = "▚▞#<>/*+=[]{}—";

export function useScramble(text: string, play = true): string {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced || !play ? text : "");
  useEffect(() => {
    if (reduced || !play) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = Math.max(14, Math.round(text.length * 1.6));
    const id = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor((frame / total) * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || i < settled) s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (frame >= total) {
        setOut(text);
        window.clearInterval(id);
      }
    }, 34);
    return () => window.clearInterval(id);
  }, [text, play, reduced]);
  return out;
}

/* ---------------- typewriter for terminal lines ---------------- */

export function useTypewriter(lines: string[], speed = 22) {
  const reduced = usePrefersReducedMotion();
  const total = lines.reduce((a, l) => a + l.length + 1, 0);
  const [count, setCount] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) {
      setCount(total);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= total) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [total, speed, reduced]);

  const shown: string[] = [];
  let budget = count;
  let caretLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (budget <= 0) break;
    const take = Math.min(lines[i].length, budget);
    shown.push(lines[i].slice(0, take));
    budget -= take + 1;
    caretLine = i;
  }
  return { shown, caretLine, done: count >= total };
}

/* ---------------- count-up ---------------- */

export function useCountUp(target: number, play: boolean, duration = 1100): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const started = useRef(false);
  useEffect(() => {
    if (!play || started.current) return;
    started.current = true;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setValue(Math.round(target * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, target, duration, reduced]);
  return value;
}

/* ---------------- clipboard ---------------- */

export function useCopy(timeout = 1600): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const copy = useCallback(
    (text: string) => {
      const done = () => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), timeout);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    },
    [timeout],
  );
  return [copied, copy];
}

/* ---------------- localStorage state ---------------- */

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
