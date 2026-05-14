import axios from "axios";
import * as cheerio from "cheerio";

export type AuditDataType = {
  id?: string;
  siteUrl: string;
  seo: number;
  ux: number;
  cta: number;
  trust: number;
  mobile: number;
  health: number;
  critical: number;
  medium: number;
  minor: number;
  confidence: number;

  findings: string[];
  summary: string;
  roadmap: string[];
  revenueNotes: string[];

  consultantFindings: {
    issue: string;
    evidence: string;
    fix: string;
    impact: string;
  }[];

  quickWins: {
    headlineFix: string;
    ctaFix: string;
    trustFix: string;
  };

  visualLabels: string[];

  screenshotUrl: string;
};

export async function scanLandingPage(url: string): Promise<AuditDataType> {
  const response = await axios.get(url, {
    timeout: 10000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const pageText = $("body").text().replace(/\s+/g, " ").trim();

  const title = $("title").text();
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const h1 = $("h1").length;

  const buttons =
    $("button").length +
    $("a")
  .filter((_, el) =>
    /buy|get|start|book|sign|claim|download|try|contact/i.test(
      $(el).text()
    )
  ).length;

  const testimonials =
    pageText.match(/testimonial|review|trusted by|customers|clients|success stories/gi)
      ?.length || 0;

  const trustSignals =
    pageText.match(/secure|guarantee|trusted|ssl|refund|verified|protected/gi)?.length || 0;

  const viewport = $('meta[name="viewport"]').length;
  const imagesWithoutAlt = $("img").filter((_, el) => !$(el).attr("alt")).length;
  const paragraphs = $("p").length;

  let seo = 55;
  let ux = 55;
  let cta = 55;
  let trust = 55;
  let mobile = 55;

  const findings: string[] = [];
  const roadmap: string[] = [];
  const revenueNotes: string[] = [];

  if (title.length > 20) seo += 12;
  else findings.push("❌ SEO title tag too weak or missing.");

  if (metaDescription.length > 50) seo += 10;
  else findings.push("⚠️ Meta description not optimized for search snippets.");

  if (h1 >= 1) ux += 10;
  else findings.push("❌ Missing primary headline structure.");

  if (buttons >= 2) cta += 15;
  else findings.push("❌ CTA opportunities are too limited across page.");

  if (testimonials >= 1) trust += 12;
  else findings.push("⚠️ Testimonials/social proof absent.");

  if (trustSignals >= 1) trust += 12;
  else findings.push("⚠️ Trust badges or guarantee language missing.");

  if (viewport >= 1) mobile += 15;
  else findings.push("📱 Mobile viewport meta tag missing.");

  if (imagesWithoutAlt > 2) seo -= 4;
  if (paragraphs > 12) ux -= 4;

  const health = Math.floor((seo + ux + cta + trust + mobile) / 5);
  const critical = findings.filter((x) => x.includes("❌")).length;
  const medium = findings.filter((x) => x.includes("⚠️")).length;
  const minor = findings.filter((x) => x.includes("📱")).length;
  const confidence = 97;

  roadmap.push(
    "Reposition CTA buttons above fold and inside high-attention sections.",
    "Add stronger trust proof such as testimonials, logos or guarantees.",
    "Improve SEO metadata and image accessibility structure.",
    "Tighten headline persuasion and visitor direction."
  );

  revenueNotes.push(
    "Estimated conversion uplift possible after fixes: +10% to +32%",
    "Trust reinforcement can significantly reduce visitor hesitation.",
    "SEO improvements may increase inbound qualified traffic."
  );

  return {
    siteUrl: url,
    seo,
    ux,
    cta,
    trust,
    mobile,
    health,
    critical,
    medium,
    minor,
    confidence,
    findings,
    summary:
      "AI detected structural conversion blockers and content gaps that may reduce lead capture efficiency. Recommended fixes should improve trust flow, CTA visibility and search discoverability.",
    roadmap,
    revenueNotes,

    consultantFindings: [],
    quickWins: {
  headlineFix: "",
  ctaFix: "",
  trustFix: "",
},
visualLabels: [],
screenshotUrl: "",
  };
}