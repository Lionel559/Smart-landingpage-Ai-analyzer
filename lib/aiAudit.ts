import OpenAI from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import {
  getIndustryConversionGuidance,
  type WebsiteIndustry,
} from "@/lib/industryDetection";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer":
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "PageDoctor AI",
  },
});

const NOT_ENOUGH = "Not enough visual evidence detected.";

type ConsultantFinding = {
  issue: string;
  evidence: string;
  fix: string;
  impact: string;
  confidence?: number;
};

type VisualOverlayType =
  | "weak_cta"
  | "clutter"
  | "missing_trust"
  | "poor_hierarchy";

export type VisualOverlay = {
  type: VisualOverlayType;
  label: string;
  evidence: string;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: "critical" | "medium" | "minor";
};

export type VisualScores = {
  visualTrustScore: number;
  ctaVisibilityScore: number;
  readabilityScore: number;
  mobileClarityScore: number;
  persuasionScore: number;
};

export type ScanPayload = {
  url: string;
  screenshotUrl?: string;
  pageTitle: string;
  metaDescription: string;
  h1Text: string;
  h2Count: number;
  pCount: number;
  buttonCount: number;
  imageCount: number;
  formCount: number;
  inputCount?: number;
  hasTestimonials: boolean;
  hasTrustBadges: boolean;
  hasPricing: boolean;
  subHeadline: string;
  ctaTexts: string[];
  navLinks: string[];
  hasFAQ: boolean;
  hasGuarantee: boolean;
  urgencySignals: boolean;
  socialProofSignals: boolean;
  footerCta: boolean;
  wordCount: number;
  bodyTextSnippet?: string;
  analysisMode?: "url" | "screenshot_upload" | "screenshot_url";
  screenshotSource?: "captured" | "uploaded" | "provided" | "none";
  modernDesignLikely?: boolean;
  ecommerceLikely?: boolean;
  fintechLikely?: boolean;
  industry?: WebsiteIndustry;
  industryConfidence?: number;
  industryReasons?: string[];
};

const allowedOverlayTypes: VisualOverlayType[] = [
  "weak_cta",
  "clutter",
  "missing_trust",
  "poor_hierarchy",
];

function clampScore(value: unknown, fallback = 60) {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number.parseFloat(value)
      : Number.NaN;

  if (!Number.isFinite(num)) {
    return fallback;
  }

  return Math.max(18, Math.min(98, Math.round(num)));
}

function clampPercent(value: unknown, fallback: number) {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number.parseFloat(value)
      : Number.NaN;

  if (!Number.isFinite(num)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(num)));
}

function text(value: unknown, fallback = NOT_ENOUGH) {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  return cleaned || fallback;
}

function sentenceList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => text(item, ""))
    .filter(Boolean)
    .slice(0, 8);

  return items.length ? items : fallback;
}

function hasImageInput(scan: ScanPayload) {
  const url = scan.screenshotUrl?.trim();

  return Boolean(
    url &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:image/"))
  );
}

function genericCta(ctaTexts: string[]) {
  const genericTerms = [
    "learn more",
    "submit",
    "get started",
    "click here",
    "contact",
    "read more",
  ];

  return ctaTexts.some((cta) =>
    genericTerms.some((term) => cta.toLowerCase().includes(term))
  );
}

function industryLabel(scan: Partial<ScanPayload>) {
  return scan.industry || "General Business";
}

function industryPrimaryCta(industry?: WebsiteIndustry) {
  switch (industry) {
    case "Music / Entertainment":
      return "fan engagement, streaming, ticketing, or booking";
    case "Education / School":
      return "admissions, enrollment, or inquiry";
    case "Fintech / Payment":
      return "secure onboarding or payment activation";
    case "Ecommerce":
      return "product purchase or checkout";
    case "SaaS":
      return "signup, trial, or demo";
    case "Healthcare":
      return "appointment or patient inquiry";
    case "Real Estate":
      return "listing inquiry or property viewing";
    case "Restaurant / Food":
      return "ordering, reservation, or menu";
    case "Nonprofit":
      return "donation or volunteer";
    case "Agency":
      return "consultation or project inquiry";
    case "Portfolio":
      return "hiring or contact";
    default:
      return "primary conversion";
  }
}

function industryTrustStandard(industry?: WebsiteIndustry) {
  switch (industry) {
    case "Music / Entertainment":
      return "artist credibility, fan proof, streaming presence, event proof, or recognizable media links";
    case "Education / School":
      return "accreditation, program proof, parent/student reassurance, outcomes, or campus credibility";
    case "Fintech / Payment":
      return "security, compliance, encryption, fraud prevention, PCI/KYC, or payment reliability proof";
    case "Ecommerce":
      return "reviews, product proof, shipping/returns reassurance, secure checkout, or guarantee messaging";
    case "SaaS":
      return "customer logos, testimonials, case studies, integrations, security, or product proof";
    case "Healthcare":
      return "provider credentials, patient reassurance, privacy, insurance, and treatment credibility";
    case "Real Estate":
      return "agent credibility, listing freshness, testimonials, local expertise, or viewing reassurance";
    case "Restaurant / Food":
      return "reviews, food visuals, location confidence, hours, hygiene, or ordering reassurance";
    case "Nonprofit":
      return "impact proof, donor trust, transparent mission, partner proof, or fund-use reassurance";
    case "Agency":
      return "case studies, client proof, results, process clarity, or service credibility";
    case "Portfolio":
      return "work samples, case studies, role clarity, testimonials, or hiring credibility";
    default:
      return "proof, credibility, and reassurance near decision points";
  }
}

function hasIndustryCta(scan: Partial<ScanPayload>) {
  const industry = industryLabel(scan);
  const ctas = (scan.ctaTexts || []).join(" ").toLowerCase();
  const nav = (scan.navLinks || []).join(" ").toLowerCase();
  const text = `${ctas} ${nav}`;

  switch (industry) {
    case "Music / Entertainment":
      return /listen|stream|watch|ticket|tour|event|book|merch/.test(text);
    case "Education / School":
      return /admission|apply|enroll|program|tour|request info|tuition/.test(text);
    case "Fintech / Payment":
      return /pay|payment|account|onboard|start|pricing|demo|get paid/.test(text);
    case "Ecommerce":
      return /shop|buy|cart|checkout|order|product/.test(text);
    case "SaaS":
      return /demo|trial|sign up|signup|start|pricing|free/.test(text);
    case "Healthcare":
      return /appointment|schedule|doctor|clinic|patient|contact/.test(text);
    case "Real Estate":
      return /listing|viewing|tour|property|home|agent|contact/.test(text);
    case "Restaurant / Food":
      return /menu|order|reserve|reservation|delivery|table/.test(text);
    case "Nonprofit":
      return /donate|volunteer|give|support|join/.test(text);
    case "Agency":
      return /book|call|quote|project|contact|work with/.test(text);
    case "Portfolio":
      return /work|project|hire|contact|resume/.test(text);
    default:
      return Boolean(scan.ctaTexts?.length);
  }
}

function fallbackVisualScores(scan: Partial<ScanPayload>): VisualScores {
  const trustSignals =
    (scan.hasTestimonials ? 12 : 0) +
    (scan.hasTrustBadges ? 12 : 0) +
    (scan.hasGuarantee ? 6 : 0) +
    (scan.socialProofSignals ? 8 : 0);

  const ctaSignals =
    (scan.buttonCount || 0) >= 4
      ? 24
      : (scan.buttonCount || 0) >= 2
      ? 16
      : (scan.buttonCount || 0) === 1
      ? 8
      : -8;

  const readabilityPenalty =
    (scan.pCount || 0) > 35 || (scan.wordCount || 0) > 1400
      ? 18
      : (scan.pCount || 0) > 22 || (scan.wordCount || 0) > 900
      ? 9
      : 0;

  const mobilePenalty =
    (scan.navLinks?.length || 0) > 7 || (scan.inputCount || 0) > 5
      ? 12
      : 0;

  const persuasionSignals =
    (scan.h1Text ? 10 : -8) +
    (scan.subHeadline ? 8 : 0) +
    (scan.urgencySignals ? 5 : 0) +
    (scan.hasFAQ ? 4 : 0);

  return {
    visualTrustScore: clampScore(46 + trustSignals, 56),
    ctaVisibilityScore: clampScore(50 + ctaSignals, 58),
    readabilityScore: clampScore(76 - readabilityPenalty, 64),
    mobileClarityScore: clampScore(72 - mobilePenalty, 62),
    persuasionScore: clampScore(52 + persuasionSignals + trustSignals / 2, 60),
  };
}

function fallbackOverlays(
  scan: Partial<ScanPayload>,
  scores: VisualScores
): VisualOverlay[] {
  const overlays: VisualOverlay[] = [];

  if (!scan.h1Text || scan.h1Text.length < 28) {
    overlays.push({
      type: "poor_hierarchy",
      label: "Hero hierarchy risk",
      evidence: scan.h1Text
        ? `Extracted hero headline is short or vague: "${scan.h1Text}".`
        : "DOM scan did not extract a clear H1 headline.",
      x: 8,
      y: 12,
      width: 36,
      height: 18,
      severity: "critical",
    });
  }

  if (scores.ctaVisibilityScore < 66) {
    overlays.push({
      type: "weak_cta",
      label: "CTA emphasis risk",
      evidence: scan.ctaTexts?.length
        ? `Detected CTA text: ${scan.ctaTexts.slice(0, 3).join(", ")}.`
        : "DOM scan found no clear CTA-like button or link text.",
      x: 56,
      y: 24,
      width: 26,
      height: 14,
      severity: "critical",
    });
  }

  if (scores.visualTrustScore < 66) {
    overlays.push({
      type: "missing_trust",
      label: "Trust proof gap",
      evidence:
        "DOM scan did not confirm testimonials, trust badges, guarantee language, or social proof near conversion signals.",
      x: 10,
      y: 62,
      width: 34,
      height: 16,
      severity: "medium",
    });
  }

  if (scores.readabilityScore < 68 || scores.mobileClarityScore < 68) {
    overlays.push({
      type: "clutter",
      label: "Potential clutter zone",
      evidence: `DOM density signals: ${scan.pCount || 0} paragraphs, ${
        scan.wordCount || 0
      } words, ${scan.navLinks?.length || 0} nav links.`,
      x: 18,
      y: 38,
      width: 44,
      height: 20,
      severity: "medium",
    });
  }

  return overlays.slice(0, 4);
}

function fallbackResponse(
  scan: Partial<ScanPayload> = {},
  reason = "dom_fallback"
) {
  const industry = industryLabel(scan);
  const primaryCta = industryPrimaryCta(industry);
  const trustStandard = industryTrustStandard(industry);
  const scores = fallbackVisualScores(scan);
  const findings: ConsultantFinding[] = [];

  if (!scan.h1Text) {
    findings.push({
      issue: `${industry} positioning cannot be confirmed above the fold`,
      evidence:
        scan.screenshotUrl && reason !== "dom_fallback"
          ? NOT_ENOUGH
          : "DOM scan did not extract a clear H1 headline.",
      fix:
        `Make the first-screen headline state the ${industry.toLowerCase()} audience, outcome, and reason to take the ${primaryCta} action.`,
      impact:
        `Clear ${industry.toLowerCase()} positioning helps visitors decide faster whether this page matches their intent.`,
    });
  } else if (scan.h1Text.length < 38) {
    findings.push({
      issue: `${industry} headline is likely under-explaining the value proposition`,
      evidence: `Extracted H1: "${scan.h1Text}".`,
      fix:
        `Expand the headline or supporting line so it names the audience, outcome, and industry-specific reason to choose this ${industry.toLowerCase()} offer.`,
      impact:
        `A more explicit ${industry.toLowerCase()} promise reduces interpretation work and improves above-the-fold engagement.`,
    });
  }

  if (!scan.ctaTexts?.length || !hasIndustryCta(scan)) {
    findings.push({
      issue: `Primary ${primaryCta} CTA is not clearly detected`,
      evidence: scan.ctaTexts?.length
        ? `Detected CTA text exists, but it does not clearly match the expected ${industry.toLowerCase()} conversion path: ${scan.ctaTexts
            .slice(0, 4)
            .join(", ")}.`
        : "DOM scan found no CTA-like button or link text for the expected industry conversion path.",
      fix:
        `Add one visually dominant above-the-fold CTA for ${primaryCta} and repeat it after the strongest proof section.`,
      impact:
        `A clear ${industry.toLowerCase()} next step reduces hesitation and helps motivated visitors act without searching.`,
    });
  } else if (genericCta(scan.ctaTexts)) {
    findings.push({
      issue: `${industry} CTA copy appears too generic for high-intent visitors`,
      evidence: `Detected CTA text includes: ${scan.ctaTexts
        .slice(0, 4)
        .join(", ")}.`,
      fix:
        `Replace generic CTA wording with a benefit-led ${primaryCta} action that explains what happens next.`,
      impact:
        `Specific ${industry.toLowerCase()} CTA language raises click motivation because visitors understand the next step.`,
    });
  }

  if (
    !scan.hasTestimonials &&
    !scan.hasTrustBadges &&
    !scan.socialProofSignals
  ) {
    findings.push({
      issue:
        industry === "Fintech / Payment"
          ? "Security and compliance trust signals are not visible enough"
          : industry === "Education / School"
          ? "Admissions and student trust proof is weak in the available evidence"
          : industry === "Music / Entertainment"
          ? "Artist credibility and fan engagement proof are weak in the available evidence"
          : industry === "Ecommerce"
          ? "Product reviews and checkout reassurance are weak in the available evidence"
          : `${industry} trust reinforcement is weak in the available page evidence`,
      evidence:
        `DOM scan did not confirm enough ${trustStandard}.`,
      fix:
        `Place concise ${industry.toLowerCase()} trust proof near the hero CTA and reinforce it again before the final conversion section.`,
      impact:
        `Credibility near decision points lowers perceived risk for ${industry.toLowerCase()} visitors.`,
    });
  }

  if ((scan.pCount || 0) > 30 || (scan.wordCount || 0) > 1100) {
    findings.push({
      issue: "Content density may be slowing decision speed",
      evidence: `DOM density signals show ${scan.pCount || 0} paragraphs and ${
        scan.wordCount || 0
      } words.`,
      fix:
        "Break long copy into scannable benefit blocks, proof snippets, and short objection-handling sections.",
      impact:
        "Cleaner scanning improves comprehension and reduces fatigue on mobile and desktop.",
    });
  }

  if (!scan.urgencySignals) {
    findings.push({
      issue: "The offer lacks a clear momentum trigger",
      evidence:
        "DOM scan did not detect urgency or momentum language such as limited availability, deadline, today, act now, or expiring offers.",
      fix:
        "Add honest urgency only when it is true, or use softer momentum cues like 'Get your first recommendation today'.",
      impact:
        "Ethical urgency gives interested visitors a reason to act now instead of postponing the decision.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      issue: "No specific visual blocker could be confirmed from fallback data",
      evidence: NOT_ENOUGH,
      fix:
        "Retry with a public screenshot URL or a sharper uploaded screenshot so the vision model can ground findings in visible UI.",
      impact:
        "Higher-quality visual evidence produces more precise CRO recommendations.",
    });
  }

  const visualOverlays = fallbackOverlays(scan, scores);

  return {
    consultantFindings: findings.slice(0, 5),
    visualLabels: [
      scores.ctaVisibilityScore < 66 ? "CTA visibility risk" : "",
      scores.visualTrustScore < 66 ? "Trust proof gap" : "",
      scores.readabilityScore < 68 ? "Readability friction" : "",
      scores.persuasionScore < 66 ? "Persuasion clarity risk" : "",
    ].filter(Boolean),
    quickWins: {
      headlineFix: scan.h1Text
        ? `${scan.h1Text}: make the ${industry.toLowerCase()} outcome unmistakable above the fold`
        : `State the ${industry.toLowerCase()} audience, outcome, and core value in the hero headline`,
      ctaFix: scan.ctaTexts?.[0]
        ? `Make "${scan.ctaTexts[0]}" more specific to the ${primaryCta} outcome`
        : `Use one specific ${primaryCta} CTA above the fold`,
      trustFix:
        `Place concise ${industry.toLowerCase()} proof next to the first major conversion action`,
    },
    summary:
      reason === "vision_failed"
        ? `The multimodal vision request did not return usable JSON, so this ${industry.toLowerCase()} report uses grounded DOM evidence and conservative visual scoring.`
        : `This ${industry.toLowerCase()} report is grounded in available page data and flags the most likely industry-specific conversion friction points without inventing unseen page sections.`,
    roadmap: [
      `Clarify the ${industry.toLowerCase()} hero message and make the primary next step obvious.`,
      `Increase ${primaryCta} CTA specificity, contrast, and repetition at natural decision points.`,
      `Move ${industry.toLowerCase()} trust proof closer to high-intent conversion areas.`,
      "Reduce dense copy blocks and make mobile scanning easier.",
    ],
    revenueNotes: [
      `${industry} conversion leakage is most likely concentrated around the clarity of the ${primaryCta} path and proof near decision moments.`,
      `Improving first-screen ${industry.toLowerCase()} clarity and proof placement can increase the share of visitors who reach a decision.`,
    ],
    visualTrustScore: scores.visualTrustScore,
    ctaVisibilityScore: scores.ctaVisibilityScore,
    readabilityScore: scores.readabilityScore,
    mobileClarityScore: scores.mobileClarityScore,
    persuasionScore: scores.persuasionScore,
    visualOverlays,
    analysisMode: reason,
  };
}

function buildPrompt(scan: ScanPayload, imageAttached: boolean) {
  const industry = scan.industry || "General Business";
  const industryReasons = scan.industryReasons?.length
    ? scan.industryReasons.join("; ")
    : NOT_ENOUGH;
  const industryGuidance = getIndustryConversionGuidance(industry);

  return `
You are a senior CRO consultant, UX strategist, industry-aware landing page reviewer, and conversion psychologist.

You are analyzing a ${industry} website. Use conversion standards relevant to this industry.

You are reviewing a landing page screenshot${imageAttached ? "" : " is not attached"} plus extracted DOM evidence.

Your job is to identify visible UX and CRO issues from the screenshot, then use DOM facts only as supporting evidence.

INDUSTRY-SPECIFIC REVIEW STANDARD:
${industryGuidance}

STRICT GROUNDING RULES:
- Evidence-based findings only.
- Reference actual visible UI composition: hero clarity, CTA visibility, trust signals, spacing, visual hierarchy, mobile clutter, contrast, readability, testimonial placement, pricing clarity, conversion friction, visual overload, weak buttons, missing urgency, and above-the-fold quality.
- Every finding must mention either a visible screenshot detail or a supplied DOM fact.
- Every issue, fix, roadmap item, and revenue note must be specific to a ${industry} conversion journey.
- Do not use generic SaaS, pricing, or demo advice unless it is appropriate for the detected industry and supported by page evidence.
- For music/entertainment sites, prioritize streaming links, fan engagement, event booking, audio/video visibility, artist branding, tickets, merch, and media proof.
- For education/school sites, prioritize admissions CTA, programs, parent/student clarity, accreditation, outcomes, tuition clarity, and inquiry flow.
- For fintech/payment sites, prioritize security trust, compliance signals, pricing clarity, onboarding CTA, payment reliability, and risk reassurance.
- For ecommerce sites, prioritize product clarity, pricing, reviews, shipping/returns, checkout friction, product discovery, and purchase CTA.
- For SaaS sites, prioritize value proposition, signup CTA, demo CTA, social proof, feature clarity, integrations, pricing expectations, and activation friction.
- Do not hallucinate sections, testimonials, pricing, badges, customer logos, product claims, ratings, or statistics.
- If an element is unclear, hidden, cropped, too small, or not visible, write exactly: "${NOT_ENOUGH}"
- Do not write generic marketing fluff. Explain why the observed issue hurts conversion behavior.
- Do not claim pricing, testimonials, or urgency exist unless they are visible in the screenshot or confirmed in DOM data.
- For uploaded screenshots, judge only what is visible in the image. Do not assume the rest of the page.

VISUAL OVERLAY RULES:
- Return overlay markers only for visible or strongly DOM-supported problem areas.
- Coordinates are percentages of the screenshot: x, y, width, height.
- Types must be one of: weak_cta, clutter, missing_trust, poor_hierarchy.
- If a marker location is not visually clear, do not create that marker.

PAGE DATA:
URL OR SOURCE: ${scan.url}
ANALYSIS MODE: ${scan.analysisMode || "url"}
SCREENSHOT SOURCE: ${scan.screenshotSource || "none"}

DETECTED INDUSTRY: ${industry}
INDUSTRY CONFIDENCE: ${scan.industryConfidence || 0}%
INDUSTRY DETECTION REASONS: ${industryReasons}

TITLE: ${scan.pageTitle || NOT_ENOUGH}
META DESCRIPTION: ${scan.metaDescription || NOT_ENOUGH}
H1: ${scan.h1Text || NOT_ENOUGH}
SUBHEADLINE: ${scan.subHeadline || NOT_ENOUGH}

CTA TEXTS:
${scan.ctaTexts?.length ? scan.ctaTexts.join(", ") : NOT_ENOUGH}

NAVIGATION:
${scan.navLinks?.length ? scan.navLinks.join(", ") : NOT_ENOUGH}

PAGE STATS:
- H2 COUNT: ${scan.h2Count}
- PARAGRAPHS: ${scan.pCount}
- WORD COUNT: ${scan.wordCount}
- BUTTON COUNT: ${scan.buttonCount}
- IMAGE COUNT: ${scan.imageCount}
- FORM COUNT: ${scan.formCount}
- INPUT COUNT: ${scan.inputCount || 0}

CONVERSION SIGNALS:
- TESTIMONIALS DETECTED IN DOM: ${scan.hasTestimonials}
- TRUST BADGES DETECTED IN DOM: ${scan.hasTrustBadges}
- PRICING DETECTED IN DOM: ${scan.hasPricing}
- FAQ DETECTED IN DOM: ${scan.hasFAQ}
- GUARANTEE DETECTED IN DOM: ${scan.hasGuarantee}
- URGENCY SIGNALS DETECTED IN DOM: ${scan.urgencySignals}
- SOCIAL PROOF DETECTED IN DOM: ${scan.socialProofSignals}
- FOOTER CTA DETECTED IN DOM: ${scan.footerCta}

BUSINESS DETECTION:
- MODERN DESIGN LIKELY: ${scan.modernDesignLikely}
- ECOMMERCE LIKELY: ${scan.ecommerceLikely}
- FINTECH LIKELY: ${scan.fintechLikely}

BODY TEXT SNIPPET:
${scan.bodyTextSnippet || NOT_ENOUGH}

Return STRICT valid JSON only. No markdown. No code fences. No comments.

JSON FORMAT:
{
  "consultantFindings": [
    {
      "issue": "",
      "evidence": "",
      "fix": "",
      "impact": "",
      "confidence": 0
    }
  ],
  "visualLabels": [],
  "quickWins": {
    "headlineFix": "",
    "ctaFix": "",
    "trustFix": ""
  },
  "summary": "",
  "roadmap": [],
  "revenueNotes": [],
  "visualTrustScore": 0,
  "ctaVisibilityScore": 0,
  "readabilityScore": 0,
  "mobileClarityScore": 0,
  "persuasionScore": 0,
  "visualOverlays": [
    {
      "type": "weak_cta",
      "label": "",
      "evidence": "",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "severity": "critical"
    }
  ]
}
`;
}

function extractJson(raw: string) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    return cleaned;
  }

  return cleaned.slice(first, last + 1);
}

function normalizeFindings(
  parsedFindings: unknown,
  fallbackFindings: ConsultantFinding[]
) {
  if (!Array.isArray(parsedFindings)) {
    return fallbackFindings;
  }

  const findings = parsedFindings
    .map<ConsultantFinding | null>((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;

      return {
        issue: text(entry.issue, ""),
        evidence: text(entry.evidence),
        fix: text(entry.fix, ""),
        impact: text(entry.impact, ""),
        confidence: clampScore(entry.confidence, 82),
      };
    })
    .filter(
      (item): item is ConsultantFinding =>
        Boolean(item?.issue && item.fix && item.impact)
    )
    .slice(0, 6);

  return findings.length ? findings : fallbackFindings;
}

function normalizeQuickWins(
  value: unknown,
  fallback: ReturnType<typeof fallbackResponse>["quickWins"]
) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const quickWins = value as Record<string, unknown>;

  return {
    headlineFix: text(quickWins.headlineFix, fallback.headlineFix),
    ctaFix: text(quickWins.ctaFix, fallback.ctaFix),
    trustFix: text(quickWins.trustFix, fallback.trustFix),
  };
}

function normalizeScores(
  parsed: Record<string, unknown>,
  fallback: VisualScores
): VisualScores {
  const visualScores =
    parsed.visualScores && typeof parsed.visualScores === "object"
      ? (parsed.visualScores as Record<string, unknown>)
      : parsed;

  return {
    visualTrustScore: clampScore(
      visualScores.visualTrustScore,
      fallback.visualTrustScore
    ),
    ctaVisibilityScore: clampScore(
      visualScores.ctaVisibilityScore,
      fallback.ctaVisibilityScore
    ),
    readabilityScore: clampScore(
      visualScores.readabilityScore,
      fallback.readabilityScore
    ),
    mobileClarityScore: clampScore(
      visualScores.mobileClarityScore,
      fallback.mobileClarityScore
    ),
    persuasionScore: clampScore(
      visualScores.persuasionScore,
      fallback.persuasionScore
    ),
  };
}

function normalizeOverlays(
  value: unknown,
  fallback: VisualOverlay[]
): VisualOverlay[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const overlays = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const type = text(entry.type, "weak_cta") as VisualOverlayType;

      if (!allowedOverlayTypes.includes(type)) {
        return null;
      }

      const severity = text(entry.severity, "medium");

      return {
        type,
        label: text(entry.label, "Visual friction"),
        evidence: text(entry.evidence),
        x: clampPercent(entry.x, 12),
        y: clampPercent(entry.y, 18),
        width: Math.max(8, Math.min(70, clampPercent(entry.width, 22))),
        height: Math.max(6, Math.min(50, clampPercent(entry.height, 12))),
        severity:
          severity === "critical" || severity === "minor"
            ? severity
            : "medium",
      };
    })
    .filter((item): item is VisualOverlay => Boolean(item))
    .slice(0, 6);

  return overlays.length ? overlays : fallback;
}

export async function generateAIAudit(scan: ScanPayload) {
  const fallback = fallbackResponse(scan);

  if (!process.env.OPENROUTER_API_KEY) {
    return fallbackResponse(scan, "missing_openrouter_key");
  }

  try {
    const imageAttached = hasImageInput(scan);
    const prompt = buildPrompt(scan, imageAttached);

    const content: ChatCompletionContentPart[] = imageAttached
      ? [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: scan.screenshotUrl || "",
            },
          },
        ]
      : [
          {
            type: "text",
            text: prompt,
          },
        ];

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content,
      },
    ];

    const completion = await client.chat.completions.create({
      model:
        process.env.OPENROUTER_VISION_MODEL ||
        "google/gemini-2.0-flash-001",
      messages,
      temperature: 0.2,
      max_tokens: 2600,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
    const fallbackScores = fallbackVisualScores(scan);
    const scores = normalizeScores(parsed, fallbackScores);
    const visualOverlays = normalizeOverlays(
      parsed.visualOverlays,
      fallbackOverlays(scan, scores)
    );

    return {
      consultantFindings: normalizeFindings(
        parsed.consultantFindings,
        fallback.consultantFindings
      ),
      visualLabels: sentenceList(
        parsed.visualLabels,
        fallback.visualLabels
      ).slice(0, 6),
      quickWins: normalizeQuickWins(parsed.quickWins, fallback.quickWins),
      summary: text(parsed.summary, fallback.summary),
      roadmap: sentenceList(parsed.roadmap, fallback.roadmap).slice(0, 6),
      revenueNotes: sentenceList(
        parsed.revenueNotes,
        fallback.revenueNotes
      ).slice(0, 4),
      visualTrustScore: scores.visualTrustScore,
      ctaVisibilityScore: scores.ctaVisibilityScore,
      readabilityScore: scores.readabilityScore,
      mobileClarityScore: scores.mobileClarityScore,
      persuasionScore: scores.persuasionScore,
      visualOverlays,
      analysisMode: imageAttached ? "multimodal_vision" : "dom_only_ai",
    };
  } catch (error) {
    console.log("AI AUDIT ERROR:", error);
    return fallbackResponse(scan, "vision_failed");
  }
}
