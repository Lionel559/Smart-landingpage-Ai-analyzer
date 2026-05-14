"use client";

import { useEffect, useState } from "react";

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

export type AuditDataType = {
  id?: string;
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
  findings: string[];
  summary: string;
  roadmap: string[];
  revenueNotes: string[];
  screenshotUrl?: string;

heroWeak?: boolean;
ctaWeak?: boolean;
trustWeak?: boolean;
trustDetected?: boolean;
visualFlags?: string[];

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

export default function DashboardClient() {
  const [auditData, setAuditData] =
    useState<AuditDataType | null>(null);

  const [reportHistory, setReportHistory] =
    useState<AuditDataType[]>([]);

  const [fixResult, setFixResult] = useState<any>(null);

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
      } catch (error) {
        console.log(error);
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

      const data = await res.json();

      setFixResult(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingFix(false);
    }
  };

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

            {/* ANALYZER */}
            <div className="mt-6 md:mt-8">
              <AnalyzerBox
                setAuditData={setAuditData}
                setReportHistory={setReportHistory}
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
                          {25 + auditData.critical * 3}%–
                          {40 + auditData.medium * 2}%
                        </span>

                        <span className="mx-3 text-slate-300 hidden sm:inline">
                          •
                        </span>

                        <span className="block sm:inline mt-1 sm:mt-0">
                          Consultant confidence:

                          <span className="font-semibold text-blue-600 ml-2">
                            {auditData.confidence}%
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONSULTANT INTRO */}
                <div className="glass-card rounded-[28px] md:rounded-[32px] p-6 md:p-8 animate-fadeUp bg-white/75">
                  <p className="section-label">
                    AI Consultant Summary
                  </p>

                  <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mt-3 leading-tight max-w-4xl">
                    Conversion inefficiencies detected in key decision zones
                  </h3>

                  <p className="section-copy mt-4 max-w-4xl text-[15px] leading-8">
                    PageDoctor AI identified persuasion gaps, trust hesitation
                    points and structural friction currently reducing visitor
                    conversion likelihood.
                  </p>
                </div>

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
              <RecentReports reportHistory={reportHistory} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}