"use client";

import { AuditDataType } from "@/components/dashboard/DashboardClient";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  Clock3,
  BrainCircuit,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import ShareReportButton from "@/components/report/ShareReportButton";
import ReportPrivacyToggle from "@/components/report/ReportPrivacyToggle";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";
import { confidenceExplanation } from "@/lib/auditAccuracy";

type Props = {
  reportHistory: AuditDataType[];
  onReportVisibilityChange?: (id: string, isPublic: boolean) => void;
  onReportDeleted?: (id: string) => void;
  onReportRestored?: (report: AuditDataType) => void;
};

export default function RecentReports({
  reportHistory,
  onReportVisibilityChange,
  onReportDeleted,
  onReportRestored,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const deleteAudit = async (report: AuditDataType) => {
    if (!report.id || deletingId) return;

    const confirmed = window.confirm(
      `Delete this audit report for ${report.siteUrl}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(report.id);
    setErrorMsg("");
    setStatusMsg("Deleting report...");
    onReportDeleted?.(report.id);

    try {
      const res = await fetch(`/api/audits/${report.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Unable to delete audit");
      }

      setStatusMsg("Report deleted.");

      setTimeout(() => {
        setStatusMsg("");
      }, 2200);
    } catch (error) {
      onReportRestored?.(report);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to delete audit. Please try again."
      );
      setStatusMsg("");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ui-card rounded-[32px] p-5 md:p-8 mt-10 overflow-hidden relative">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100 blur-[90px] opacity-70"></div>

      <div className="relative z-10">
        <div className="flex flex-col gap-4 mb-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Database size={18} />
            </div>

            <div>
              <h3 className="text-2xl font-bold">Recent Audit Database</h3>
              <p className="text-sm text-gray-400">
                Stored conversion intelligence reports
              </p>
            </div>
          </div>

          {(statusMsg || errorMsg) && (
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                errorMsg
                  ? "border-red-100 bg-red-50 text-red-600"
                  : "border-blue-100 bg-blue-50 text-blue-700"
              }`}
            >
              {!errorMsg && statusMsg === "Deleting report..." && (
                <Loader2 size={15} className="animate-spin" />
              )}
              {errorMsg || statusMsg}
            </div>
          )}
        </div>

        {reportHistory.length === 0 ? (
          <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Database size={22} />
            </div>

            <h4 className="mt-6 text-2xl font-bold text-slate-900">
              No audit history yet.
            </h4>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Run a URL audit or upload a screenshot above. Completed audits
              will appear here with share links, PDF exports and history
              controls.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="group bg-white rounded-[26px] border border-slate-200 p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-blue-600 font-semibold truncate text-[15px] max-w-full">
                      {report.siteUrl}
                    </p>

                    {report.isPublic === false && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        Private
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                    <span className="rounded-full bg-slate-50 px-3 py-1">
                      Health Score: {report.health}%
                    </span>
                    <span
                      title={confidenceExplanation}
                      className="rounded-full bg-slate-50 px-3 py-1"
                    >
                      AI Confidence: {report.confidence}%
                    </span>
                    <ConfidenceBadge confidence={report.confidence} />
                    {report.industry && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
                        Detected Industry: {report.industry} &bull;{" "}
                        {report.industryConfidence ?? 0}% confidence
                      </span>
                    )}
                    <span className="rounded-full bg-red-50 px-3 py-1 text-red-500">
                      Critical Issues: {report.critical}
                    </span>
                  </div>
              </div>

                <div className="flex flex-col gap-4 xl:items-end">
                  <div className="flex flex-wrap gap-3 items-center text-sm">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle size={15} />
                      {report.critical} Risks
                    </div>

                    <div className="flex items-center gap-2 text-blue-500">
                      <BrainCircuit size={15} />
                      AI Completed
                    </div>

                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 size={15} />
                      Stored
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock3 size={15} />
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "Just now"}
                    </div>
                  </div>

                  {report.id && (
                    <div className="flex flex-wrap gap-2">
                      <ReportPrivacyToggle
                        reportId={report.id}
                        initialIsPublic={report.isPublic ?? true}
                        onChange={(isPublic) =>
                          onReportVisibilityChange?.(
                            report.id || "",
                            isPublic
                          )
                        }
                      />

                      <Link
                        href={`/report/${report.id}`}
                        className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                        View Report
                      </Link>

                      {(report.isPublic ?? true) && (
                        <ShareReportButton
                          path={`/report/${report.id}`}
                          label="Copy Link"
                          className="min-h-9 px-3 py-2 text-xs"
                        />
                      )}

                      <button
                        type="button"
                        disabled={deletingId === report.id}
                        onClick={() => deleteAudit(report)}
                        className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === report.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
