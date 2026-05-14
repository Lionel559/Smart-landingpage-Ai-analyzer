"use client";

import { AuditDataType } from "@/components/dashboard/DashboardClient";
import { generateAuditPdf } from "@/lib/generateAuditPdf";
import {
  Download,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Brain,
  ArrowUpRight,
} from "lucide-react";

type Props = {
  auditData: AuditDataType | null;
};

export default function AnalyticsPanel({ auditData }: Props) {
  const health = auditData?.health || 0;

  const downloadReport = () => {
    if (!auditData) return;
    generateAuditPdf(auditData);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8 animate-fadeUp items-stretch">
      {/* ========================= */}
      {/* HEALTH SCORE */}
      {/* ========================= */}
      <div className="ui-card rounded-[34px] p-8 xl:col-span-4 min-h-[340px]">
        <p className="section-label">
          AI Conversion Probability
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          Revenue Readiness
        </h3>

        <div className="mt-10 flex justify-center">
          <div className="relative w-48 h-48 rounded-full border-[12px] border-blue-600 flex items-center justify-center metric-ring bg-white">
            <div className="text-center">
              <span className="text-[52px] md:text-[58px] font-bold text-blue-600 tracking-[-2px]">
                {health}
              </span>

              <span className="text-2xl font-semibold text-blue-400">
                %
              </span>
            </div>

            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Brain size={18} />
            </div>
          </div>
        </div>

        <p className="text-center text-gray-900 mt-7 text-lg font-semibold">
          Moderate conversion leakage detected
        </p>

        <p className="text-center text-gray-500 mt-2 leading-7 text-sm max-w-[300px] mx-auto">
          Visitors are encountering persuasion friction before taking action.
        </p>
      </div>

      {/* ========================= */}
      {/* ISSUE MATRIX */}
      {/* ========================= */}
      <div className="ui-card rounded-[34px] p-8 xl:col-span-4 min-h-[340px]">
        <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-semibold">
          Severity Diagnostics
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-8">
          Revenue Leak Matrix
        </h3>

        <div className="space-y-8">
          {/* CRITICAL */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className="text-red-500"
                  size={18}
                />

                <span className="text-gray-700 font-medium">
                  Critical Leaks
                </span>
              </div>

              <span className="text-3xl font-bold text-red-500">
                {auditData?.critical || 0}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-red-100 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{
                  width: `${Math.min(
                    (auditData?.critical || 0) * 20,
                    100
                  )}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>

          {/* MEDIUM */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className="text-orange-500"
                  size={18}
                />

                <span className="text-gray-700 font-medium">
                  Medium Friction
                </span>
              </div>

              <span className="text-3xl font-bold text-orange-500">
                {auditData?.medium || 0}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-orange-100 overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full"
                style={{
                  width: `${Math.min(
                    (auditData?.medium || 0) * 14,
                    100
                  )}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>

          {/* MINOR */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className="text-blue-500"
                  size={18}
                />

                <span className="text-gray-700 font-medium">
                  Minor Optimizations
                </span>
              </div>

              <span className="text-3xl font-bold text-blue-500">
                {auditData?.minor || 0}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    (auditData?.minor || 0) * 25,
                    100
                  )}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* AI PRESCRIPTION */}
      {/* ========================= */}
      <div className="ui-card rounded-[34px] p-8 xl:col-span-4 min-h-[340px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-blue-100 blur-[90px] rounded-full"></div>

        <div className="relative z-10">
          <p className="section-label">
            AI Prescription Engine
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-7">
            Highest Impact Actions
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <ArrowUpRight
                size={16}
                className="mt-1 text-blue-600 shrink-0"
              />

              <p className="text-gray-700 leading-7">
                Rewrite headline messaging to improve clarity and urgency.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <ArrowUpRight
                size={16}
                className="mt-1 text-blue-600 shrink-0"
              />

              <p className="text-gray-700 leading-7">
                Improve CTA visibility above the fold for better engagement.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <ArrowUpRight
                size={16}
                className="mt-1 text-blue-600 shrink-0"
              />

              <p className="text-gray-700 leading-7">
                Add trust proof near visitor hesitation points.
              </p>
            </div>
          </div>

          <button
            onClick={downloadReport}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            <Download size={18} />
            Download Audit PDF
          </button>
        </div>
      </div>
    </div>
  );
}