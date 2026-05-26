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
  const [loadingLabel, setLoadingLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const getErrorText = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const isAbortError = (error: unknown) =>
    error instanceof Error && error.name === "AbortError";

  const normalizeUrl = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }

    return url;
  };

  const prepareScreenshotFile = async (file: File) => {
    if (file.size <= 4.5 * 1024 * 1024) {
      return file;
    }

    let objectUrl = "";

    try {
      objectUrl = URL.createObjectURL(file);
      const image = new Image();

      const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = objectUrl;
      });

      const img = await loaded;
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");

      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return file;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.82);
      });

      return blob || file;
    } catch (error) {
      console.log("SCREENSHOT RESIZE ERROR:", error);
      return file;
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
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

    const cleanUrl = normalizeUrl(siteUrl.trim());

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    setLoadingLabel(cleanUrl);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    try {
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

      const data = await res.json();

      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Scan failed");
      }

      await hydrateAuditUI(data);
    } catch (error: unknown) {
      console.log("SCAN ERROR:", error);

      if (isAbortError(error)) {
        setErrorMsg(
          "Audit timed out. Some websites are slow or block scanners."
        );
      } else {
        setErrorMsg(
          getErrorText(error, "Scan failed. Please try another page.")
        );
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      setLoadingLabel("");
    }
  };

  const handleScreenshotAudit = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a PNG, JPG, WebP or other image file.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    setLoadingLabel(file.name);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    try {
      const preparedFile = await prepareScreenshotFile(file);
      const formData = new FormData();

      formData.append("screenshot", preparedFile, file.name);
      formData.append("screenshotName", file.name);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Screenshot audit failed");
      }

      await hydrateAuditUI(data);
    } catch (error: unknown) {
      console.log("SCREENSHOT AUDIT ERROR:", error);

      if (isAbortError(error)) {
        setErrorMsg(
          "Screenshot audit timed out. Try a smaller screenshot or run a URL audit."
        );
      } else {
        setErrorMsg(
          getErrorText(
            error,
            "Screenshot audit failed. Please try another image."
          )
        );
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      setLoadingLabel("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="relative overflow-hidden glass-card rounded-[40px] px-6 py-7 md:px-10 md:py-10 xl:px-14 xl:py-14">
        <div className="absolute top-[-80px] right-[-40px] w-[260px] h-[260px] bg-blue-100 blur-[120px] rounded-full opacity-70"></div>
        <div className="absolute bottom-[-80px] left-[-40px] w-[240px] h-[240px] bg-indigo-100 blur-[120px] rounded-full opacity-60"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-blue-100 shadow-sm">
            <Sparkles size={14} />
            AI Conversion Intelligence Engine
          </div>

          <div className="grid xl:grid-cols-2 gap-12 mt-8 items-center">
            <div>
              <h2 className="text-[42px] md:text-[56px] leading-[1.05] tracking-[-2px] font-bold text-slate-900 max-w-[700px]">
                Diagnose why visitors are not converting
              </h2>

              <p className="text-slate-600 mt-6 text-[17px] leading-8 max-w-[620px]">
                PageDoctor AI audits landing pages like a real CRO consultant -
                identifying persuasion leaks, trust friction, CTA weaknesses
                and hidden conversion blockers reducing revenue performance.
              </p>

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

            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[34px] p-6 md:p-7 shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
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

              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleScreenshotAudit}
                className="hidden"
              />

              {errorMsg && (
                <div className="mt-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-4 text-sm flex gap-3 items-start">
                  <AlertCircle size={17} className="mt-[1px]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-4 text-sm flex gap-3 items-start">
                  <CheckCircle2 size={17} className="mt-[1px]" />
                  <span>{successMsg}</span>
                </div>
              )}

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

      {loading && <AuditLoader siteUrl={loadingLabel || siteUrl} />}
    </>
  );
}
