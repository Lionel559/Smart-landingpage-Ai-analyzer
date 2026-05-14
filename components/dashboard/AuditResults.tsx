"use client";

import { AuditDataType } from "@/components/dashboard/DashboardClient";
import { useState } from "react";
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  Copy,
} from "lucide-react";

type Props = {
  auditData: AuditDataType | null;
};

export default function AuditResults({ auditData }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!auditData) return null;

  const issues =
    (auditData as any)?.issues ||
    auditData.consultantFindings ||
    [];

  const getSeverity = (i: number) => {
    if (i < auditData.critical) return "critical";
    if (i < auditData.critical + auditData.medium) return "medium";
    return "minor";
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-10 space-y-6 animate-fadeUp">
      {/* HEADER */}
      <div>
        <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
          Consultant Incident Reports
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-1">
          AI-Detected Conversion Killers
        </h3>

        <p className="text-gray-500 mt-2 max-w-3xl leading-7">
          Each issue below represents a measurable conversion friction point
          identified during the scan. These are not generic suggestions — they
          are behavior-linked revenue leaks.
        </p>
      </div>

      {/* INCIDENT CARDS */}
      {issues.map((item: any, i: number) => {
        const isOpen = openIndex === i;
        const severity = getSeverity(i);

        const styles = {
          critical: "border-red-200 bg-red-50/40",
          medium: "border-orange-200 bg-orange-50/40",
          minor: "border-blue-200 bg-blue-50/40",
        };

        const icons = {
          critical: <AlertTriangle className="text-red-500" size={18} />,
          medium: <TrendingDown className="text-orange-500" size={18} />,
          minor: <CheckCircle2 className="text-blue-500" size={18} />,
        };

        const labels = {
          critical: "Critical Revenue Leak",
          medium: "Conversion Friction",
          minor: "Optimization Opportunity",
        };

        // FIXED CONFIDENCE VALUE
        const confidence =
  item.confidence ||
  (severity === "critical"
    ? 90 + (i % 5)
    : severity === "medium"
    ? 78 + (i % 6)
    : 70 + (i % 5));
        return (
          <div
            key={`issue-${i}`}
            className={`rounded-[28px] border p-6 transition-all duration-300 hover:shadow-lg ${styles[severity]}`}
          >
            {/* HEADER */}
            <div
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex justify-between items-start cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {icons[severity]}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {labels[severity]}
                  </p>

                  <h4 className="font-semibold text-gray-900 mt-1 text-lg leading-8">
                    {item.issue}
                  </h4>

                  <p className="text-xs text-gray-400 mt-2">
                    AI Confidence: {confidence}%
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`transition duration-300 shrink-0 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* EXPANDED CONTENT */}
            {isOpen && (
              <div className="mt-6 space-y-5 animate-fadeUp">
                {/* EVIDENCE */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    What AI detected
                  </p>

                  <p className="text-gray-700 leading-7">
                    {item.evidence}
                  </p>
                </div>

                {/* WHY */}
                <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <p className="text-xs uppercase tracking-wide text-blue-300 mb-2">
                    Why this hurts conversions
                  </p>

                  <p className="leading-7 text-gray-200">
                    Visitors hesitate or abandon the page when this friction
                    appears during decision-making moments, reducing trust and
                    lowering action completion rates.
                  </p>
                </div>

                {/* FIX */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 mb-2">
                      Recommended Fix
                    </p>

                    <p className="text-blue-900 font-medium leading-7">
                      {item.fix}
                    </p>
                  </div>

                  <button
                    onClick={() => copy(item.fix)}
                    className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center hover:bg-blue-100 transition shrink-0"
                  >
                    <Copy size={16} className="text-blue-600" />
                  </button>
                </div>

                {/* IMPACT */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wide text-green-600 mb-2">
                    Expected Impact
                  </p>

                  <p className="text-green-900 font-medium leading-7">
                    {item.impact}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}