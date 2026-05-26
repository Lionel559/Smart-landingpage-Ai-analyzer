import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  DownloadCloud,
  FileText,
  ListChecks,
  MousePointerClick,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const findings = [
  "Hero message does not state the visitor outcome fast enough.",
  "Primary CTA is visible, but the action copy is too generic.",
  "Trust proof appears too far from the first decision point.",
];

const rewrites = [
  ["Headline", "Turn more paid clicks into qualified leads"],
  ["CTA", "Get my landing page diagnosis"],
  ["Trust", "Reviewed with AI CRO evidence and visual scoring"],
];

const trustPoints = [
  {
    title: "AI-powered CRO insights",
    copy: "Find messaging, trust and CTA friction with page-aware analysis.",
    icon: BrainCircuit,
  },
  {
    title: "Consultant-style reports",
    copy: "Package findings into client-ready summaries, fixes and impact notes.",
    icon: FileText,
  },
  {
    title: "Exportable audit results",
    copy: "Turn every scan into a polished PDF for clients or portfolio proof.",
    icon: DownloadCloud,
  },
];

export default function ProductShowcase() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <p className="section-label">Product Showcase</p>

            <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[44px]">
              See exactly where your landing page is losing conversions.
            </h2>

            <p className="section-copy mt-5 max-w-xl text-base sm:text-lg">
              PageDoctor AI turns a landing page scan into a clear conversion
              health score, prioritized findings, rewrite suggestions and a
              polished audit report.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {trustPoints.map(({ title, copy, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {copy}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden rounded-[34px] border border-white p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    PageDoctor AI Audit
                  </p>
                  <p className="text-xs text-slate-500">
                    smartlandingpage.com
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Consultant report ready
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Conversion Health
                    </p>
                    <p className="mt-3 text-5xl font-bold text-blue-600">
                      74%
                    </p>
                  </div>

                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#2563eb_266deg,#dbeafe_0deg)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-600">
                      <Activity size={22} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["CTA", "62%"],
                    ["Trust", "58%"],
                    ["Mobile", "81%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[28px] border border-slate-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <ListChecks size={17} className="text-blue-600" />
                      <p className="font-bold text-slate-900">
                        AI Findings
                      </p>
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                      3 risks
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {findings.map((item) => (
                      <div
                        key={item}
                        className="flex gap-3 rounded-2xl bg-slate-50 p-3"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        <p className="text-sm leading-6 text-slate-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-100 bg-blue-50/70 p-5">
                    <div className="flex items-center gap-2">
                      <PencilLine size={17} className="text-blue-600" />
                      <p className="font-bold text-slate-900">
                        Rewrite Suggestions
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {rewrites.map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-2">
                      <MousePointerClick
                        size={17}
                        className="text-blue-600"
                      />
                      <p className="font-bold text-slate-900">
                        Screenshot Heatmap
                      </p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white">
                      <div className="h-20 bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-3">
                        <div className="h-3 w-2/3 rounded-full bg-slate-900/80" />
                        <div className="mt-2 h-2 w-1/2 rounded-full bg-slate-300" />
                        <div className="mt-4 h-6 w-24 rounded-xl bg-blue-600" />
                      </div>
                      <div className="relative grid grid-cols-3 gap-2 p-3">
                        <span className="absolute left-8 top-4 h-9 w-16 rounded-xl border-2 border-red-400" />
                        <span className="absolute bottom-4 right-6 h-8 w-14 rounded-xl border-2 border-orange-300" />
                        <div className="h-12 rounded-xl bg-slate-100" />
                        <div className="h-12 rounded-xl bg-slate-100" />
                        <div className="h-12 rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 rounded-[28px] border border-blue-100 bg-blue-50/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Audit report preview
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Executive summary, score breakdown, consultant findings,
                    roadmap, quick wins and revenue notes in one PDF.
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm">
                Export PDF
                <ArrowUpRight size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
