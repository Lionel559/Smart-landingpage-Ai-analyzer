import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Globe2,
  LineChart,
  Lock,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Smartphone,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ShareReportButton from "@/components/report/ShareReportButton";
import ReportPdfButton from "@/components/report/ReportPdfButton";
import type { AuditPdfData } from "@/lib/generateAuditPdf";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";
import {
  confidenceExplanation,
  getAnalysisModeLabel,
  isScannerFallbackMode,
} from "@/lib/auditAccuracy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

type ConsultantFinding = {
  issue: string;
  evidence: string;
  fix: string;
  impact: string;
  confidence?: number;
};

type QuickWins = {
  headlineFix?: string;
  ctaFix?: string;
  trustFix?: string;
};

type VisualScores = {
  visualTrustScore?: number;
  ctaVisibilityScore?: number;
  readabilityScore?: number;
  mobileClarityScore?: number;
  persuasionScore?: number;
};

type VisualOverlay = {
  type?: string;
  label?: string;
  evidence?: string;
  severity?: string;
};

const getAudit = cache(async (id: string) => {
  try {
    return await prisma.audit.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("PUBLIC REPORT FETCH ERROR:", error);
    return null;
  }
});

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asConsultantFindings(value: unknown): ConsultantFinding[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = asRecord(item);

      return {
        issue: String(record.issue || ""),
        evidence: String(record.evidence || ""),
        fix: String(record.fix || ""),
        impact: String(record.impact || ""),
        confidence:
          typeof record.confidence === "number"
            ? record.confidence
            : undefined,
      };
    })
    .filter((item) => item.issue || item.evidence || item.fix || item.impact);
}

function asQuickWins(value: unknown): QuickWins {
  const record = asRecord(value);

  return {
    headlineFix: String(record.headlineFix || ""),
    ctaFix: String(record.ctaFix || ""),
    trustFix: String(record.trustFix || ""),
  };
}

function asVisualScores(value: unknown): VisualScores {
  const record = asRecord(value);

  return {
    visualTrustScore:
      typeof record.visualTrustScore === "number"
        ? record.visualTrustScore
        : undefined,
    ctaVisibilityScore:
      typeof record.ctaVisibilityScore === "number"
        ? record.ctaVisibilityScore
        : undefined,
    readabilityScore:
      typeof record.readabilityScore === "number"
        ? record.readabilityScore
        : undefined,
    mobileClarityScore:
      typeof record.mobileClarityScore === "number"
        ? record.mobileClarityScore
        : undefined,
    persuasionScore:
      typeof record.persuasionScore === "number"
        ? record.persuasionScore
        : undefined,
  };
}

function asVisualOverlays(value: unknown): VisualOverlay[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = asRecord(item);

      return {
        type: String(record.type || ""),
        label: String(record.label || ""),
        evidence: String(record.evidence || ""),
        severity: String(record.severity || ""),
      };
    })
    .filter((item) => item.label || item.evidence);
}

function getDomain(siteUrl: string) {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    return siteUrl.replace(/^Uploaded screenshot:\s*/i, "") || "Audit report";
  }
}

function getFavicon(siteUrl: string) {
  try {
    const domain = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "/icon.png";
  }
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function healthLabel(score: number) {
  if (score >= 80) return "Strong conversion health";
  if (score >= 65) return "Moderate conversion health";
  if (score >= 45) return "Conversion friction detected";
  return "Critical conversion leakage";
}

function healthTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 65) return "border-blue-200 bg-blue-50 text-blue-700";
  if (score >= 45) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#2563eb";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!audit) {
    return {
      title: "Report not found | PageDoctor AI",
      robots: { index: false, follow: false },
    };
  }

  if (!audit.isPublic) {
    return {
      title: "Private report | PageDoctor AI",
      description: "This PageDoctor AI report is private.",
      robots: { index: false, follow: false },
    };
  }

  const domain = getDomain(audit.siteUrl);
  const title = `PageDoctor AI CRO report for ${domain}`;
  const industry = audit.industry || "General Business";
  const description = `${industry} conversion audit with a ${audit.health}% health score, ${audit.confidence}% AI confidence, and consultant-grade CRO findings.`;
  const image =
    audit.screenshotUrl && audit.screenshotUrl.startsWith("http")
      ? audit.screenshotUrl
      : `${appUrl}/icon.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/report/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${appUrl}/report/${id}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${domain} PageDoctor AI audit report`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function StatePage({
  icon,
  title,
  copy,
  actionLabel = "Visit PageDoctor AI",
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  actionLabel?: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_46%,#f7f7fb_100%)] px-5 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/80 bg-white/80 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            {icon}
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            {copy}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            {actionLabel}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function ScoreRing({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  const color = scoreColor(value);

  return (
    <div className="group rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}%
          </p>
        </div>
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${value * 3.6}deg, #e2e8f0 0deg)`,
          }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  copy,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-xs font-bold uppercase tracking-[0.18em] ${
          dark ? "text-blue-200" : "text-blue-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-2xl font-bold tracking-tight md:text-3xl ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {copy && (
        <p
          className={`mt-3 max-w-3xl text-sm leading-7 md:text-base ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {copy}
        </p>
      )}
    </div>
  );
}

export default async function PublicReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return (
      <StatePage
        icon={<BarChart3 size={22} />}
        title="No public report found."
        copy="This audit report does not exist, was deleted, or the link is no longer available."
        actionLabel="Start a new audit"
      />
    );
  }

  if (!audit.isPublic) {
    return (
      <StatePage
        icon={<Lock size={22} />}
        title="This report is private."
        copy="The owner has turned off public access for this PageDoctor AI report."
      />
    );
  }

  const domain = getDomain(audit.siteUrl);
  const favicon = getFavicon(audit.siteUrl);
  const generatedAt = formatDate(audit.createdAt);
  const findings = asStringArray(audit.findings);
  const roadmap = asStringArray(audit.roadmap);
  const revenueNotes = asStringArray(audit.revenueNotes);
  const consultantFindings = asConsultantFindings(audit.consultantFindings);
  const quickWins = asQuickWins(audit.quickWins);
  const visualLabels = asStringArray(audit.visualLabels);
  const industry = audit.industry || "General Business";
  const industryConfidence = audit.industryConfidence ?? 0;
  const industryReasons = asStringArray(audit.industryReasons);
  const aiFixes = asRecord(audit.aiFixes);
  const analysisMode =
    typeof aiFixes.analysisMode === "string" ? aiFixes.analysisMode : "";
  const fallbackMode = isScannerFallbackMode(analysisMode);
  const visualScores = asVisualScores(aiFixes.visualScores);
  const visualOverlays = asVisualOverlays(
    aiFixes.visualOverlays || audit.visualFlags
  );
  const reportPath = `/report/${audit.id}`;

  const pdfData: AuditPdfData = {
    siteUrl: audit.siteUrl,
    seo: audit.seo,
    ux: audit.ux,
    cta: audit.cta,
    trust: audit.trust,
    mobile: audit.mobile,
    health: audit.health,
    critical: audit.critical,
    medium: audit.medium,
    minor: audit.minor,
    confidence: audit.confidence,
    findings,
    summary: audit.summary,
    roadmap,
    revenueNotes,
    consultantFindings,
    quickWins,
    visualLabels,
    screenshotUrl: audit.screenshotUrl,
    createdAt: audit.createdAt.toISOString(),
    industry,
    industryConfidence,
    industryReasons,
  };

  const rewriteCards = [
    {
      label: "Headline",
      before: "Current hero message may not make the outcome obvious fast enough.",
      after:
        quickWins.headlineFix ||
        "Lead with the audience, outcome, and differentiator in one sharp line.",
    },
    {
      label: "CTA",
      before: "Generic action language can make the next step feel lower value.",
      after:
        quickWins.ctaFix ||
        "Use a specific action CTA that tells visitors exactly what they get.",
    },
    {
      label: "Trust",
      before: "Proof may be too far from the moments where visitors decide.",
      after:
        quickWins.trustFix ||
        "Place concise proof beside the first major conversion action.",
    },
  ];

  const displayedFindings: ConsultantFinding[] = consultantFindings.length
    ? consultantFindings
    : findings.map((issue) => ({
        issue,
        evidence: "Not enough visual evidence detected.",
        fix: "Review this section manually and connect the recommendation to a visible page element.",
        impact:
          "Improved clarity can reduce hesitation and help visitors move toward action.",
      }));

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_42%,#fbfbfd_100%)] text-slate-950">
      <div className="border-b border-white/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">
                PageDoctor AI
              </p>
              <p className="text-xs text-slate-500">
                Public CRO report
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <ShareReportButton path={reportPath} />
            <ReportPdfButton auditData={pdfData} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="overflow-hidden rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <img
                  src={favicon}
                  alt=""
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${healthTone(
                        audit.health
                      )}`}
                    >
                      <BadgeCheck size={13} />
                      {healthLabel(audit.health)}
                    </div>

                    {audit.industry && (
                      <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        Detected Industry: {industry} &bull;{" "}
                        {industryConfidence}% confidence
                      </div>
                    )}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                    Conversion audit for {domain}
                  </h1>
                  <p className="mt-4 break-words text-sm leading-7 text-slate-600 md:text-base">
                    {audit.siteUrl}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 max-w-4xl text-base leading-8 text-slate-700 md:text-lg">
              {audit.summary}
            </p>

            <div className="mt-5 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-950">
                  AI accuracy note
                </p>
                <ConfidenceBadge confidence={audit.confidence} />
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI analysis is based on available page data and screenshots.
                Results may not be 100% perfect, but they provide useful
                optimization guidance.
              </p>

              <p className="mt-3 text-xs font-semibold text-blue-700">
                {confidenceExplanation}
              </p>

              {analysisMode && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Analysis mode: {getAnalysisModeLabel(analysisMode)}
                </p>
              )}

              {fallbackMode && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  <span>
                    Some page data was unavailable, so this audit may be less
                    accurate.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                  <CalendarClock size={14} />
                  Generated
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {generatedAt}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                  <Eye size={14} />
                  Audit Confidence
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {audit.confidence}% consultant confidence
                </p>
                <div className="mt-3">
                  <ConfidenceBadge confidence={audit.confidence} />
                </div>
              </div>
              {audit.industry && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-indigo-500">
                    <BadgeCheck size={14} />
                    Industry
                  </div>
                  <p className="mt-2 text-sm font-semibold text-indigo-950">
                    {industry} &bull; {industryConfidence}% confidence
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                  <Smartphone size={14} />
                  Device Readiness
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {audit.mobile}% mobile conversion score
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                  <LineChart size={14} />
                  AI Model Signal
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {audit.confidence}% evidence confidence
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[36px] border border-white/80 bg-slate-950 p-4 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between px-2 py-2 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                  Screenshot Preview
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Visual evidence reviewed by AI
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {audit.health}%
              </div>
            </div>

            {audit.screenshotUrl ? (
              <div className="mt-4 max-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-white">
                <img
                  src={audit.screenshotUrl}
                  alt={`${domain} landing page screenshot`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            ) : (
              <div className="mt-4 flex min-h-[360px] items-center justify-center rounded-[28px] border border-white/10 bg-white/10 p-8 text-center text-sm text-slate-300">
                No screenshot was attached to this audit.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <ScoreRing label="SEO" value={audit.seo} icon={<Globe2 size={20} />} />
          <ScoreRing label="UX" value={audit.ux} icon={<Sparkles size={20} />} />
          <ScoreRing
            label="CTA"
            value={audit.cta}
            icon={<MousePointerClick size={20} />}
          />
          <ScoreRing
            label="Trust"
            value={audit.trust}
            icon={<ShieldCheck size={20} />}
          />
          <ScoreRing
            label="Mobile"
            value={audit.mobile}
            icon={<Smartphone size={20} />}
          />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
            <SectionHeader
              eyebrow="Visual Insight Panel"
              title="What the AI saw"
              copy="Visual labels and CRO warnings are grounded in screenshot and DOM evidence from the audit."
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {(visualLabels.length
                ? visualLabels
                : ["No visual labels were stored for this audit."]
              ).map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-7 grid gap-3">
              {[
                ["Visual trust", visualScores.visualTrustScore || audit.trust],
                ["CTA visibility", visualScores.ctaVisibilityScore || audit.cta],
                ["Readability", visualScores.readabilityScore || audit.ux],
                ["Mobile clarity", visualScores.mobileClarityScore || audit.mobile],
                ["Persuasion", visualScores.persuasionScore || audit.health],
              ].map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-slate-950">
                      {score}%
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
            <SectionHeader
              eyebrow="CRO Warnings"
              title="Persuasion weaknesses"
              copy="These are the strongest visual or evidence-based friction zones surfaced by the AI."
            />

            <div className="mt-6 grid gap-4">
              {(visualOverlays.length
                ? visualOverlays
                : consultantFindings.slice(0, 3).map((item) => ({
                    label: item.issue,
                    evidence: item.evidence,
                    severity: "medium",
                  }))
              ).map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">
                        {item.label || "Visual friction detected"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {item.evidence ||
                          "Not enough visual evidence detected."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
          <SectionHeader
            eyebrow="Consultant Findings"
            title="Conversion issues and fixes"
            copy="Each item explains what was detected, why it matters, and the recommended CRO move."
          />

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {displayedFindings.map((finding, index) => (
              <article
                key={`${finding.issue}-${index}`}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      {index + 1}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Finding
                    </p>
                  </div>
                  {finding.confidence && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {finding.confidence}% confidence
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-bold leading-8 text-slate-950">
                  {finding.issue}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {finding.evidence || "Not enough visual evidence detected."}
                </p>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    Recommended Fix
                  </p>
                  <p className="mt-2 text-sm font-medium leading-7 text-blue-950">
                    {finding.fix}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Expected Impact
                  </p>
                  <p className="mt-2 text-sm font-medium leading-7 text-emerald-950">
                    {finding.impact}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8 xl:col-span-2">
            <SectionHeader
              eyebrow="Optimization Roadmap"
              title="Priority execution plan"
            />

            <div className="mt-7 grid gap-4">
              {(roadmap.length
                ? roadmap
                : ["No roadmap items were generated for this report."]
              ).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-950">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium leading-7 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-slate-950 p-6 text-white shadow-sm md:p-8">
            <SectionHeader
              eyebrow="Revenue Notes"
              title="Commercial interpretation"
              dark
            />

            <div className="mt-7 space-y-4">
              {(revenueNotes.length
                ? revenueNotes
                : ["No revenue notes were generated for this report."]
              ).map((note, index) => (
                <div
                  key={`${note}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp
                      size={18}
                      className="mt-1 shrink-0 text-emerald-300"
                    />
                    <p className="text-sm leading-7 text-slate-100">
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
          <SectionHeader
            eyebrow="Rewrite Suggestions"
            title="Before and after CRO improvements"
            copy="Fast copy upgrades for the highest-friction persuasion areas."
          />

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {rewriteCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-950">
                    {item.label} Upgrade
                  </p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Wand2 size={18} />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Before
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.before}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    After
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-blue-950">
                    {item.after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-4 border-t border-slate-200 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Public report generated by PageDoctor AI.
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={16} />
            Last generated {generatedAt}
          </div>
        </footer>
      </div>
    </main>
  );
}
