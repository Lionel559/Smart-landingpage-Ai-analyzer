"use client";

import { Download } from "lucide-react";
import { generateAuditPdf, type AuditPdfData } from "@/lib/generateAuditPdf";

type Props = {
  auditData: AuditPdfData;
};

export default function ReportPdfButton({ auditData }: Props) {
  return (
    <button
      type="button"
      onClick={() => generateAuditPdf(auditData)}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
    >
      <Download size={16} />
      Export PDF
    </button>
  );
}
