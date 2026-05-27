import { NextResponse } from "next/server";
import type { Audit, PrismaClient } from "@prisma/client";
import { scanWebsite } from "@/lib/scanner";
import { getVisualScan } from "@/lib/visionScan";
import { generateAIAudit } from "@/lib/aiAudit";
import type { ScanPayload, VisualOverlay } from "@/lib/aiAudit";
import {
  detectWebsiteIndustry,
  type WebsiteIndustry,
  type WebsiteIndustryDetection,
} from "@/lib/industryDetection";
import { validateScanUrl } from "@/lib/validateScanUrl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const MAX_UPLOAD_BYTES = 7 * 1024 * 1024;
const FREE_WEEKLY_SCAN_LIMIT = 2;
const SCAN_RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const LIMIT_ERROR = "Weekly free scan limit reached.";

const scanUsageSelect = {
  id: true,
  plan: true,
  scansUsed: true,
  lastScanReset: true,
  planExpiresAt: true,
} as const;

type ScanRequest = {
  url: string;
  screenshotUrl: string;
  screenshotName: string;
  screenshotSource?: "uploaded" | "provided";
};

type ScoreBundle = {
  seo: number;
  ux: number;
  cta: number;
  trust: number;
  mobile: number;
};

type ScoreWeights = ScoreBundle;

type QuickWins = {
  headlineFix?: string;
  ctaFix?: string;
  trustFix?: string;
};

type ConsultantFinding = {
  issue: string;
  evidence: string;
  fix: string;
  impact: string;
  confidence?: number;
};

type AiAuditResult = {
  consultantFindings?: ConsultantFinding[];
  visualLabels?: string[];
  quickWins?: QuickWins;
  summary?: string;
  roadmap?: string[];
  revenueNotes?: string[];
  visualTrustScore?: number;
  ctaVisibilityScore?: number;
  readabilityScore?: number;
  mobileClarityScore?: number;
  persuasionScore?: number;
  visualOverlays?: VisualOverlay[];
  analysisMode?: string;
};

type WebsiteScan = {
  pageTitle?: string;
  metaDescription?: string;
  h1Text?: string;
  h2Count?: number;
  pCount?: number;
  buttonCount?: number;
  imageCount?: number;
  formCount?: number;
  inputCount?: number;
  hasTestimonials?: boolean;
  hasTrustBadges?: boolean;
  hasPricing?: boolean;
  subHeadline?: string;
  ctaTexts?: string[];
  navLinks?: string[];
  hasFAQ?: boolean;
  hasGuarantee?: boolean;
  urgencySignals?: boolean;
  socialProofSignals?: boolean;
  footerCta?: boolean;
  wordCount?: number;
  bodyTextSnippet?: string;
};

type VisualScan = {
  screenshotUrl?: string;
  aboveFoldLikelyWeak?: boolean;
  textHeavyHero?: boolean;
  lowVisualTrust?: boolean;
  footerCtaMissing?: boolean;
  modernDesignLikely?: boolean;
  ecommerceLikely?: boolean;
  fintechLikely?: boolean;
};

type ScanUsageRecord = {
  id: string;
  plan: string;
  scansUsed: number;
  lastScanReset: Date | null;
  planExpiresAt: Date | null;
};

type ScanUsagePayload = {
  plan: string;
  scansUsed: number;
  limit: number | null;
  resetAt: string | null;
};

class ScanRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const clamp = (num: number) =>
  Math.max(18, Math.min(98, Math.floor(num)));

const safeQuickWins = (quickWins?: QuickWins) => ({
  headlineFix: quickWins?.headlineFix || "",
  ctaFix: quickWins?.ctaFix || "",
  trustFix: quickWins?.trustFix || "",
});

const safeArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const safeVisualScores = (ai?: AiAuditResult) => ({
  visualTrustScore: clamp(ai?.visualTrustScore || 58),
  ctaVisibilityScore: clamp(ai?.ctaVisibilityScore || 58),
  readabilityScore: clamp(ai?.readabilityScore || 62),
  mobileClarityScore: clamp(ai?.mobileClarityScore || 62),
  persuasionScore: clamp(ai?.persuasionScore || 58),
});

const isFreePlan = (plan?: string | null) =>
  (plan || "free").toLowerCase() === "free";

const shouldResetScanUsage = (lastScanReset: Date | null, now: Date) =>
  !lastScanReset ||
  now.getTime() - lastScanReset.getTime() >= SCAN_RESET_INTERVAL_MS;

const getResetAt = (lastScanReset: Date | null, now: Date) =>
  new Date((lastScanReset || now).getTime() + SCAN_RESET_INTERVAL_MS);

const buildUsagePayload = (
  usage: ScanUsageRecord,
  now = new Date()
): ScanUsagePayload => {
  const free = isFreePlan(usage.plan);

  return {
    plan: usage.plan,
    scansUsed: usage.scansUsed,
    limit: free ? FREE_WEEKLY_SCAN_LIMIT : null,
    resetAt: free ? getResetAt(usage.lastScanReset, now).toISOString() : null,
  };
};

async function getFreshScanUsage(
  prisma: PrismaClient,
  userId: string,
  now = new Date()
): Promise<ScanUsageRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: scanUsageSelect,
  });

  if (!user) {
    return null;
  }

  if (!shouldResetScanUsage(user.lastScanReset, now)) {
    return user;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      scansUsed: 0,
      lastScanReset: now,
    },
    select: scanUsageSelect,
  });
}

async function reserveFreeScanSlot(prisma: PrismaClient, userId: string) {
  const reserved = await prisma.user.updateMany({
    where: {
      id: userId,
      scansUsed: {
        lt: FREE_WEEKLY_SCAN_LIMIT,
      },
    },
    data: {
      scansUsed: {
        increment: 1,
      },
    },
  });

  return reserved.count > 0;
}

async function refundFreeScanSlot(prisma: PrismaClient, userId: string) {
  await prisma.user.updateMany({
    where: {
      id: userId,
      scansUsed: {
        gt: 0,
      },
    },
    data: {
      scansUsed: {
        decrement: 1,
      },
    },
  });
}

const industryScoreWeights: Record<WebsiteIndustry, ScoreWeights> = {
  SaaS: {
    seo: 0.12,
    ux: 0.24,
    cta: 0.27,
    trust: 0.23,
    mobile: 0.14,
  },
  Ecommerce: {
    seo: 0.1,
    ux: 0.22,
    cta: 0.28,
    trust: 0.24,
    mobile: 0.16,
  },
  "Fintech / Payment": {
    seo: 0.14,
    ux: 0.18,
    cta: 0.2,
    trust: 0.32,
    mobile: 0.16,
  },
  "Education / School": {
    seo: 0.14,
    ux: 0.26,
    cta: 0.18,
    trust: 0.28,
    mobile: 0.14,
  },
  "Music / Entertainment": {
    seo: 0.12,
    ux: 0.28,
    cta: 0.26,
    trust: 0.14,
    mobile: 0.2,
  },
  Portfolio: {
    seo: 0.16,
    ux: 0.3,
    cta: 0.2,
    trust: 0.18,
    mobile: 0.16,
  },
  Agency: {
    seo: 0.16,
    ux: 0.22,
    cta: 0.22,
    trust: 0.24,
    mobile: 0.16,
  },
  Healthcare: {
    seo: 0.14,
    ux: 0.22,
    cta: 0.2,
    trust: 0.3,
    mobile: 0.14,
  },
  "Real Estate": {
    seo: 0.14,
    ux: 0.22,
    cta: 0.25,
    trust: 0.23,
    mobile: 0.16,
  },
  "Restaurant / Food": {
    seo: 0.12,
    ux: 0.24,
    cta: 0.28,
    trust: 0.18,
    mobile: 0.18,
  },
  Nonprofit: {
    seo: 0.14,
    ux: 0.22,
    cta: 0.26,
    trust: 0.24,
    mobile: 0.14,
  },
  "General Business": {
    seo: 0.2,
    ux: 0.2,
    cta: 0.2,
    trust: 0.2,
    mobile: 0.2,
  },
};

function isImageUrl(url: string) {
  if (url.startsWith("data:image/")) {
    return true;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return validateScanUrl(url).ok;
  }

  return false;
}

async function dataUrlFromFile(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string") {
    return "";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ScanRequestError(
      "Screenshot file is too large. Please upload an image under 7 MB."
    );
  }

  const mime = file.type || "image/png";

  if (!mime.startsWith("image/")) {
    throw new ScanRequestError("Uploaded file must be an image.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function readScanRequest(req: Request): Promise<ScanRequest> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("screenshot");
    const dataUrl = await dataUrlFromFile(file);
    const fileName =
      file && typeof file !== "string" ? file.name : "uploaded-screenshot";

    return {
      url: String(form.get("url") || ""),
      screenshotUrl:
        dataUrl || String(form.get("screenshotUrl") || "").trim(),
      screenshotName:
        fileName || String(form.get("screenshotName") || "uploaded-screenshot"),
      screenshotSource: dataUrl ? "uploaded" : "provided",
    };
  }

  const body = (await req.json()) as Record<string, unknown>;
  const screenshotDataUrl = String(body.screenshotDataUrl || "").trim();
  const screenshotUrl = String(body.screenshotUrl || "").trim();

  return {
    url: String(body.url || ""),
    screenshotUrl: screenshotDataUrl || screenshotUrl,
    screenshotName: String(body.screenshotName || "provided-screenshot"),
    screenshotSource: screenshotDataUrl ? "uploaded" : screenshotUrl ? "provided" : undefined,
  };
}

function scoreFromDom(scan: WebsiteScan, visual: VisualScan | null): ScoreBundle {
  const pageTitle = scan.pageTitle || "";
  const metaDescription = scan.metaDescription || "";
  const h1Text = scan.h1Text || "";
  const h2Count = scan.h2Count || 0;
  const pCount = scan.pCount || 0;
  const subHeadline = scan.subHeadline || "";
  const imageCount = scan.imageCount || 0;
  const buttonCount = scan.buttonCount || 0;
  const formCount = scan.formCount || 0;
  const inputCount = scan.inputCount || 0;
  const navLinks = scan.navLinks || [];
  const wordCount = scan.wordCount || 0;

  let seo = 38;
  if (pageTitle.length > 15) seo += 12;
  if (metaDescription.length > 50) seo += 12;
  if (h1Text.length > 10) seo += 8;
  if (h2Count >= 2) seo += 8;
  if (wordCount > 500) seo += 6;
  if (navLinks.length >= 3) seo += 5;

  let ux = 35;
  if (subHeadline.length > 20) ux += 12;
  if (imageCount >= 3) ux += 10;
  if (h2Count >= 3) ux += 8;
  if (pCount <= 35) ux += 7;
  if (scan.hasFAQ) ux += 5;
  if (visual?.textHeavyHero) ux -= 6;

  let cta = 30;
  if (buttonCount >= 2) cta += 10;
  if (buttonCount >= 4) cta += 8;
  if (formCount >= 1) cta += 10;
  if (scan.footerCta) cta += 8;
  if (scan.urgencySignals) cta += 6;
  if (visual?.aboveFoldLikelyWeak) cta -= 8;
  if (visual?.footerCtaMissing) cta -= 6;

  let trust = 32;
  if (scan.hasTestimonials) trust += 12;
  if (scan.hasTrustBadges) trust += 12;
  if (scan.hasGuarantee) trust += 8;
  if (scan.socialProofSignals) trust += 10;
  if (scan.hasPricing) trust += 4;
  if (visual?.lowVisualTrust) trust -= 6;

  let mobile = 36;
  if (pCount <= 25) mobile += 10;
  if (inputCount <= 4) mobile += 8;
  if (imageCount >= 2) mobile += 6;
  if (buttonCount >= 2) mobile += 6;
  if (navLinks.length <= 6) mobile += 6;

  return {
    seo: clamp(seo),
    ux: clamp(ux),
    cta: clamp(cta),
    trust: clamp(trust),
    mobile: clamp(mobile),
  };
}

function scoreFromVisual(ai: AiAuditResult): ScoreBundle {
  const visualScores = safeVisualScores(ai);

  return {
    seo: 52,
    ux: clamp(
      (visualScores.readabilityScore + visualScores.persuasionScore) / 2
    ),
    cta: visualScores.ctaVisibilityScore,
    trust: visualScores.visualTrustScore,
    mobile: visualScores.mobileClarityScore,
  };
}

function blendScores(domScores: ScoreBundle, ai: AiAuditResult): ScoreBundle {
  const visualScores = safeVisualScores(ai);

  return {
    seo: domScores.seo,
    ux: clamp(
      domScores.ux * 0.55 +
        ((visualScores.readabilityScore + visualScores.persuasionScore) / 2) *
          0.45
    ),
    cta: clamp(domScores.cta * 0.45 + visualScores.ctaVisibilityScore * 0.55),
    trust: clamp(domScores.trust * 0.45 + visualScores.visualTrustScore * 0.55),
    mobile: clamp(
      domScores.mobile * 0.45 + visualScores.mobileClarityScore * 0.55
    ),
  };
}

function weightedHealthScore(scores: ScoreBundle, industry: WebsiteIndustry) {
  const weights =
    industryScoreWeights[industry] || industryScoreWeights["General Business"];

  return clamp(
    scores.seo * weights.seo +
      scores.ux * weights.ux +
      scores.cta * weights.cta +
      scores.trust * weights.trust +
      scores.mobile * weights.mobile
  );
}

function severityCounts(health: number, findingsCount: number) {
  const baseCritical =
    health < 45 ? 5 : health < 60 ? 4 : health < 75 ? 3 : 2;

  const critical = Math.min(6, Math.max(1, Math.min(baseCritical, findingsCount)));

  return {
    critical,
    medium: health < 45 ? 6 : health < 60 ? 5 : health < 75 ? 4 : 2,
    minor: health < 45 ? 3 : health < 60 ? 3 : health < 75 ? 2 : 1,
  };
}

function buildScanPayload({
  siteLabel,
  screenshot,
  screenshotSource,
  scan,
  visual,
  hasHttpTarget,
  industryData,
}: {
  siteLabel: string;
  screenshot: string;
  screenshotSource: "captured" | "uploaded" | "provided" | "none";
  scan: WebsiteScan | null;
  visual: VisualScan | null;
  hasHttpTarget: boolean;
  industryData: WebsiteIndustryDetection;
}): ScanPayload {
  const analysisMode: ScanPayload["analysisMode"] = hasHttpTarget
    ? "url"
    : screenshotSource === "uploaded"
    ? "screenshot_upload"
    : "screenshot_url";

  return {
    url: siteLabel,
    screenshotUrl: screenshot,
    pageTitle: scan?.pageTitle || "",
    metaDescription: scan?.metaDescription || "",
    h1Text: scan?.h1Text || "",
    h2Count: scan?.h2Count || 0,
    pCount: scan?.pCount || 0,
    buttonCount: scan?.buttonCount || 0,
    imageCount: scan?.imageCount || 0,
    formCount: scan?.formCount || 0,
    inputCount: scan?.inputCount || 0,
    hasTestimonials: !!scan?.hasTestimonials,
    hasTrustBadges: !!scan?.hasTrustBadges,
    hasPricing: !!scan?.hasPricing,
    subHeadline: scan?.subHeadline || "",
    ctaTexts: scan?.ctaTexts || [],
    navLinks: scan?.navLinks || [],
    hasFAQ: !!scan?.hasFAQ,
    hasGuarantee: !!scan?.hasGuarantee,
    urgencySignals: !!scan?.urgencySignals,
    socialProofSignals: !!scan?.socialProofSignals,
    footerCta: !!scan?.footerCta,
    wordCount: scan?.wordCount || 0,
    bodyTextSnippet: scan?.bodyTextSnippet || "",
    analysisMode,
    screenshotSource,
    modernDesignLikely: visual?.modernDesignLikely,
    ecommerceLikely: visual?.ecommerceLikely,
    fintechLikely: visual?.fintechLikely,
    industry: industryData.industry,
    industryConfidence: industryData.confidence,
    industryReasons: industryData.reasons,
  };
}

export async function POST(req: Request) {
  let reservedFreeScan = false;
  let reservedUserId = "";
  let prismaForRefund: PrismaClient | null = null;

  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/authOptions");
    const { prisma } = await import("@/lib/prisma");

    prismaForRefund = prisma;

    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string } | undefined;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = await readScanRequest(req);
    const requestedUrl = input.url.trim();
    const urlValidation = requestedUrl ? validateScanUrl(requestedUrl) : null;

    if (urlValidation && !urlValidation.ok) {
      return NextResponse.json(
        { error: urlValidation.error },
        { status: 400 }
      );
    }

    const normalizedUrl = urlValidation?.ok ? urlValidation.url : "";
    const hasHttpTarget = Boolean(urlValidation?.ok);
    const hasScreenshot = isImageUrl(input.screenshotUrl);

    if (!hasHttpTarget && !hasScreenshot) {
      return NextResponse.json(
        { error: "Please provide a landing page URL or upload a screenshot." },
        { status: 400 }
      );
    }

    const usage = await getFreshScanUsage(prisma, userId);

    if (!usage) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const freePlan = isFreePlan(usage.plan);

    if (freePlan && usage.scansUsed >= FREE_WEEKLY_SCAN_LIMIT) {
      return NextResponse.json({ error: LIMIT_ERROR }, { status: 429 });
    }

    if (freePlan) {
      const reserved = await reserveFreeScanSlot(prisma, userId);

      if (!reserved) {
        return NextResponse.json({ error: LIMIT_ERROR }, { status: 429 });
      }

      reservedFreeScan = true;
      reservedUserId = userId;
    }

    let scan: WebsiteScan | null = null;
    let visual: VisualScan | null = null;

    if (hasHttpTarget) {
      try {
        scan = (await scanWebsite(normalizedUrl)) as WebsiteScan | null;
      } catch (err) {
        console.error("SCAN FAILED:", err);
      }

      try {
        visual = (await getVisualScan(normalizedUrl)) as VisualScan | null;
      } catch (err) {
        console.error("VISUAL FAILED:", err);
      }
    }

    const capturedScreenshot =
      visual?.screenshotUrl && !visual.screenshotUrl.includes("unauthorized")
        ? visual.screenshotUrl
        : hasHttpTarget
        ? `https://api.microlink.io/?url=${encodeURIComponent(
            normalizedUrl
          )}&screenshot=true&meta=false&embed=screenshot.url`
        : "";

    const screenshot = hasScreenshot ? input.screenshotUrl : capturedScreenshot;
    const screenshotSource =
      input.screenshotSource ||
      (capturedScreenshot ? "captured" : "none");

    const siteLabel = hasHttpTarget
      ? normalizedUrl
      : input.screenshotUrl.startsWith("http")
      ? input.screenshotUrl
      : `Uploaded screenshot: ${input.screenshotName}`;

    const industryData = detectWebsiteIndustry({
      ...(scan || {}),
      ecommerceLikely: visual?.ecommerceLikely,
      fintechLikely: visual?.fintechLikely,
    });

    const ai: AiAuditResult = await generateAIAudit(
      buildScanPayload({
        siteLabel,
        screenshot,
        screenshotSource,
        scan,
        visual,
        hasHttpTarget,
        industryData,
      })
    );

    const consultantFindings = safeArray<ConsultantFinding>(
      ai?.consultantFindings
    );
    const findings =
      consultantFindings.length > 0
        ? consultantFindings.map((x) => x.issue)
        : ["No specific conversion findings were returned."];

    const baseScores = scan?.pageTitle
      ? blendScores(scoreFromDom(scan, visual), ai)
      : scoreFromVisual(ai);

    const health = weightedHealthScore(baseScores, industryData.industry);

    const { critical, medium, minor } = severityCounts(
      health,
      Math.max(consultantFindings.length, 1)
    );

    const confidence = clamp(
      62 +
        (screenshot ? 10 : 0) +
        (ai?.analysisMode === "multimodal_vision" ? 12 : 0) +
        Math.floor((scan?.wordCount || 0) / 500) +
        (scan?.buttonCount || 0) +
        (scan?.hasTestimonials ? 3 : 0)
    );

    const visualScores = safeVisualScores(ai);
    const visualOverlays = safeArray<VisualOverlay>(ai?.visualOverlays);
    const aiFixes = {
      visualScores,
      visualOverlays,
      analysisMode: ai?.analysisMode || "dom_fallback",
    };

    const auditData = {
      siteUrl: siteLabel,
      seo: baseScores.seo,
      ux: baseScores.ux,
      cta: baseScores.cta,
      trust: baseScores.trust,
      mobile: baseScores.mobile,
      health,
      critical,
      medium,
      minor,
      confidence,
      findings,
      summary: ai?.summary || "AI summary unavailable",
      roadmap: safeArray<string>(ai?.roadmap),
      revenueNotes: safeArray<string>(ai?.revenueNotes),
      consultantFindings,
      quickWins: safeQuickWins(ai?.quickWins),
      visualLabels: safeArray<string>(ai?.visualLabels),
      visualFlags: visualOverlays,
      aiFixes,
      screenshotUrl: screenshot,
      industry: industryData.industry,
      industryConfidence: industryData.confidence,
      industryReasons: industryData.reasons,
      isPublic: true,
      userId,
    };

    let savedAudit: Audit;
    let usageAfterAudit: ScanUsageRecord | null = null;

    if (freePlan) {
      savedAudit = await prisma.audit.create({
        data: auditData,
      });

      reservedFreeScan = false;

      try {
        usageAfterAudit =
          (await prisma.user.findUnique({
            where: { id: userId },
            select: scanUsageSelect,
          })) || {
            ...usage,
            scansUsed: usage.scansUsed + 1,
          };
      } catch (usageRefreshError) {
        console.error("SCAN USAGE REFRESH ERROR:", usageRefreshError);

        usageAfterAudit = {
          ...usage,
          scansUsed: usage.scansUsed + 1,
        };
      }
    } else {
      const [audit, updatedUsage] = await prisma.$transaction([
        prisma.audit.create({
          data: auditData,
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            scansUsed: {
              increment: 1,
            },
          },
          select: scanUsageSelect,
        }),
      ]);

      savedAudit = audit;
      usageAfterAudit = updatedUsage;
    }

    return NextResponse.json({
      ...savedAudit,
      ...visualScores,
      visualScores,
      visualOverlays,
      analysisMode: aiFixes.analysisMode,
      usage: usageAfterAudit ? buildUsagePayload(usageAfterAudit) : null,
    });
  } catch (error: unknown) {
    if (reservedFreeScan && prismaForRefund && reservedUserId) {
      try {
        await refundFreeScanSlot(prismaForRefund, reservedUserId);
      } catch (refundError) {
        console.error("SCAN LIMIT REFUND ERROR:", refundError);
      }
    }

    console.error("SCAN ROUTE ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Scan failed. Please try another page or screenshot.";

    return NextResponse.json(
      { error: message },
      { status: error instanceof ScanRequestError ? error.status : 500 }
    );
  }
}
