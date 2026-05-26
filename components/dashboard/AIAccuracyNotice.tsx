"use client";

import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { AuditDataType } from "@/components/dashboard/DashboardClient";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";
import {
  confidenceExplanation,
  getAnalysisModeLabel,
  isScannerFallbackMode,
} from "@/lib/auditAccuracy";

type Props = {
  auditData: AuditDataType;
};

export default function AIAccuracyNotice({ auditData }: Props) {
  const analysisMode =
    auditData.analysisMode || auditData.aiFixes?.analysisMode || "";
  const fallbackMode = isScannerFallbackMode(analysisMode);

  return (
    <div className="rounded-[28px] border border-blue-100 bg-white/85 p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck size={18} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900">
                AI accuracy note
              </p>
              <ConfidenceBadge confidence={auditData.confidence} />
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              AI analysis is based on available page data and screenshots.
              Results may not be 100% perfect, but they provide useful
              optimization guidance.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Info size={14} />
            Confidence means
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {confidenceExplanation}
          </p>

          {analysisMode && (
            <p className="mt-3 text-xs font-semibold text-blue-600">
              Analysis mode: {getAnalysisModeLabel(analysisMode)}
            </p>
          )}
        </div>
      </div>

      {fallbackMode && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span>
            Some page data was unavailable, so this audit may be less accurate.
          </span>
        </div>
      )}
    </div>
  );
}
