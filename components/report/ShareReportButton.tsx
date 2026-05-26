"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

type Props = {
  path?: string;
  label?: string;
  className?: string;
};

export default function ShareReportButton({
  path,
  label = "Copy Report Link",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = path
      ? `${window.location.origin}${path}`
      : window.location.href;

    await navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2200);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copyLink}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${className}`}
      >
        {copied ? (
          <>
            <Check size={16} className="text-emerald-600" />
            Copied
          </>
        ) : (
          <>
            {label.toLowerCase().includes("share") ? (
              <Share2 size={16} />
            ) : (
              <Copy size={16} />
            )}
            {label}
          </>
        )}
      </button>

      {copied && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-[190px] rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl">
          Public link copied.
        </div>
      )}
    </div>
  );
}
