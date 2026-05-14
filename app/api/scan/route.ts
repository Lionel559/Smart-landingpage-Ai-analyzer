import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner";
import { getVisualScan } from "@/lib/visionScan";
import { generateAIAudit } from "@/lib/aiAudit";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clamp = (num: number) =>
  Math.max(18, Math.min(98, Math.floor(num)));

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    let scan: any = null;
    let visual: any = null;

    try {
      scan = await scanWebsite(url);
    } catch (err) {
      console.log("SCAN FAILED:", err);
    }

    try {
      visual = await getVisualScan(url);
    } catch (err) {
      console.log("VISUAL FAILED:", err);
    }

    const screenshot =
      visual?.screenshotUrl &&
      !visual.screenshotUrl.includes("unauthorized")
        ? visual.screenshotUrl
        : `https://api.microlink.io/?url=${encodeURIComponent(
            url
          )}&screenshot=true&meta=false&embed=screenshot.url`;

    // ============================================
    // FALLBACK MODE
    // ============================================
    if (!scan || !scan.pageTitle) {
      const ai = await generateAIAudit({
        url,
        screenshotUrl: screenshot,
        pageTitle: "",
        metaDescription: "",
        h1Text: "",
        h2Count: 0,
        pCount: 0,
        buttonCount: 0,
        imageCount: 0,
        formCount: 0,
        hasTestimonials: false,
        hasTrustBadges: false,
        hasPricing: false,
        subHeadline: "",
        ctaTexts: [],
        navLinks: [],
        hasFAQ: false,
        hasGuarantee: false,
        urgencySignals: false,
        socialProofSignals: false,
        footerCta: false,
        wordCount: 0,
      });

      const consultantFindings = ai?.consultantFindings || [];
      const findings =
        consultantFindings.length > 0
          ? consultantFindings.map((x: any) => x.issue)
          : ai?.findings || ["AI analysis unavailable"];

      const fallbackAudit = await prisma.audit.create({
        data: {
          siteUrl: url,
          seo: 60,
          ux: 62,
          cta: 58,
          trust: 55,
          mobile: 65,
          health: 60,
          critical: 3,
          medium: 4,
          minor: 2,
          confidence: 65,
          findings,
          summary: ai?.summary || "AI summary unavailable",
          roadmap: ai?.roadmap || [],
          revenueNotes: ai?.revenueNotes || [],
          consultantFindings,
          quickWins: ai?.quickWins || {},
          visualLabels: ai?.visualLabels || [],
          screenshotUrl: screenshot,
          userId,
        },
      });

      return NextResponse.json(fallbackAudit);
    }

    // ============================================
    // SCORING ENGINE
    // ============================================
    let seo = 38;
    if (scan.pageTitle.length > 15) seo += 12;
    if (scan.metaDescription.length > 50) seo += 12;
    if (scan.h1Text.length > 10) seo += 8;
    if (scan.h2Count >= 2) seo += 8;
    if (scan.wordCount > 500) seo += 6;
    if (scan.navLinks.length >= 3) seo += 5;

    let ux = 35;
    if (scan.subHeadline.length > 20) ux += 12;
    if (scan.imageCount >= 3) ux += 10;
    if (scan.h2Count >= 3) ux += 8;
    if (scan.pCount <= 35) ux += 7;
    if (scan.hasFAQ) ux += 5;
    if (visual?.textHeavyHero) ux -= 6;

    let cta = 30;
    if (scan.buttonCount >= 2) cta += 10;
    if (scan.buttonCount >= 4) cta += 8;
    if (scan.formCount >= 1) cta += 10;
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
    if (scan.pCount <= 25) mobile += 10;
    if (scan.inputCount <= 4) mobile += 8;
    if (scan.imageCount >= 2) mobile += 6;
    if (scan.buttonCount >= 2) mobile += 6;
    if (scan.navLinks.length <= 6) mobile += 6;

    seo = clamp(seo);
    ux = clamp(ux);
    cta = clamp(cta);
    trust = clamp(trust);
    mobile = clamp(mobile);

    const health = clamp((seo + ux + cta + trust + mobile) / 5);

    const critical =
      health < 45 ? 5 : health < 60 ? 4 : health < 75 ? 3 : 2;
    const medium =
      health < 45 ? 6 : health < 60 ? 5 : health < 75 ? 4 : 2;
    const minor =
      health < 45 ? 3 : health < 60 ? 3 : health < 75 ? 2 : 1;

    const confidence = clamp(
      72 +
        Math.floor(scan.wordCount / 400) +
        scan.buttonCount +
        scan.formCount +
        (scan.hasTestimonials ? 3 : 0)
    );

    const ai = await generateAIAudit({
      url,
      screenshotUrl: screenshot,
      pageTitle: scan.pageTitle,
      metaDescription: scan.metaDescription,
      h1Text: scan.h1Text,
      h2Count: scan.h2Count,
      pCount: scan.pCount,
      buttonCount: scan.buttonCount,
      imageCount: scan.imageCount,
      formCount: scan.formCount,
      hasTestimonials: scan.hasTestimonials,
      hasTrustBadges: scan.hasTrustBadges,
      hasPricing: scan.hasPricing,
      subHeadline: scan.subHeadline,
      ctaTexts: scan.ctaTexts,
      navLinks: scan.navLinks,
      hasFAQ: scan.hasFAQ,
      hasGuarantee: scan.hasGuarantee,
      urgencySignals: scan.urgencySignals,
      socialProofSignals: scan.socialProofSignals,
      footerCta: scan.footerCta,
      wordCount: scan.wordCount,
      modernDesignLikely: visual?.modernDesignLikely,
      ecommerceLikely: visual?.ecommerceLikely,
      fintechLikely: visual?.fintechLikely,
    });

    const consultantFindings = ai?.consultantFindings || [];
    const findings =
      consultantFindings.length > 0
        ? consultantFindings.map((x: any) => x.issue)
        : ai?.findings || ["AI analysis unavailable"];

    const savedAudit = await prisma.audit.create({
      data: {
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
        summary: ai?.summary || "AI summary unavailable",
        roadmap: ai?.roadmap || [],
        revenueNotes: ai?.revenueNotes || [],
        consultantFindings,
        quickWins: ai?.quickWins || {},
        visualLabels: ai?.visualLabels || [],
        screenshotUrl: screenshot,
        userId,
      },
    });

    return NextResponse.json(savedAudit);
  } catch (error) {
    console.log("SCAN ROUTE ERROR:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}