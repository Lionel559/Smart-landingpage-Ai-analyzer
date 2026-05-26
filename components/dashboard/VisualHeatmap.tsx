"use client";

import {
  AuditDataType,
  VisualOverlay,
  VisualScores,
} from "@/components/dashboard/DashboardClient";

type Props = {
  auditData: AuditDataType;
  handleFix: (label: string) => void;
  loadingFix: boolean;
  fixResult: { fix?: string; result?: string } | null;
};

const overlayStyles = {
  weak_cta: {
    dot: "bg-red-500",
    border: "border-red-500",
    tint: "bg-red-500/10",
    text: "text-red-600",
    label: "Weak CTA Zone",
  },
  clutter: {
    dot: "bg-orange-500",
    border: "border-orange-500",
    tint: "bg-orange-500/10",
    text: "text-orange-600",
    label: "Cluttered Section",
  },
  missing_trust: {
    dot: "bg-blue-600",
    border: "border-blue-600",
    tint: "bg-blue-600/10",
    text: "text-blue-600",
    label: "Missing Trust Area",
  },
  poor_hierarchy: {
    dot: "bg-fuchsia-600",
    border: "border-fuchsia-600",
    tint: "bg-fuchsia-600/10",
    text: "text-fuchsia-600",
    label: "Poor Hierarchy Region",
  },
};

function isOverlay(value: unknown): value is VisualOverlay {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<VisualOverlay>;

  return (
    typeof item.type === "string" &&
    typeof item.label === "string" &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.width === "number" &&
    typeof item.height === "number" &&
    item.type in overlayStyles
  );
}

function getOverlays(auditData: AuditDataType): VisualOverlay[] {
  const candidates: unknown =
    auditData?.visualOverlays ||
    auditData?.aiFixes?.visualOverlays ||
    auditData?.visualFlags ||
    [];

  if (Array.isArray(candidates)) {
    const overlays = candidates.filter(isOverlay);

    if (overlays.length > 0) {
      return overlays;
    }
  }

  return [
    {
      type: "poor_hierarchy",
      label: "Hero hierarchy review zone",
      evidence:
        "No precise AI marker was stored for this audit, so this highlights the first-screen decision area.",
      x: 10,
      y: 14,
      width: 38,
      height: 18,
      severity: "medium",
    },
    {
      type: "weak_cta",
      label: "CTA review zone",
      evidence:
        "No precise AI marker was stored for this audit, so this highlights the likely action area.",
      x: 56,
      y: 30,
      width: 26,
      height: 14,
      severity: "medium",
    },
    {
      type: "missing_trust",
      label: "Trust proof review zone",
      evidence:
        "No precise AI marker was stored for this audit, so this highlights where proof often needs reinforcement.",
      x: 18,
      y: 64,
      width: 34,
      height: 14,
      severity: "minor",
    },
  ];
}

function getScores(auditData: AuditDataType): VisualScores {
  return {
    visualTrustScore:
      auditData?.visualTrustScore ||
      auditData?.visualScores?.visualTrustScore ||
      auditData?.aiFixes?.visualScores?.visualTrustScore,
    ctaVisibilityScore:
      auditData?.ctaVisibilityScore ||
      auditData?.visualScores?.ctaVisibilityScore ||
      auditData?.aiFixes?.visualScores?.ctaVisibilityScore,
    readabilityScore:
      auditData?.readabilityScore ||
      auditData?.visualScores?.readabilityScore ||
      auditData?.aiFixes?.visualScores?.readabilityScore,
    mobileClarityScore:
      auditData?.mobileClarityScore ||
      auditData?.visualScores?.mobileClarityScore ||
      auditData?.aiFixes?.visualScores?.mobileClarityScore,
    persuasionScore:
      auditData?.persuasionScore ||
      auditData?.visualScores?.persuasionScore ||
      auditData?.aiFixes?.visualScores?.persuasionScore,
  };
}

function scoreTone(score?: number) {
  if (!score) return "text-slate-500 bg-slate-50 border-slate-200";
  if (score >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (score >= 58) return "text-orange-700 bg-orange-50 border-orange-100";
  return "text-red-700 bg-red-50 border-red-100";
}

export default function VisualHeatmap({
  auditData,
  handleFix,
  loadingFix,
  fixResult,
}: Props) {
  const overlays = getOverlays(auditData).slice(0, 6);
  const scores = getScores(auditData);
  const scoreItems = [
    ["Trust", scores.visualTrustScore],
    ["CTA", scores.ctaVisibilityScore],
    ["Readability", scores.readabilityScore],
    ["Mobile", scores.mobileClarityScore],
    ["Persuasion", scores.persuasionScore],
  ];

  return (
    <div className="glass-card rounded-[28px] md:rounded-[36px] p-5 md:p-8 overflow-hidden relative animate-fadeUp">
      <div className="absolute top-0 right-0 w-[220px] h-[220px] bg-blue-100 blur-[120px] rounded-full opacity-60"></div>

      <div className="relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <p className="section-label">
              AI Visual Conversion Analysis
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mt-3 leading-tight">
              Persuasion heatmap & friction detection
            </h3>

            <p className="section-copy mt-4 max-w-3xl text-[15px] leading-8">
              PageDoctor AI visually analyzed the landing page structure to
              detect weak attention flow, trust hesitation points and CTA
              friction zones.
            </p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-3xl px-6 py-5 w-full sm:w-fit min-w-0 xl:min-w-[240px]">
            <p className="text-xs uppercase tracking-[0.15em] text-red-500 font-semibold">
              Revenue Leak Alert
            </p>

            <p className="text-4xl font-bold text-slate-900 mt-2">
              {auditData?.critical || 0}
            </p>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              critical conversion blockers detected
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-7">
          {scoreItems.map(([label, score]) => (
            <div
              key={label}
              className={`rounded-2xl border px-4 py-3 ${scoreTone(
                score as number | undefined
              )}`}
            >
              <p className="text-[11px] uppercase tracking-[0.12em] font-semibold">
                {label}
              </p>
              <p className="text-2xl font-bold mt-1">
                {score ? `${score}%` : "--"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 relative rounded-[26px] md:rounded-[30px] overflow-hidden border border-slate-200 bg-slate-100 shadow-xl">
          <img
            src={auditData?.screenshotUrl}
            alt="Landing page audit"
            className="w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="absolute top-3 md:top-5 left-3 md:left-5 bg-white/90 backdrop-blur-md border border-white rounded-2xl px-4 py-3 shadow-xl max-w-[230px]">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-blue-600 font-semibold">
              AI Vision Scan
            </p>

            <p className="text-xs md:text-sm text-slate-700 mt-1 leading-5">
              Conversion friction mapped visually
            </p>
          </div>

          {overlays.map((overlay, index) => {
            const styles = overlayStyles[overlay.type];
            const width = Math.min(overlay.width, 100 - overlay.x);
            const height = Math.min(overlay.height, 100 - overlay.y);

            return (
              <button
                key={`${overlay.type}-${index}`}
                type="button"
                onClick={() => handleFix(overlay.label)}
                title={overlay.evidence}
                className={`group absolute rounded-xl border-2 ${styles.border} ${styles.tint} shadow-[0_0_0_9999px_rgba(15,23,42,0.02)] hover:scale-[1.02] transition`}
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              >
                <span
                  className={`absolute -top-4 -left-4 w-8 h-8 rounded-full ${styles.dot} text-white text-sm font-bold flex items-center justify-center shadow-xl`}
                >
                  {index + 1}
                </span>

                <span className="absolute left-2 top-2 max-w-[180px] rounded-xl bg-white/95 px-3 py-2 text-left shadow-lg opacity-0 group-hover:opacity-100 transition">
                  <span className={`block text-[11px] font-bold ${styles.text}`}>
                    {overlay.label}
                  </span>
                  <span className="block text-[11px] text-slate-600 leading-4 mt-1">
                    {overlay.evidence}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {overlays.slice(0, 4).map((overlay, index) => {
            const styles = overlayStyles[overlay.type];

            return (
              <div key={`${overlay.type}-legend-${index}`} className="glass-card rounded-[24px] p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${styles.dot}`}></div>

                  <p className="font-semibold text-slate-900">
                    {styles.label}
                  </p>
                </div>

                <p className="text-sm text-slate-500 mt-3 leading-6">
                  {overlay.evidence}
                </p>
              </div>
            );
          })}
        </div>

        {fixResult && (
          <div className="mt-8 glass-card rounded-[28px] md:rounded-[30px] p-5 md:p-6 border border-blue-100">
            <p className="section-label">
              AI Recommended Fix
            </p>

            <h4 className="text-2xl font-bold text-slate-900 mt-3">
              Suggested Improvement
            </h4>

            <p className="text-slate-600 leading-8 mt-4 text-[15px]">
              {fixResult.fix || fixResult.result}
            </p>
          </div>
        )}

        {loadingFix && (
          <div className="mt-8 glass-card rounded-[28px] p-5 md:p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin shrink-0"></div>

            <div>
              <p className="font-semibold text-slate-900">
                AI generating improvement recommendation...
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Building consultant-grade conversion fix
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
