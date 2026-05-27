"use client";

import { Globe2, Lock, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  reportId: string;
  initialIsPublic?: boolean;
  onChange?: (isPublic: boolean) => void;
};

export default function ReportPrivacyToggle({
  reportId,
  initialIsPublic = true,
  onChange,
}: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = async () => {
    if (loading) return;

    const nextValue = !isPublic;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/audits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reportId,
          isPublic: nextValue,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to update visibility");
      }

      setIsPublic(nextValue);
      onChange?.(nextValue);
    } catch {
      setErrorMsg("Unable to update visibility.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 ${
          isPublic
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-100 text-slate-600"
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isPublic ? (
          <Globe2 size={14} />
        ) : (
          <Lock size={14} />
        )}
        {isPublic ? "Public" : "Private"}
      </button>

      {errorMsg && (
        <span className="text-[11px] font-semibold text-red-500">
          {errorMsg}
        </span>
      )}
    </span>
  );
}
