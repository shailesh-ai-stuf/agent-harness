import {
  OVERVIEW,
  PREREQUISITES,
  SECTION_IDS,
  STEPS,
} from "./data/guide";
import { useScrollSpy } from "./lib/hooks";
import { Masthead, Ticker } from "./components/Masthead";
import { TopBar } from "./components/TopBar";
import { MobileNav, Sidebar } from "./components/Sidebar";
import { Section } from "./components/Blocks";
import {
  ChecklistView,
  CostView,
  DecisionsView,
  FileTreeView,
  Footer,
  PackageLedger,
  PrereqGrid,
  RoadmapView,
  SupportView,
} from "./components/Sections";

export default function App() {
  const active = useScrollSpy(SECTION_IDS);

  return (
    <div id="top" className="relative min-h-screen">
      {/* ambient layers */}
      <div className="noise-layer" aria-hidden />
      <div className="grid-layer" aria-hidden />
      <div className="glow-a" aria-hidden />
      <div className="glow-b" aria-hidden />

      <TopBar />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-14 md:px-8">
        <MobileNav active={active} />
        <Masthead />
        <Ticker />

        <div className="lg:mt-6 lg:grid lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-14">
          <Sidebar active={active} />

          <main className="min-w-0 pb-4">
            <Section {...OVERVIEW} extra={<PackageLedger />} />
            <Section {...PREREQUISITES} extra={<PrereqGrid />} />

            {STEPS.map((step) => (
              <Section key={step.id} {...step} />
            ))}

            <Section
              id="structure"
              num="13"
              kicker="Reference"
              title="Expected final structure"
              intro="After Step 10, the repository should match this layout exactly. If a file is missing, the step that creates it is linked in its annotation."
              blocks={[]}
              extra={<FileTreeView />}
            />

            <Section
              id="checklist"
              num="14"
              kicker="Reference"
              title="Verification checklist"
              intro="Run through these before considering the project initialized. Your progress is saved locally, so you can tick boxes across sessions."
              blocks={[]}
              extra={<ChecklistView />}
            />

            <Section
              id="decisions"
              num="15"
              kicker="Reference"
              title="Key design decisions"
              intro="Every choice below was made deliberately during the initial design. When in doubt during implementation, this table is the tie-breaker."
              blocks={[]}
              extra={<DecisionsView />}
            />

            <Section
              id="cost"
              num="16"
              kicker="Reference"
              title="Cost optimization strategy"
              intro="The orchestrator reduces LLM costs through tiered routing — every sub-task lands on the cheapest model that can do it justice."
              blocks={[]}
              extra={<CostView />}
            />

            <Section
              id="roadmap"
              num="17"
              kicker="Reference"
              title="Next steps & roadmap"
              intro="The initial setup is only Phase 1. Once the checklist above is green, these are the planned enhancement phases in order."
              blocks={[]}
              extra={<RoadmapView />}
            />

            <Section
              id="support"
              num="18"
              kicker="Reference"
              title="Support, maintenance & license"
              intro="How the harness stays healthy after launch — and the terms under which you're free to fork it."
              blocks={[]}
              extra={<SupportView />}
            />

            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
