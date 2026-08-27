/* ------------------------------------------------------------------ */
/*  Agent Harness — build guide content model                          */
/* ------------------------------------------------------------------ */

export type Block =
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "code"; lang: "yaml" | "json" | "ts" | "bash" | "md"; file?: string; code: string }
  | { t: "callout"; tone: "info" | "warn" | "tip"; title: string; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

export interface GuideSection {
  id: string;
  num: string;
  kicker: string;
  title: string;
  intro?: string;
  blocks: Block[];
}

export interface NavGroup {
  label: string;
  items: { id: string; label: string }[];
}

export const NAV: NavGroup[] = [
  {
    label: "Foundations",
    items: [
      { id: "overview", label: "Project overview" },
      { id: "prerequisites", label: "Prerequisites" },
    ],
  },
  {
    label: "Build sequence",
    items: [
      { id: "step-1", label: "Initialize the monorepo root" },
      { id: "step-2", label: "Core package" },
      { id: "step-3", label: "Registry package" },
      { id: "step-4", label: "Infra package" },
      { id: "step-5", label: "Agents & skills" },
      { id: "step-6", label: "CI / CD" },
      { id: "step-7", label: "Environment config" },
      { id: "step-8", label: "Usage example" },
      { id: "step-9", label: "Documentation" },
      { id: "step-10", label: "Final verification" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "structure", label: "Expected structure" },
      { id: "checklist", label: "Verification checklist" },
      { id: "decisions", label: "Design decisions" },
      { id: "cost", label: "Cost optimization" },
      { id: "roadmap", label: "Roadmap" },
      { id: "support", label: "Support & license" },
    ],
  },
];

export const SECTION_IDS = NAV.flatMap((g) => g.items.map((i) => i.id));

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

export const OVERVIEW: GuideSection = {
  id: "overview",
  num: "01",
  kicker: "Foundations",
  title: "Project overview",
  intro:
    "Agent Harness is a Node.js monorepo that acts as the centralized governance layer for every AI agent in an organization — one place where GitHub Copilot, Cloud Code, and any other AI tooling agree on agents, skills, and instructions.",
  blocks: [
    {
      t: "p",
      text: "Instead of every team wiring its own prompts and models, the harness owns the whole lifecycle: it plans the work, delegates sub-tasks to the right agent on the right model, reviews the output, and re-runs anything that fails review — with telemetry on every hop.",
    },
    {
      t: "list",
      items: [
        "Single source of truth — agents, skills, and instructions live in git as YAML + Markdown.",
        "Cost control — intelligent task routing based on criticality, not habit.",
        "Orchestration — a plan → execute → review → self-correct loop with automatic re-delegation.",
        "SRE-grade — full OpenTelemetry traces and CI/CD from day one.",
      ],
    },
  ],
};

export const PREREQUISITES: GuideSection = {
  id: "prerequisites",
  num: "02",
  kicker: "Foundations",
  title: "Prerequisites",
  intro: "Everything in this guide assumes a working terminal and the toolchain below. Verify versions before Step 1 — the monorepo will refuse to build on anything older.",
  blocks: [
    {
      t: "code",
      lang: "bash",
      file: "check-toolchain.sh",
      code: `node --version    # v20.x or higher
pnpm --version    # 9.x or higher  (npm i -g pnpm if missing)
git --version     # latest stable
code --version    # VS Code recommended`,
    },
    {
      t: "callout",
      tone: "warn",
      title: "LLM provider keys",
      text: "You need an API key for at least one provider — OpenAI, Anthropic, or Google. The router degrades gracefully, but the example in Step 8 expects at least one key in your environment.",
    },
  ],
};

export const STEPS: GuideSection[] = [
  {
    id: "step-1",
    num: "03",
    kicker: "Step 1 / 10",
    title: "Initialize the monorepo root",
    intro:
      "The root owns workspace config, shared TypeScript strictness, lint rules, and top-level scripts. Packages come next — the root comes first.",
    blocks: [
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `mkdir agent-harness && cd agent-harness
pnpm init
mkdir -p packages/core packages/registry packages/infra`,
      },
      {
        t: "p",
        text: "Point the workspace at the packages directory, then lock the module system to ESM and Node 20+:",
      },
      {
        t: "code",
        lang: "yaml",
        file: "pnpm-workspace.yaml",
        code: `packages:
  - "packages/*"`,
      },
      {
        t: "code",
        lang: "json",
        file: "package.json",
        code: `{
  "name": "agent-harness",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "biome check .",
    "clean": "pnpm -r clean && rm -rf node_modules",
    "example": "tsx examples/basic-usage.ts"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}`,
      },
      {
        t: "code",
        lang: "json",
        file: "tsconfig.base.json",
        code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}`,
      },
      {
        t: "p",
        text: "Add a Biome config for linting and formatting (one tool, one pass), then install root dependencies:",
      },
      {
        t: "code",
        lang: "json",
        file: "biome.json",
        code: `{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "files": { "ignore": ["dist", "coverage", "node_modules"] }
}`,
      },
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `pnpm add -Dw @biomejs/biome tsx typescript
pnpm install`,
      },
      {
        t: "callout",
        tone: "tip",
        title: "Checkpoint",
        text: "You should now have an agent-harness/ directory with a workspace file, a base tsconfig, Biome config, and three empty package folders. pnpm ls -r should list the root workspace.",
      },
    ],
  },
  {
    id: "step-2",
    num: "04",
    kicker: "Step 2 / 10",
    title: "Set up the core package",
    intro:
      "packages/core is the brain: type definitions for the whole system, a criticality-aware LLM router, and the orchestrator loop. Everything else depends on it.",
    blocks: [
      {
        t: "code",
        lang: "json",
        file: "packages/core/package.json",
        code: `{
  "name": "@agent-harness/core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "ai": "^4.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "tsup": "^8.3.5",
    "vitest": "^2.1.8",
    "typescript": "^5.7.2"
  }
}`,
      },
      {
        t: "code",
        lang: "json",
        file: "packages/core/tsconfig.json",
        code: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}`,
      },
      {
        t: "code",
        lang: "ts",
        file: "packages/core/tsup.config.ts",
        code: `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});`,
      },
      {
        t: "p",
        text: "Implement four source files under packages/core/src/:",
      },
      {
        t: "table",
        head: ["File", "Responsibility"],
        rows: [
          ["types.ts", "Core type definitions — LLM providers, task criticality, agent config, task, orchestration plan, skill"],
          ["llm-router.ts", "Routes tasks to the appropriate LLM based on criticality (low → cheap models, critical → expensive models)"],
          ["orchestrator.ts", "Implements the plan → execute → review → self-correct loop"],
          ["index.ts", "Re-exports the public API"],
        ],
      },
      {
        t: "code",
        lang: "ts",
        file: "packages/core/src/llm-router.ts — sketch",
        code: `import type { TaskCriticality, LLMProvider } from "./types.js";

const ROUTES: Record<TaskCriticality, LLMProvider> = {
  low:      { provider: "openai",    model: "gpt-4o-mini" },
  medium:   { provider: "openai",    model: "gpt-4o" },
  high:     { provider: "anthropic", model: "claude-3-5-sonnet-latest" },
  critical: { provider: "anthropic", model: "claude-3-opus-latest" },
};

export function routeTask(criticality: TaskCriticality): LLMProvider {
  return ROUTES[criticality];
}`,
      },
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `cd packages/core && pnpm install && pnpm build`,
      },
    ],
  },
  {
    id: "step-3",
    num: "05",
    kicker: "Step 3 / 10",
    title: "Set up the registry package",
    intro:
      "packages/registry turns plain files into typed config: it reads agent YAML files and skill Markdown files with frontmatter, validates them with Zod, and hands typed objects to core.",
    blocks: [
      {
        t: "code",
        lang: "json",
        file: "packages/registry/package.json",
        code: `{
  "name": "@agent-harness/registry",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "yaml": "^2.6.1",
    "gray-matter": "^4.0.3",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "tsup": "^8.3.5",
    "vitest": "^2.1.8",
    "typescript": "^5.7.2"
  }
}`,
      },
      {
        t: "p",
        text: "Reuse the same tsconfig.json (extends the base config) and tsup.config.ts (ESM, dts, sourcemaps) as core, then implement:",
      },
      {
        t: "table",
        head: ["File", "Responsibility"],
        rows: [
          ["agent-loader.ts", "Reads agent YAML files from a directory and returns typed agent configs"],
          ["skill-loader.ts", "Reads skill Markdown files with frontmatter and returns skill definitions"],
          ["index.ts", "Re-exports the loaders"],
        ],
      },
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `cd packages/registry && pnpm install && pnpm build`,
      },
    ],
  },
  {
    id: "step-4",
    num: "06",
    kicker: "Step 4 / 10",
    title: "Set up the infra package",
    intro:
      "packages/infra owns observability: one call boots OpenTelemetry with OTLP export and auto-instrumentations, and one call shuts it down cleanly.",
    blocks: [
      {
        t: "code",
        lang: "json",
        file: "packages/infra/package.json",
        code: `{
  "name": "@agent-harness/infra",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/sdk-node": "^0.57.0",
    "@opentelemetry/auto-instrumentations-node": "^0.55.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.57.0"
  },
  "devDependencies": {
    "tsup": "^8.3.5",
    "vitest": "^2.1.8",
    "typescript": "^5.7.2"
  }
}`,
      },
      {
        t: "table",
        head: ["File", "Responsibility"],
        rows: [
          ["telemetry.ts", "Initializes OpenTelemetry with the OTLP exporter and auto-instrumentations; handles graceful shutdown"],
          ["index.ts", "Re-exports telemetry utilities"],
        ],
      },
      {
        t: "code",
        lang: "ts",
        file: "packages/infra/src/telemetry.ts — sketch",
        code: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME ?? "agent-harness",
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318/v1/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

export function initTelemetry(): void {
  sdk.start();
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => void sdk.shutdown());
  }
}

export const shutdownTelemetry = () => sdk.shutdown();`,
      },
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `cd packages/infra && pnpm install && pnpm build`,
      },
    ],
  },
  {
    id: "step-5",
    num: "07",
    kicker: "Step 5 / 10",
    title: "Create agents & skills directories",
    intro:
      "Agents and skills are content, not code — they live at the repo top level as YAML and Markdown so anyone can review a behavior change in a pull request.",
    blocks: [
      {
        t: "p",
        text: "Each agent YAML needs: id, name, description, a skills list, instructions, and a default LLM configuration.",
      },
      {
        t: "code",
        lang: "yaml",
        file: "agents/code-reviewer.yaml",
        code: `id: code-reviewer
name: Code Reviewer
description: Reviews pull requests for quality, security, and maintainability.
skills:
  - code-analysis
instructions: |
  You are a senior code reviewer. For each diff you receive:
  1. Flag correctness bugs and security issues first.
  2. Check naming, structure, and test coverage.
  3. Suggest the smallest possible fix for each finding.
  Be concise. Never rewrite the whole file.
llm:
  provider: anthropic
  model: claude-3-5-sonnet-latest
  criticality: high`,
      },
      {
        t: "code",
        lang: "yaml",
        file: "agents/infra-provisioner.yaml",
        code: `id: infra-provisioner
name: Infra Provisioner
description: Generates infrastructure-as-code for requested services.
skills:
  - code-analysis
instructions: |
  Generate Terraform/OpenTofu modules that are idempotent,
  tagged, and safe to apply in a shared environment.
  Always output a plan summary before any code.
llm:
  provider: google
  model: gemini-2.0-flash
  criticality: medium`,
      },
      {
        t: "p",
        text: "Each skill Markdown file needs frontmatter (id, name, description, parameters) and a body with detailed instructions:",
      },
      {
        t: "code",
        lang: "md",
        file: "skills/code-analysis.md",
        code: `---
id: code-analysis
name: Code Analysis
description: Analyze code for quality signals and recurring patterns.
parameters:
  - name: language
    type: string
    required: false
  - name: maxFindings
    type: number
    required: false
---

# Code Analysis

1. Parse the input into logical units (files, functions).
2. Score each unit: complexity, duplication, naming, test presence.
3. Cluster findings into patterns (e.g. "god module", "missing edge tests").
4. Return ranked findings with file:line references.`,
      },
      {
        t: "callout",
        tone: "info",
        title: "Why YAML + Markdown?",
        text: "Both formats diff cleanly in git, read well in a PR, and can be validated with Zod schemas later (Phase 3). No binary formats, no database — the repo is the store.",
      },
    ],
  },
  {
    id: "step-6",
    num: "08",
    kicker: "Step 6 / 10",
    title: "Set up CI / CD",
    intro:
      "Two workflows under .github/workflows/: one guards every push and PR, the other publishes tagged releases to npm.",
    blocks: [
      {
        t: "code",
        lang: "yaml",
        file: ".github/workflows/ci.yml",
        code: `name: CI
on:
  push: { branches: [main, develop] }
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [20, 22] }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.node }}, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GOOGLE_GENERATIVE_AI_API_KEY: \${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}`,
      },
      {
        t: "code",
        lang: "yaml",
        file: ".github/workflows/release.yml",
        code: `name: Release
on:
  push: { tags: ["v*"] }

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm -r publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}`,
      },
      {
        t: "callout",
        tone: "warn",
        title: "Repository secrets required",
        text: "Add OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, and NPM_TOKEN under Settings → Secrets before the first push, or the workflows will fail on the test and publish steps.",
      },
    ],
  },
  {
    id: "step-7",
    num: "09",
    kicker: "Step 7 / 10",
    title: "Environment configuration",
    intro:
      "Document every variable the harness reads in .env.example, and keep secrets out of git with a thorough .gitignore.",
    blocks: [
      {
        t: "code",
        lang: "bash",
        file: ".env.example",
        code: `# --- LLM providers (at least one required) ---
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# --- OpenTelemetry ---
OTEL_SERVICE_NAME=agent-harness
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# --- Registry paths ---
HARNESS_AGENTS_DIR=./agents
HARNESS_SKILLS_DIR=./skills`,
      },
      {
        t: "code",
        lang: "bash",
        file: ".gitignore",
        code: `# dependencies & build output
node_modules/
dist/
coverage/

# environment files
.env
.env.local

# editors, OS, logs
.idea/
.vscode/*
.DS_Store
*.log`,
      },
    ],
  },
  {
    id: "step-8",
    num: "10",
    kicker: "Step 8 / 10",
    title: "Create a usage example",
    intro:
      "examples/basic-usage.ts proves the three packages compose: boot telemetry, load the registry, register agents, run a goal through the loop, print the plan.",
    blocks: [
      {
        t: "code",
        lang: "ts",
        file: "examples/basic-usage.ts",
        code: `import { initTelemetry } from "@agent-harness/infra";
import { loadAgents } from "@agent-harness/registry";
import { Orchestrator } from "@agent-harness/core";

await initTelemetry();

const agents = await loadAgents(process.env.HARNESS_AGENTS_DIR ?? "./agents");

const orchestrator = new Orchestrator();
for (const agent of agents) orchestrator.register(agent);

const plan = await orchestrator.run(
  "Refactor the billing service for testability",
);

console.log(JSON.stringify(plan, null, 2));`,
      },
      {
        t: "p",
        text: "Wire it to a root script so it runs TypeScript directly via tsx (already added as a root dev dependency in Step 1):",
      },
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `pnpm example
# → runs tsx examples/basic-usage.ts`,
      },
    ],
  },
  {
    id: "step-9",
    num: "11",
    kicker: "Step 9 / 10",
    title: "Write the documentation",
    intro: "The root README.md is the front door. It should cover, at minimum:",
    blocks: [
      {
        t: "list",
        items: [
          "Project overview and feature list",
          "Installation instructions (pnpm install, engine requirements)",
          "Quick start guide — from clone to first orchestration run",
          "Architecture diagram (text-based is fine, keep it in-repo)",
          "Package descriptions for @agent-harness/core, registry, and infra",
          "Configuration guide — how to add new agents and skills",
          "Development commands — build, test, lint, clean, example",
          "License information (MIT)",
        ],
      },
      {
        t: "callout",
        tone: "tip",
        title: "Keep the diagram in ASCII",
        text: "A text-based diagram renders everywhere GitHub renders — no image assets to rot. The one below in the Expected Structure section is the template.",
      },
    ],
  },
  {
    id: "step-10",
    num: "12",
    kicker: "Step 10 / 10",
    title: "Final verification",
    intro: "Run the full pipeline from a clean checkout. Every command must exit zero before the repo is considered initialized.",
    blocks: [
      {
        t: "code",
        lang: "bash",
        file: "terminal",
        code: `pnpm install     # workspace-wide dependency resolution
pnpm build       # all three packages compile (tsup + dts)
pnpm test        # vitest runs, even with zero suites
pnpm lint        # biome check passes
pnpm example     # registry loads, orchestrator runs`,
      },
      {
        t: "p",
        text: "Then compare the tree against the Expected Structure section below and walk the verification checklist. If every box ticks, the harness is ready for Phase 2 work.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Reference data                                                     */
/* ------------------------------------------------------------------ */

export interface TreeNode {
  name: string;
  kind: "dir" | "file";
  note?: string;
  children?: TreeNode[];
}

export const FILE_TREE: TreeNode = {
  name: "agent-harness/",
  kind: "dir",
  children: [
    {
      name: ".github/workflows/",
      kind: "dir",
      children: [
        { name: "ci.yml", kind: "file", note: "Node 20 + 22 matrix · lint, build, test" },
        { name: "release.yml", kind: "file", note: "v* tags → npm publish" },
      ],
    },
    {
      name: "agents/",
      kind: "dir",
      children: [
        { name: "code-reviewer.yaml", kind: "file", note: "review agent · high criticality" },
        { name: "infra-provisioner.yaml", kind: "file", note: "IaC agent · medium criticality" },
      ],
    },
    {
      name: "skills/",
      kind: "dir",
      children: [{ name: "code-analysis.md", kind: "file", note: "frontmatter + instructions" }],
    },
    {
      name: "packages/",
      kind: "dir",
      children: [
        {
          name: "core/",
          kind: "dir",
          children: [
            { name: "src/", kind: "dir", note: "types · llm-router · orchestrator · index" },
            { name: "package.json", kind: "file" },
            { name: "tsconfig.json", kind: "file" },
            { name: "tsup.config.ts", kind: "file" },
          ],
        },
        {
          name: "registry/",
          kind: "dir",
          children: [
            { name: "src/", kind: "dir", note: "agent-loader · skill-loader · index" },
            { name: "package.json", kind: "file" },
            { name: "tsconfig.json", kind: "file" },
            { name: "tsup.config.ts", kind: "file" },
          ],
        },
        {
          name: "infra/",
          kind: "dir",
          children: [
            { name: "src/", kind: "dir", note: "telemetry · index" },
            { name: "package.json", kind: "file" },
            { name: "tsconfig.json", kind: "file" },
            { name: "tsup.config.ts", kind: "file" },
          ],
        },
      ],
    },
    {
      name: "examples/",
      kind: "dir",
      children: [{ name: "basic-usage.ts", kind: "file", note: "tsx entry point" }],
    },
    { name: "package.json", kind: "file", note: "ESM · engines node >= 20 · root scripts" },
    { name: "pnpm-workspace.yaml", kind: "file", note: "workspace → packages/*" },
    { name: "tsconfig.base.json", kind: "file", note: "strict · ES2022 · NodeNext" },
    { name: "biome.json", kind: "file", note: "lint + format" },
    { name: ".env.example", kind: "file", note: "LLM keys · OTEL · registry paths" },
    { name: ".gitignore", kind: "file" },
    { name: "README.md", kind: "file", note: "overview · quick start · architecture" },
    { name: "LICENSE", kind: "file", note: "MIT" },
  ],
};

export const CHECKLIST = [
  { id: "c1", label: "All three packages build without errors", cmd: "pnpm build" },
  { id: "c2", label: "Lint passes with no issues", cmd: "pnpm lint" },
  { id: "c3", label: "Test runner executes (even with no tests yet)", cmd: "pnpm test" },
  { id: "c4", label: "Example agents and skills load correctly", cmd: "pnpm example" },
  { id: "c5", label: ".env.example documents all required variables", cmd: "cat .env.example" },
  { id: "c6", label: "README accurately describes the project", cmd: "open README.md" },
  { id: "c7", label: "CI workflow is configured and would run on push", cmd: "git push origin main" },
];

export const DECISIONS = {
  head: ["Decision", "Choice", "Rationale"],
  rows: [
    ["Language", "TypeScript (strict)", "Type safety for complex agent schemas"],
    ["Module format", "ESM-only", "Modern Node.js standard, better tree-shaking"],
    ["Package manager", "pnpm workspaces", "Fast, disk-efficient, strict dependency isolation"],
    ["Build tool", "tsup", "Fast, simple, good ESM/DTS support"],
    ["Linter / formatter", "Biome", "Single tool, faster than ESLint + Prettier"],
    ["LLM abstraction", "Vercel AI SDK", "Unified interface across providers"],
    ["Agent storage", "YAML + Markdown", "Git-friendly, human-readable, version-controlled"],
    ["Telemetry", "OpenTelemetry", "Industry standard, vendor-neutral"],
    ["Test framework", "vitest", "Native ESM support, fast, TS-friendly"],
  ],
};

export interface CostTier {
  criticality: string;
  model: string;
  cost: string;
  glyph: number; // 1..4 dollar signs
  width: number; // bar width %
  color: "mint" | "skyx" | "route" | "flare";
}

export const COST_TIERS: CostTier[] = [
  { criticality: "Low", model: "GPT-4o-mini", cost: "$", glyph: 1, width: 16, color: "mint" },
  { criticality: "Medium", model: "GPT-4o", cost: "$$", glyph: 2, width: 38, color: "skyx" },
  { criticality: "High", model: "Claude 3.5 Sonnet", cost: "$$$", glyph: 3, width: 64, color: "route" },
  { criticality: "Critical", model: "Claude 3 Opus", cost: "$$$$", glyph: 4, width: 100, color: "flare" },
];

export const COST_BEHAVIORS = [
  "Plans the work using a high-tier model — one-time planning cost.",
  "Routes each sub-task to the cheapest appropriate model.",
  "Reviews output with a critical-tier model only when needed.",
  "Re-calls agents only when review identifies issues.",
];

export interface RoadmapPhase {
  phase: string;
  title: string;
  color: "mint" | "skyx" | "route" | "flare";
  items: string[];
}

export const ROADMAP: RoadmapPhase[] = [
  {
    phase: "Phase 2",
    title: "Enhanced orchestration",
    color: "mint",
    items: [
      "Retry logic with exponential backoff for failed tasks",
      "Parallel task execution where dependencies allow",
      "Streaming output support",
      "Conversation memory across orchestration runs",
    ],
  },
  {
    phase: "Phase 3",
    title: "Advanced registry",
    color: "skyx",
    items: [
      "Schema validation for agent and skill files",
      "Load agents from remote git repositories",
      "Registry search API",
      "Agent versioning",
    ],
  },
  {
    phase: "Phase 4",
    title: "CLI tool",
    color: "route",
    items: [
      "New @agent-harness/cli package",
      "Commands: init, validate, run, list agents, list skills",
      "Interactive agent-creation wizard",
    ],
  },
  {
    phase: "Phase 5",
    title: "Observability",
    color: "flare",
    items: [
      "Custom spans for each orchestration phase",
      "Token usage and cost tracking per run",
      "Prometheus metrics export",
      "A simple web dashboard for viewing runs",
    ],
  },
  {
    phase: "Phase 6",
    title: "Testing strategy",
    color: "skyx",
    items: [
      "Unit tests for LLM router criticality mapping",
      "Unit tests for agent / skill loaders",
      "Integration tests with mocked LLM providers",
      "End-to-end orchestration tests",
    ],
  },
  {
    phase: "Phase 7",
    title: "Documentation site",
    color: "mint",
    items: [
      "TypeDoc for API documentation",
      "Docusaurus site for guides",
      "Architecture diagrams",
      "Video tutorials",
    ],
  },
];

export const SUPPORT = [
  {
    title: "Issues",
    text: "Open GitHub issues for bugs and feature requests.",
  },
  {
    title: "Updates",
    text: "Keep dependencies current via Dependabot or Renovate.",
  },
  {
    title: "Monitoring",
    text: "Use OpenTelemetry traces to track orchestration health.",
  },
  {
    title: "Backups",
    text: "Agent and skill files live in git — standard git backup applies.",
  },
];

export const TERMINAL_LINES = [
  "$ pnpm dlx agent-harness init",
  "▸ scaffolding monorepo root ............ done",
  "▸ linking packages/core · registry · infra",
  "▸ registry: 2 agents, 1 skill loaded",
  "▸ orchestrator online — plan → execute → review → correct",
  '$ harness run "ship the payments service"',
  "● routed 6 subtasks across 3 providers",
  "● spend: 46% of single-tier baseline ✓",
];

export const TICKER = [
  "plan",
  "execute",
  "review",
  "self-correct",
  "single source of truth",
  "criticality routing",
  "yaml + markdown registry",
  "opentelemetry",
  "esm-only",
  "pnpm workspaces",
];
