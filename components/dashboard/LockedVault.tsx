"use client";

import { Lock, Sparkles, ArrowRight } from "lucide-react";

export default function LockedVault() {
  const items = [
    "Full Landing Page Rewrite (Hero → CTA → Sections)",
    "Competitor Conversion Benchmark Analysis",
    "AI Funnel Optimization Strategy",
    "Mobile Conversion Heatmap Deep Scan",
    "Ad Traffic Compatibility Report",
    "Lead Capture Form Optimization Blueprint",
  ];

  return (
    <div className="mt-10 rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-8 shadow-2xl relative overflow-hidden animate-fadeUp">
      {/* glow */}
      <div className="absolute top-0 right-0 w-[260px] h-[260px] bg-blue-500/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
            <Lock size={18} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
              Premium Consultant Vault
            </p>
            <h3 className="text-2xl font-bold">
              Unlock Advanced Conversion Intelligence
            </h3>
          </div>
        </div>

        <p className="text-gray-300 mt-4 max-w-2xl leading-7">
          PageDoctor AI has identified deeper optimization layers beyond this audit.
          Unlock full-stack CRO intelligence, AI rewrites and competitor breakdowns.
        </p>

        {/* LOCKED LIST */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur opacity-90"
            >
              <Lock size={14} className="text-blue-300" />
              <p className="text-sm text-gray-200">{item}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Upgrade to unlock full consultant-grade analysis
            </p>
            <p className="text-lg font-semibold text-white mt-1">
              Increase conversions. Recover lost revenue.
            </p>
          </div>

          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-[1.04] transition">
            <Sparkles size={16} />
            Unlock Full Report
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}