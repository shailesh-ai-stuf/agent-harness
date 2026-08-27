import {
  CHECKLIST,
  COST_BEHAVIORS,
  COST_TIERS,
  DECISIONS,
  FILE_TREE,
  OVERVIEW,
  PREREQUISITES,
  ROADMAP,
  STEPS,
  SUPPORT,
  type Block,
  type TreeNode,
} from "../data/guide";

/* ---------- file tree → ascii ---------- */

function treeLines(node: TreeNode, prefix: string, isLast: boolean, isRoot: boolean): string[] {
  const connector = isRoot ? "" : isLast ? "└── " : "├── ";
  const lines = [`${prefix}${connector}${node.name}`];
  const children = node.children ?? [];
  const childPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");
  children.forEach((child, i) => {
    lines.push(...treeLines(child, childPrefix, i === children.length - 1, false));
  });
  return lines;
}

/* ---------- blocks → markdown ---------- */

function blockToMd(block: Block): string {
  switch (block.t) {
    case "p":
      return block.text;
    case "list":
      return block.items.map((i) => `- ${i}`).join("\n");
    case "code": {
      const label = block.file ? ` — \`${block.file}\`` : "";
      return `**\`${block.lang}\`**${label}\n\n\`\`\`${block.lang}\n${block.code}\n\`\`\``;
    }
    case "callout":
      return `> **${block.title}** — ${block.text}`;
    case "table": {
      const head = `| ${block.head.join(" | ")} |`;
      const sep = `| ${block.head.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
      return [head, sep, rows].join("\n");
    }
  }
}

function sectionToMd(s: { title: string; kicker: string; intro?: string; blocks: Block[] }): string {
  const parts = [`## ${s.title}`, ""];
  if (s.intro) parts.push(s.intro, "");
  for (const b of s.blocks) parts.push(blockToMd(b), "");
  return parts.join("\n");
}

/* ---------- full document ---------- */

export function exportGuideMarkdown(): string {
  const out: string[] = [];

  out.push(`# Agent Harness — Build Guide`, "");
  out.push(
    `> A step-by-step reference for building **Agent Harness**: a Node.js monorepo that serves as the centralized governance layer for AI agents in an organization. Implementation details (code, configs) are maintained separately.`,
    "",
  );
  out.push(`**Stack:** TypeScript (strict) · ESM-only · pnpm workspaces · tsup · Biome · Vercel AI SDK · OpenTelemetry · vitest`, "");
  out.push(`---`, "");

  out.push(sectionToMd(OVERVIEW));
  out.push(sectionToMd(PREREQUISITES));
  out.push(`---`, "");
  out.push(`# Build sequence`, "");
  for (const step of STEPS) {
    out.push(sectionToMd(step));
    out.push(`---`, "");
  }

  out.push(`## Expected final structure`, "");
  out.push("```", ...treeLines(FILE_TREE, "", true, true), "```", "");

  out.push(`## Verification checklist`, "");
  for (const c of CHECKLIST) out.push(`- [ ] ${c.label} (\`${c.cmd}\`)`);
  out.push("");

  out.push(`## Key design decisions`, "");
  out.push(`| ${DECISIONS.head.join(" | ")} |`);
  out.push(`| ${DECISIONS.head.map(() => "---").join(" | ")} |`);
  for (const r of DECISIONS.rows) out.push(`| ${r.join(" | ")} |`);
  out.push("");

  out.push(`## Cost optimization strategy`, "");
  out.push(`| Criticality | Default model | Relative cost |`);
  out.push(`| --- | --- | --- |`);
  for (const t of COST_TIERS) out.push(`| ${t.criticality} | ${t.model} | ${t.cost} |`);
  out.push("");
  out.push(`The orchestrator:`);
  for (const b of COST_BEHAVIORS) out.push(`- ${b}`);
  out.push("", `This typically reduces overall LLM spend by **40–60%** compared to using a single high-tier model for all tasks.`, "");

  out.push(`## Next steps / roadmap`, "");
  for (const p of ROADMAP) {
    out.push(`### ${p.phase}: ${p.title}`, "");
    for (const i of p.items) out.push(`- ${i}`);
    out.push("");
  }

  out.push(`## Support & maintenance`, "");
  for (const s of SUPPORT) out.push(`- **${s.title}** — ${s.text}`);
  out.push("");
  out.push(`## License`, "", `MIT License — see the LICENSE file for details.`);

  return out.join("\n");
}

export function downloadGuide(): void {
  const md = exportGuideMarkdown();
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agent-harness-build-guide.md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}
