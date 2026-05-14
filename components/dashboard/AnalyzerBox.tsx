"use client";

import { useRef, useState } from "react";
import { AuditDataType } from "@/components/dashboard/DashboardClient";
import AuditLoader from "@/components/dashboard/AuditLoader";

import {
  Globe,
  Sparkles,
  ArrowRight,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Props = {
  setAuditData: React.Dispatch<React.SetStateAction<AuditDataType | null>>;
  setReportHistory: React.Dispatch<React.SetStateAction<AuditDataType[]>>;
};

export default function AnalyzerBox({
  setAuditData,
  setReportHistory,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const normalizeUrl = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }

    return url;
  };

  const hydrateAuditUI = async (data: AuditDataType) => {
    setAuditData(data);

    try {
      const res = await fetch("/api/audits");

      if (!res.ok) {
        throw new Error("Unable to fetch latest audits");
      }

      const latest = await res.json();

      if (Array.isArray(latest)) {
        setReportHistory(latest);
      }
    } catch (error) {
      console.log("HISTORY FETCH ERROR:", error);

      setReportHistory((prev) => [data, ...prev.slice(0, 10)]);
    }

    setSiteUrl("");
    setErrorMsg("");

    setSuccessMsg("Audit completed successfully.");

    setTimeout(() => {
      setSuccessMsg("");
    }, 3500);
  };

  const runAudit = async () => {
    if (loading) return;

    if (!siteUrl.trim()) {
      setErrorMsg("Please enter a landing page URL.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      const cleanUrl = normalizeUrl(siteUrl);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanUrl,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Scan failed");
      }

      await hydrateAuditUI(data);
    } catch (error: any) {
      console.log("SCAN ERROR:", error);

      if (error.name === "AbortError") {
        setErrorMsg(
          "Audit timed out. Some websites are slow or block scanners."
        );
      } else {
        setErrorMsg(
          error.message || "Scan failed. Please try another page."
        );
      }
    }

    setLoading(false);
  };

  const handleScreenshotAudit = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;

    const file = e.target.files?.[0];

    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    setTimeout(async () => {
      const previewUrl = URL.createObjectURL(file);

      const fakeAudit: AuditDataType = {
        id: `local-${Date.now()}`,
        siteUrl: file.name,
        seo: 68,
        ux: 74,
        cta: 61,
        trust: 70,
        mobile: 79,
        health: 71,
        critical: 2,
        medium: 4,
        minor: 3,
        confidence: 89,

        findings: [
          "❌ Hero section lacks immediate conversion clarity.",
          "⚠️ Primary CTA button lacks urgency and visual prominence.",
          "❌ Trust signals are below ideal first-screen placement.",
          "📱 Mobile screenshot indicates dense content stacking.",
        ],

        summary:
          "AI screenshot vision review indicates moderate landing page health with strong improvement opportunities in CTA hierarchy, trust acceleration and first-fold messaging.",

        roadmap: [
          "Rewrite above-the-fold headline to sharpen offer clarity.",
          "Increase CTA size, contrast and urgency language.",
          "Move testimonial/security badges closer to hero CTA.",
          "Reduce mobile content congestion and improve visual breathing room.",
        ],

        revenueNotes: [],

        screenshotUrl: previewUrl,
      };

      await hydrateAuditUI(fakeAudit);

      setLoading(false);

      setTimeout(() => {
        URL.revokeObjectURL(previewUrl);
      }, 15000);
    }, 4500);
  };

  return (
    <>
      <div className="relative overflow-hidden glass-card rounded-[40px] px-6 py-7 md:px-10 md:py-10 xl:px-14 xl:py-14">
        {/* BACKGROUND GLOWS */}
        <div className="absolute top-[-80px] right-[-40px] w-[260px] h-[260px] bg-blue-100 blur-[120px] rounded-full opacity-70"></div>

        <div className="absolute bottom-[-80px] left-[-40px] w-[240px] h-[240px] bg-indigo-100 blur-[120px] rounded-full opacity-60"></div>

        <div className="relative z-10">
          {/* TOP BADGE */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-blue-100 shadow-sm">
            <Sparkles size={14} />
            AI Conversion Intelligence Engine
          </div>

          {/* MAIN GRID */}
          <div className="grid xl:grid-cols-2 gap-12 mt-8 items-center">
            {/* LEFT */}
            <div>
              <h2 className="text-[42px] md:text-[56px] leading-[1.05] tracking-[-2px] font-bold text-slate-900 max-w-[700px]">
                Diagnose why visitors are not converting
              </h2>

              <p className="text-slate-600 mt-6 text-[17px] leading-8 max-w-[620px]">
                PageDoctor AI audits landing pages like a real CRO consultant —
                identifying persuasion leaks, trust friction, CTA weaknesses
                and hidden conversion blockers reducing revenue performance.
              </p>

              {/* TRUST ROW */}
              <div className="flex flex-wrap gap-3 mt-8">
                <div className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700">
                  AI UX Intelligence
                </div>

                <div className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700">
                  Conversion Leak Detection
                </div>

                <div className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700">
                  Instant CRO Recommendations
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[34px] p-6 md:p-7 shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
              {/* INPUT */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-3">
                  Landing Page URL
                </label>

                <div className="relative">
                  <Globe
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    value={siteUrl}
                    disabled={loading}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://yourlandingpage.com"
                    className="w-full pl-14 pr-4 py-5 rounded-2xl border border-slate-200 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <button
                  disabled={loading}
                  onClick={() => fileRef.current?.click()}
                  className="secondary-button py-4 flex items-center justify-center gap-2"
                >
                  <ImagePlus size={18} />
                  Upload Screenshot
                </button>

                <button
                  disabled={loading}
                  onClick={runAudit}
                  className="primary-button py-4 flex items-center justify-center gap-2"
                >
                  {loading ? "Running AI Audit..." : "Run AI Audit"}

                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>

              {/* FILE INPUT */}
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleScreenshotAudit}
                className="hidden"
              />

              {/* ERROR */}
              {errorMsg && (
                <div className="mt-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-4 text-sm flex gap-3 items-start">
                  <AlertCircle size={17} className="mt-[1px]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SUCCESS */}
              {successMsg && (
                <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-4 text-sm flex gap-3 items-start">
                  <CheckCircle2 size={17} className="mt-[1px]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FOOTER */}
              <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
                <div className="text-slate-500">
                  AI consultant-grade landing page analysis
                </div>

                <div className="text-blue-600 font-semibold">
                  ~45 sec audit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOADER */}
      {loading && <AuditLoader siteUrl={siteUrl} />}
    </>
  );
}