import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type ScanPayload = {
  url: string;
  screenshotUrl: string;
  pageTitle: string;
  metaDescription: string;
  h1Text: string;
  h2Count: number;
  pCount: number;
  buttonCount: number;
  imageCount: number;
  formCount: number;
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
  modernDesignLikely?: boolean;
  ecommerceLikely?: boolean;
  fintechLikely?: boolean;
};

function fallbackResponse() {
  return {
    consultantFindings: [
      {
        issue: "Primary call-to-action lacks persuasive urgency",
        evidence:
          "CTA language appears generic and lacks strong action-driven wording.",
        fix:
          "Replace CTA with a benefit-driven phrase like 'Start Free Trial' and position it prominently above the fold.",
        impact:
          "Stronger CTA clarity can materially improve first-click engagement.",
      },
      {
        issue: "Trust signals are weak or missing",
        evidence:
          "Limited presence of testimonials, badges, or credibility indicators around decision zones.",
        fix:
          "Add testimonials, client logos, guarantees and proof blocks near CTA sections.",
        impact:
          "Improved trust architecture reduces hesitation and increases buyer confidence.",
      },
      {
        issue: "Headline does not communicate clear value",
        evidence:
          "Headline appears informational instead of promising a strong business outcome.",
        fix:
          "Rewrite headline to communicate benefit, speed and measurable user payoff.",
        impact:
          "Sharper above-the-fold messaging lowers bounce and improves retention.",
      },
      {
        issue: "Page flow lacks strong persuasion sequencing",
        evidence:
          "Sections do not clearly move users from interest to proof to conversion action.",
        fix:
          "Restructure page into Hook → Value → Proof → CTA progression.",
        impact:
          "Better persuasion flow can lift scroll depth and completion rate.",
      },
    ],
    summary:
      "The page shows moderate conversion readiness but still contains several consultant-level persuasion leaks suppressing action.",
    roadmap: [
      "Rewrite hero messaging with a stronger business outcome promise.",
      "Improve CTA placement and upgrade button copy with urgency.",
      "Add trust reinforcement assets across conversion decision points.",
      "Tighten page sequencing to create a cleaner persuasion journey.",
    ],
    revenueNotes: [
      "Weak trust and CTA clarity are likely reducing conversions from paid and organic traffic.",
      "Sharper persuasion structure can materially improve revenue generated per visitor.",
    ],
    quickWins: {
      headlineFix: "Get More Customers Without Increasing Ad Spend",
      ctaFix: "Start My Free Conversion Audit",
      trustFix: "Trusted by 500+ growth-focused businesses",
    },
    visualLabels: [
      "Weak CTA visibility",
      "Missing trust proof",
      "Dense hero messaging",
    ],
  };
}

export async function generateAIAudit(scan: ScanPayload) {
  try {
    const prompt = `
You are a world-class AI Conversion Consultant.

Behave like:
- senior CRO strategist
- landing page persuasion expert
- SaaS growth consultant

Your job:
identify exactly what is hurting conversions,
show evidence,
prescribe fixes,
and estimate impact.

==============================
PAGE DATA
==============================

URL: ${scan.url}
SCREENSHOT: ${scan.screenshotUrl}

TITLE: ${scan.pageTitle}
META: ${scan.metaDescription}
H1: ${scan.h1Text}
SUBHEADLINE: ${scan.subHeadline}

H2 COUNT: ${scan.h2Count}
PARAGRAPHS: ${scan.pCount}
WORDS: ${scan.wordCount}

BUTTONS: ${scan.buttonCount}
CTA TEXTS: ${scan.ctaTexts.join(", ")}

NAV: ${scan.navLinks.join(", ")}

IMAGES: ${scan.imageCount}
FORMS: ${scan.formCount}

TESTIMONIALS: ${scan.hasTestimonials}
TRUST BADGES: ${scan.hasTrustBadges}
PRICING: ${scan.hasPricing}
FAQ: ${scan.hasFAQ}
GUARANTEE: ${scan.hasGuarantee}
URGENCY: ${scan.urgencySignals}
SOCIAL PROOF: ${scan.socialProofSignals}
FOOTER CTA: ${scan.footerCta}

==============================
RETURN STRICT VALID JSON ONLY
==============================

{
  "consultantFindings": [
    {
      "issue": "",
      "evidence": "",
      "fix": "",
      "impact": ""
    },
    {
      "issue": "",
      "evidence": "",
      "fix": "",
      "impact": ""
    },
    {
      "issue": "",
      "evidence": "",
      "fix": "",
      "impact": ""
    },
    {
      "issue": "",
      "evidence": "",
      "fix": "",
      "impact": ""
    }
  ],
  "summary": "",
  "roadmap": ["", "", "", ""],
  "revenueNotes": ["", ""],
  "quickWins": {
    "headlineFix": "",
    "ctaFix": "",
    "trustFix": ""
  },
  "visualLabels": ["", "", ""]
}

RULES:
- be highly specific
- evidence must feel page-specific
- no robotic wording
- no markdown
- no explanation outside JSON
`;

    const completion = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || "{}";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.log("JSON PARSE FAILED:", cleaned);
      return fallbackResponse();
    }

    if (
      !parsed.consultantFindings ||
      !Array.isArray(parsed.consultantFindings)
    ) {
      return fallbackResponse();
    }

    if (!parsed.quickWins) {
      parsed.quickWins = fallbackResponse().quickWins;
    }

    if (!parsed.visualLabels) {
      parsed.visualLabels = fallbackResponse().visualLabels;
    }

    if (!parsed.roadmap) {
      parsed.roadmap = fallbackResponse().roadmap;
    }

    if (!parsed.revenueNotes) {
      parsed.revenueNotes = fallbackResponse().revenueNotes;
    }

    return parsed;
  } catch (error) {
    console.log("AI AUDIT ERROR:", error);
    return fallbackResponse();
  }
}