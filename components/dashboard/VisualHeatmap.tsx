"use client";

type Props = {
  auditData: any;
  handleFix: (label: string) => void;
  loadingFix: boolean;
  fixResult: any;
};

export default function VisualHeatmap({
  auditData,
  handleFix,
  loadingFix,
  fixResult,
}: Props) {
  return (
    <div className="glass-card rounded-[28px] md:rounded-[36px] p-5 md:p-8 overflow-hidden relative animate-fadeUp">
      {/* BACKGROUND */}
      <div className="absolute top-0 right-0 w-[220px] h-[220px] bg-blue-100 blur-[120px] rounded-full opacity-60"></div>

      <div className="relative z-10">
        {/* HEADER */}
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

          {/* ALERT CARD */}
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

        {/* SCREENSHOT */}
        <div className="mt-8 relative rounded-[26px] md:rounded-[30px] overflow-hidden border border-slate-200 bg-slate-100 shadow-xl">
          {/* IMAGE */}
          <img
            src={auditData?.screenshotUrl}
            alt="Landing page audit"
            className="w-full object-cover"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent"></div>

          {/* AI BADGE */}
          <div className="absolute top-3 md:top-5 left-3 md:left-5 bg-white/90 backdrop-blur-md border border-white rounded-2xl px-4 py-3 shadow-xl max-w-[220px]">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-blue-600 font-semibold">
              AI Vision Scan
            </p>

            <p className="text-xs md:text-sm text-slate-700 mt-1 leading-5">
              Conversion friction mapped visually
            </p>
          </div>

          {/* PIN 1 */}
          <div className="absolute top-[18%] left-[20%]">
            <button
              onClick={() => handleFix("Headline")}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl animate-pulse font-semibold text-sm md:text-base hover:scale-110 transition"
            >
              1
            </button>
          </div>

          {/* PIN 2 */}
          <div className="absolute top-[42%] right-[18%]">
            <button
              onClick={() => handleFix("CTA")}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-2xl animate-pulse font-semibold text-sm md:text-base hover:scale-110 transition"
            >
              2
            </button>
          </div>

          {/* PIN 3 */}
          <div className="absolute bottom-[22%] left-[32%]">
            <button
              onClick={() => handleFix("Trust")}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl animate-pulse font-semibold text-sm md:text-base hover:scale-110 transition"
            >
              3
            </button>
          </div>
        </div>

        {/* LEGEND */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* CARD */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>

              <p className="font-semibold text-slate-900">
                Messaging Friction
              </p>
            </div>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Weak clarity above the fold reducing engagement speed.
            </p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>

              <p className="font-semibold text-slate-900">
                CTA Weakness
              </p>
            </div>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Low button visibility and poor urgency sequencing detected.
            </p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>

              <p className="font-semibold text-slate-900">
                Trust Leakage
              </p>
            </div>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Social proof and authority positioning require improvement.
            </p>
          </div>
        </div>

        {/* FIX RESULT */}
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

        {/* LOADING */}
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