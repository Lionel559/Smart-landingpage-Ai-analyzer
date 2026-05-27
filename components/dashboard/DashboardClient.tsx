"use client";

import { useEffect, useState } from "react";
import { Clock3, Crown, Gauge } from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AnalyzerBox from "@/components/dashboard/AnalyzerBox";
import ScoreCards from "@/components/dashboard/ScoreCards";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import RecentReports from "@/components/dashboard/RecentReports";
import AuditResults from "@/components/dashboard/AuditResults";
import VisualHeatmap from "@/components/dashboard/VisualHeatmap";
import RevenueEstimator from "@/components/dashboard/RevenueEstimator";
import RewriteLab from "@/components/dashboard/RewriteLab";
import Link from "next/link";
import ShareReportButton from "@/components/report/ShareReportButton";
import AIAccuracyNotice from "@/components/dashboard/AIAccuracyNotice";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";

export type VisualOverlay = {
  type: "weak_cta" | "clutter" | "missing_trust" | "poor_hierarchy";
  label: string;
  evidence: string;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: "critical" | "medium" | "minor";
};

export type VisualScores = {
  visualTrustScore?: number;
  ctaVisibilityScore?: number;
  readabilityScore?: number;
  mobileClarityScore?: number;
  persuasionScore?: number;
};

export type AuditDataType = {
  id?: string;
  createdAt?: string;
  siteUrl: string;
  seo: number;
  ux: number;
  cta: number;
  trust: number;
  mobile: number;
  health: number;
  critical: number;
  medium: number;
  minor: number;
  confidence: number;
  industry?: string | null;
  industryConfidence?: number | null;
  industryReasons?: string[] | null;
  findings: string[];
  summary: string;
  roadmap: string[];
  revenueNotes: string[];
  screenshotUrl?: string;
  isPublic?: boolean;

  heroWeak?: boolean;
  ctaWeak?: boolean;
  trustWeak?: boolean;
  trustDetected?: boolean;
  visualFlags?: string[] | VisualOverlay[];
  visualOverlays?: VisualOverlay[];
  visualScores?: VisualScores;
  aiFixes?: {
    visualScores?: VisualScores;
    visualOverlays?: VisualOverlay[];
    analysisMode?: string;
  };
  analysisMode?: string;
  visualTrustScore?: number;
  ctaVisibilityScore?: number;
  readabilityScore?: number;
  mobileClarityScore?: number;
  persuasionScore?: number;

  consultantFindings?: {
    issue: string;
    evidence: string;
    fix: string;
    impact: string;
  }[];

  quickWins?: {
    headlineFix?: string;
    ctaFix?: string;
    trustFix?: string;
  };

  visualLabels?: string[];
};

export type DashboardUsage = {
  plan: string;
  scansUsed: number;
  limit: number | null;
  resetAt: string | null;
};

type DashboardClientProps = {
  initialUsage: DashboardUsage;
};

const formatResetCountdown = (resetAt?: string | null) => {
  if (!resetAt) {
    return "";
  }

  const resetTime = new Date(resetAt).getTime();
  const diff = resetTime - Date.now();

  if (!Number.isFinite(resetTime) || diff <= 0) {
    return "soon";
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const days = Math.floor(diff / dayMs);
  const hours = Math.ceil((diff % dayMs) / hourMs);

  if (days > 0 && hours > 0) {
    return `${days}d ${hours}h`;
  }

  if (days > 0) {
    return `${days}d`;
  }

  return `${Math.max(1, Math.ceil(diff / hourMs))}h`;
};

function UsageStrip({ usage }: { usage: DashboardUsage }) {
  const isFree = usage.plan.toLowerCase() === "free";
  const limit = usage.limit || 0;
  const used = isFree ? Math.min(usage.scansUsed, limit) : usage.scansUsed;
  const progress = isFree && limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
  const resetCountdown = formatResetCountdown(usage.resetAt);

  return (
    <div className="glass-card rounded-[24px] px-5 py-4 bg-white/80 animate-fadeUp">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            {isFree ? <Gauge size={18} /> : <Crown size={18} />}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-blue-600">
              Weekly Usage
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              {isFree
                ? `${used} of ${limit} free audits used this week`
                : `Unlimited audits active on ${usage.plan}`}
            </p>

            {isFree && resetCountdown && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Clock3 size={14} />
                Resets in {resetCountdown}
              </p>
            )}
          </div>
        </div>

        {isFree && (
          <div className="w-full lg:w-[280px]">
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardClient({
  initialUsage,
}: DashboardClientProps) {
  const [usage, setUsage] = useState(initialUsage);

  const [auditData, setAuditData] =
    useState<AuditDataType | null>(null);

  const [reportHistory, setReportHistory] =
    useState<AuditDataType[]>([]);

  const [fixResult, setFixResult] =
    useState<{ fix?: string; result?: string } | null>(null);

  const [loadingFix, setLoadingFix] =
    useState(false);

  useEffect(() => {
    const loadAudits = async () => {
      try {
        const res = await fetch("/api/audits");

        const data = await res.json();

        setReportHistory(data);

        if (data.length > 0) {
          setAuditData(data[0]);
        }
      } catch {
        setReportHistory([]);
      }
    };

    loadAudits();
  }, []);

  const handleFix = async (label: string) => {
    try {
      setLoadingFix(true);

      setFixResult(null);

      const res = await fetch("/api/fix-section", {
        method: "POST",

        body: JSON.stringify({
          label,
          url: auditData?.siteUrl,
        }),
      });

      const data = (await res.json()) as {
        fix?: string;
        result?: string;
      };

      setFixResult(data);
    } catch {
      setFixResult({
        result: "Unable to generate a fix right now. Please try again.",
      });
    } finally {
      setLoadingFix(false);
    }
  };

  const handleReportVisibilityChange = (
    id: string,
    isPublic: boolean
  ) => {
    setReportHistory((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, isPublic } : report
      )
    );

    setAuditData((prev) =>
      prev?.id === id ? { ...prev, isPublic } : prev
    );
  };

  const handleReportDeleted = (id: string) => {
    const nextHistory = reportHistory.filter(
      (report) => report.id !== id
    );

    setReportHistory(nextHistory);

    setAuditData((prev) =>
      prev?.id === id ? nextHistory[0] || null : prev
    );
  };

  const handleReportRestored = (report: AuditDataType) => {
    setReportHistory((prev) => {
      if (prev.some((item) => item.id === report.id)) {
        return prev;
      }

      return [report, ...prev].sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bTime - aTime;
      });
    });

    setAuditData((prev) => prev || report);
  };

  const detectedIndustry = auditData?.industry || "General Business";
  const industryConfidence = auditData?.industryConfidence ?? 0;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-transparent">
      {/* BACKGROUND GLOWS */}
      <div className="blue-glow top-[-120px] right-[-120px]" />

      <div className="indigo-glow bottom-[-120px] left-[-120px]" />

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 lg:ml-[270px] relative z-10 overflow-x-hidden">
        <div className="px-4 sm:px-5 md:px-7 lg:px-10 py-5 md:py-7 lg:py-8">
          <div className="max-w-[1500px] mx-auto">
            {/* TOPBAR */}
            <Topbar />

            <UsageStrip usage={usage} />

            {/* ANALYZER */}
            <div className="mt-6 md:mt-8">
              <AnalyzerBox
                setAuditData={setAuditData}
                setReportHistory={setReportHistory}
                usage={usage}
                setUsage={setUsage}
              />
            </div>

            {/* AUDIT CONTENT */}
            {auditData && (
              <div className="space-y-10 md:space-y-12 mt-10">
                {/* ALERT STRIP */}
                <div className="glass-card rounded-[28px] md:rounded-[32px] px-5 md:px-7 py-5 md:py-6 animate-fadeUp border border-red-100 relative overflow-hidden bg-white/80">
                  <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-red-100 blur-[100px] opacity-60 rounded-full"></div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-semibold">
                        Conversion Leakage Detected
                      </p>

                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 leading-tight">
                        AI detected major persuasion friction reducing
                        conversion potential
                      </h2>

                      <p className="text-slate-600 mt-3 leading-7 max-w-4xl text-sm md:text-base">
                        Estimated leakage range:

                        <span className="font-semibold text-slate-900 ml-2">
                          {25 + auditData.critical * 3}%-
                          {40 + auditData.medium * 2}%
                        </span>

                        <span className="mx-3 text-slate-300 hidden sm:inline">
                          &bull;
                        </span>

                        <span className="block sm:inline mt-1 sm:mt-0">
                          Consultant confidence:

                          <span className="font-semibold text-blue-600 ml-2">
                            {auditData.confidence}%
                          </span>
                        </span>

                        <span className="ml-0 mt-2 inline-flex sm:ml-2 sm:mt-0">
                          <ConfidenceBadge
                            confidence={auditData.confidence}
                          />
                        </span>

                        <span className="mx-3 text-slate-300 hidden lg:inline">
                          &bull;
                        </span>

                        <span className="block lg:inline mt-1 lg:mt-0">
                          Detected Industry:

                          <span className="font-semibold text-indigo-600 ml-2">
                            {detectedIndustry} &bull; {industryConfidence}%
                            confidence
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONSULTANT INTRO */}
                <div className="glass-card rounded-[28px] md:rounded-[32px] p-6 md:p-8 animate-fadeUp bg-white/75">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="section-label">
                        AI Consultant Summary
                      </p>

                      <div className="mt-3 inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                        Detected Industry: {detectedIndustry} &bull;{" "}
                        {industryConfidence}% confidence
                      </div>

                      <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mt-3 leading-tight max-w-4xl">
                        Conversion inefficiencies detected in key decision zones
                      </h3>

                      <p className="section-copy mt-4 max-w-4xl text-[15px] leading-8">
                        PageDoctor AI identified persuasion gaps, trust hesitation
                        points and structural friction currently reducing visitor
                        conversion likelihood.
                      </p>

                      {auditData.summary && (
                        <p className="mt-4 max-w-4xl rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm leading-7 text-slate-700">
                          {auditData.summary}
                        </p>
                      )}
                    </div>

                    {auditData.id && (
                      <div className="flex flex-wrap gap-3 shrink-0">
                        <Link
                          href={`/report/${auditData.id}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                          View Public Report
                        </Link>

                        {(auditData.isPublic ?? true) && (
                          <ShareReportButton
                            path={`/report/${auditData.id}`}
                            label="Copy Report Link"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <AIAccuracyNotice auditData={auditData} />

                {/* REVENUE */}
                <RevenueEstimator auditData={auditData} />

                {/* HEATMAP */}
                {auditData.screenshotUrl && (
                  <VisualHeatmap
                    auditData={auditData}
                    handleFix={handleFix}
                    loadingFix={loadingFix}
                    fixResult={fixResult}
                  />
                )}

                {/* REWRITE LAB */}
                <RewriteLab auditData={auditData} />

                {/* SCORE CARDS */}
                <ScoreCards auditData={auditData} />

                {/* ANALYTICS */}
                <AnalyticsPanel auditData={auditData} />

                {/* RESULTS */}
                <AuditResults auditData={auditData} />
              </div>
            )}

            {/* HISTORY */}
            <div className="mt-14 md:mt-16 pb-10">
              <RecentReports
                reportHistory={reportHistory}
                onReportVisibilityChange={handleReportVisibilityChange}
                onReportDeleted={handleReportDeleted}
                onReportRestored={handleReportRestored}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
