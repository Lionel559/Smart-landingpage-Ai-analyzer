export const WEBSITE_INDUSTRIES = [
  "SaaS",
  "Ecommerce",
  "Fintech / Payment",
  "Education / School",
  "Music / Entertainment",
  "Portfolio",
  "Agency",
  "Healthcare",
  "Real Estate",
  "Restaurant / Food",
  "Nonprofit",
  "General Business",
] as const;

export type WebsiteIndustry = (typeof WEBSITE_INDUSTRIES)[number];

export type WebsiteIndustryDetection = {
  industry: WebsiteIndustry;
  confidence: number;
  reasons: string[];
};

export type WebsiteIndustryScan = {
  pageTitle?: string;
  metaDescription?: string;
  h1Text?: string;
  subHeadline?: string;
  ctaTexts?: string[];
  navLinks?: string[];
  bodyTextSnippet?: string;
  hasPricing?: boolean;
  formCount?: number;
  inputCount?: number;
  hasTestimonials?: boolean;
  hasTrustBadges?: boolean;
  hasGuarantee?: boolean;
  socialProofSignals?: boolean;
  ecommerceLikely?: boolean;
  fintechLikely?: boolean;
};

type IndustryRule = {
  keywords: string[];
  ctas: string[];
  nav: string[];
};

const industryRules: Record<Exclude<WebsiteIndustry, "General Business">, IndustryRule> = {
  SaaS: {
    keywords: [
      "software",
      "saas",
      "platform",
      "dashboard",
      "automation",
      "workflow",
      "crm",
      "api",
      "integration",
      "integrations",
      "teams",
      "productivity",
      "subscription",
      "demo",
      "free trial",
      "startup",
      "b2b",
    ],
    ctas: ["start free", "free trial", "book a demo", "request demo", "try free", "sign up"],
    nav: ["features", "pricing", "integrations", "customers", "enterprise", "demo"],
  },
  Ecommerce: {
    keywords: [
      "shop",
      "store",
      "product",
      "products",
      "cart",
      "checkout",
      "shipping",
      "returns",
      "sale",
      "discount",
      "collection",
      "collections",
      "reviews",
      "order",
      "buy now",
      "add to cart",
    ],
    ctas: ["shop now", "buy now", "add to cart", "checkout", "order now", "view product"],
    nav: ["shop", "products", "collections", "cart", "shipping", "returns", "sale"],
  },
  "Fintech / Payment": {
    keywords: [
      "payment",
      "payments",
      "fintech",
      "bank",
      "banking",
      "finance",
      "wallet",
      "invoice",
      "invoices",
      "merchant",
      "card",
      "credit",
      "debit",
      "transfer",
      "transaction",
      "transactions",
      "checkout",
      "pos",
      "payroll",
      "pci",
      "kyc",
      "fraud",
      "compliance",
      "secure payments",
    ],
    ctas: ["start accepting payments", "open account", "get paid", "send money", "start now"],
    nav: ["security", "pricing", "payments", "developers", "compliance", "industries"],
  },
  "Education / School": {
    keywords: [
      "school",
      "education",
      "academy",
      "university",
      "college",
      "students",
      "parents",
      "admissions",
      "enrollment",
      "tuition",
      "programs",
      "courses",
      "curriculum",
      "campus",
      "accredited",
      "faculty",
    ],
    ctas: ["apply now", "enroll", "admissions", "request info", "book a tour", "visit campus"],
    nav: ["admissions", "programs", "courses", "tuition", "campus", "students", "parents"],
  },
  "Music / Entertainment": {
    keywords: [
      "music",
      "artist",
      "band",
      "album",
      "single",
      "song",
      "songs",
      "streaming",
      "spotify",
      "apple music",
      "soundcloud",
      "youtube",
      "tour",
      "tickets",
      "concert",
      "events",
      "booking",
      "playlist",
      "fans",
      "video",
      "entertainment",
      "festival",
      "merch",
    ],
    ctas: ["listen now", "stream now", "watch video", "book now", "buy tickets", "join fans"],
    nav: ["music", "videos", "tour", "events", "booking", "tickets", "merch"],
  },
  Portfolio: {
    keywords: [
      "portfolio",
      "selected work",
      "projects",
      "case study",
      "case studies",
      "designer",
      "developer",
      "photographer",
      "resume",
      "cv",
      "hire me",
      "my work",
      "freelance",
    ],
    ctas: ["view work", "hire me", "contact me", "download resume", "see projects"],
    nav: ["work", "portfolio", "projects", "about", "resume", "contact"],
  },
  Agency: {
    keywords: [
      "agency",
      "studio",
      "marketing",
      "branding",
      "web design",
      "design agency",
      "creative",
      "growth",
      "seo",
      "content",
      "campaigns",
      "clients",
      "services",
      "strategy",
    ],
    ctas: ["book a call", "get a quote", "start a project", "work with us", "contact us"],
    nav: ["services", "work", "case studies", "clients", "process", "contact"],
  },
  Healthcare: {
    keywords: [
      "healthcare",
      "health",
      "clinic",
      "doctor",
      "physician",
      "medical",
      "dental",
      "dentist",
      "patient",
      "patients",
      "therapy",
      "therapist",
      "treatment",
      "wellness",
      "insurance",
      "appointment",
      "hipaa",
    ],
    ctas: ["book appointment", "schedule appointment", "find a doctor", "contact clinic"],
    nav: ["services", "patients", "insurance", "appointments", "doctors", "treatments"],
  },
  "Real Estate": {
    keywords: [
      "real estate",
      "realtor",
      "property",
      "properties",
      "homes",
      "house",
      "listing",
      "listings",
      "mortgage",
      "apartment",
      "apartments",
      "rent",
      "rental",
      "broker",
      "agent",
      "viewing",
      "open house",
    ],
    ctas: ["view listings", "schedule viewing", "book a tour", "find a home", "list your home"],
    nav: ["listings", "properties", "buyers", "sellers", "neighborhoods", "agents"],
  },
  "Restaurant / Food": {
    keywords: [
      "restaurant",
      "food",
      "menu",
      "chef",
      "cafe",
      "catering",
      "cuisine",
      "reservation",
      "delivery",
      "takeout",
      "order online",
      "breakfast",
      "lunch",
      "dinner",
      "pizza",
      "burger",
      "bakery",
      "coffee",
    ],
    ctas: ["order online", "reserve table", "book a table", "view menu", "get delivery"],
    nav: ["menu", "reservations", "order", "catering", "locations", "delivery"],
  },
  Nonprofit: {
    keywords: [
      "nonprofit",
      "charity",
      "donate",
      "donation",
      "volunteer",
      "foundation",
      "mission",
      "community",
      "cause",
      "impact",
      "fundraising",
      "donor",
      "ngo",
      "campaign",
      "support us",
    ],
    ctas: ["donate", "volunteer", "support us", "give now", "join us"],
    nav: ["mission", "impact", "donate", "volunteer", "programs", "about"],
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

const clean = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, " ").trim();

const joinList = (value?: string[]) =>
  Array.isArray(value) ? value.map(clean).filter(Boolean).join(" ") : "";

function containsSignal(text: string, keyword: string) {
  if (!text || !keyword) return false;

  const normalizedKeyword = clean(keyword);

  if (!normalizedKeyword) return false;

  if (normalizedKeyword.length <= 3) {
    return new RegExp(`\\b${normalizedKeyword}\\b`, "i").test(text);
  }

  return text.includes(normalizedKeyword);
}

function scoreKeywords(
  text: string,
  keywords: string[],
  weight: number,
  label: string,
  reasons: string[]
) {
  const matches = keywords
    .filter((keyword) => containsSignal(text, keyword))
    .slice(0, 5);

  if (!matches.length) return 0;

  reasons.push(`${label}: ${matches.slice(0, 3).join(", ")}`);

  return Math.min(matches.length, 5) * weight;
}

export function detectWebsiteIndustry(
  scan: WebsiteIndustryScan | null | undefined
): WebsiteIndustryDetection {
  const primaryText = clean(
    [
      scan?.pageTitle,
      scan?.metaDescription,
      scan?.h1Text,
      scan?.subHeadline,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const ctaText = joinList(scan?.ctaTexts);
  const navText = joinList(scan?.navLinks);
  const bodyText = clean(scan?.bodyTextSnippet);
  const hasTrust =
    !!scan?.hasTrustBadges ||
    !!scan?.hasGuarantee ||
    !!scan?.hasTestimonials ||
    !!scan?.socialProofSignals;

  const industryKeys = Object.keys(
    industryRules
  ) as Exclude<WebsiteIndustry, "General Business">[];
  const scores = industryKeys.reduce(
    (acc, industry) => ({ ...acc, [industry]: 0 }),
    {} as Record<Exclude<WebsiteIndustry, "General Business">, number>
  );
  const reasonMap = industryKeys.reduce(
    (acc, industry) => ({ ...acc, [industry]: [] }),
    {} as Record<Exclude<WebsiteIndustry, "General Business">, string[]>
  );

  industryKeys.forEach((industry) => {
      const rule = industryRules[industry];
      const reasons = reasonMap[industry];

      scores[industry] += scoreKeywords(
        primaryText,
        rule.keywords,
        6,
        "title/meta/headline signals",
        reasons
      );
      scores[industry] += scoreKeywords(
        ctaText,
        [...rule.keywords, ...rule.ctas],
        7,
        "CTA signals",
        reasons
      );
      scores[industry] += scoreKeywords(
        navText,
        [...rule.keywords, ...rule.nav],
        4,
        "navigation signals",
        reasons
      );
      scores[industry] += scoreKeywords(
        bodyText,
        rule.keywords,
        2,
        "page keyword signals",
        reasons
      );
    });

  if (scan?.hasPricing) {
    scores.SaaS += 4;
    scores.Ecommerce += 4;
    scores["Fintech / Payment"] += 2;
    reasonMap.SaaS.push("pricing/plans detected");
    reasonMap.Ecommerce.push("pricing or product pricing detected");
  }

  if ((scan?.formCount || 0) > 0 || (scan?.inputCount || 0) > 0) {
    scores["Education / School"] += 3;
    scores.Healthcare += 3;
    scores["Real Estate"] += 3;
    scores.Agency += 2;
    scores.SaaS += 2;
    reasonMap["Education / School"].push("lead/admissions form detected");
    reasonMap.Healthcare.push("appointment/contact form detected");
    reasonMap["Real Estate"].push("inquiry form detected");
  }

  if (hasTrust) {
    scores["Fintech / Payment"] += 4;
    scores.Healthcare += 4;
    scores["Education / School"] += 3;
    scores.Ecommerce += 2;
    scores.SaaS += 2;
    reasonMap["Fintech / Payment"].push("trust/security proof detected");
    reasonMap.Healthcare.push("trust proof detected");
    reasonMap["Education / School"].push("trust proof detected");
  }

  if (scan?.ecommerceLikely) {
    scores.Ecommerce += 8;
    reasonMap.Ecommerce.push("visual/url heuristic suggests ecommerce");
  }

  if (scan?.fintechLikely) {
    scores["Fintech / Payment"] += 8;
    reasonMap["Fintech / Payment"].push("visual/url heuristic suggests fintech");
  }

  const ranked = industryKeys
    .map((industry) => ({
      industry,
      score: scores[industry],
      reasons: reasonMap[industry],
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  const margin = best.score - (second?.score || 0);
  const confidence = clamp(38 + best.score * 2.1 + margin * 2.6, 25, 96);
  const lowConfidence = best.score < 10 || confidence < 58 || margin < 2;

  if (lowConfidence) {
    return {
      industry: "General Business",
      confidence: Math.min(confidence, 57),
      reasons: [
        "No industry-specific pattern exceeded the confidence threshold.",
        ...best.reasons.slice(0, 2),
      ],
    };
  }

  return {
    industry: best.industry,
    confidence,
    reasons: best.reasons.slice(0, 5),
  };
}

export function getIndustryConversionGuidance(industry?: WebsiteIndustry) {
  switch (industry) {
    case "Music / Entertainment":
      return "Focus on streaming links, fan engagement, event booking, audio/video visibility, artist branding, ticketing, and repeat fan touchpoints. Do not over-prioritize pricing unless sales intent is visible.";
    case "Education / School":
      return "Focus on admissions CTA clarity, program discovery, accreditation, parent/student trust, tuition clarity, campus/program reassurance, and inquiry pathways.";
    case "Fintech / Payment":
      return "Focus on security trust, compliance signals, pricing clarity, onboarding CTA, payment reliability, risk reversal, and merchant/customer confidence.";
    case "Ecommerce":
      return "Focus on product clarity, pricing, reviews, shipping/returns reassurance, checkout friction, product discovery, and buy/add-to-cart CTA strength.";
    case "SaaS":
      return "Focus on value proposition, signup CTA, demo CTA, proof, feature clarity, pricing expectations, integrations, and activation friction.";
    case "Healthcare":
      return "Focus on appointment pathways, provider credibility, patient trust, insurance clarity, treatment clarity, privacy reassurance, and accessibility.";
    case "Real Estate":
      return "Focus on property search, listing clarity, inquiry CTA, neighborhood confidence, agent trust, viewing flow, and lead capture.";
    case "Restaurant / Food":
      return "Focus on menu access, ordering/reservation CTA, food visuals, location clarity, hours, reviews, delivery/takeout flow, and appetite appeal.";
    case "Nonprofit":
      return "Focus on mission clarity, donation CTA, trust/impact proof, volunteer pathways, story credibility, and donor reassurance.";
    case "Agency":
      return "Focus on service clarity, proof of results, portfolio/case studies, contact CTA, positioning, process clarity, and credibility.";
    case "Portfolio":
      return "Focus on personal positioning, work samples, credibility, hiring/contact CTA, case study clarity, and visual presentation.";
    default:
      return "Focus on clear value proposition, CTA visibility, trust proof, page hierarchy, mobile clarity, and conversion friction.";
  }
}
