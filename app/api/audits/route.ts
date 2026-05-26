import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getAuthUserId() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/authOptions");

  const session = await getServerSession(authOptions);

  return (session?.user as { id?: string } | undefined)?.id || null;
}

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json([]);
    }

    const audits = await prisma.audit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.log("AUDITS API ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const saved = await prisma.audit.create({
      data: {
        siteUrl: body.siteUrl || "",
        seo: body.seo || 0,
        ux: body.ux || 0,
        cta: body.cta || 0,
        trust: body.trust || 0,
        mobile: body.mobile || 0,
        health: body.health || 0,
        critical: body.critical || 0,
        medium: body.medium || 0,
        minor: body.minor || 0,
        confidence: body.confidence || 0,
        findings: body.findings || [],
        summary: body.summary || "",
        roadmap: body.roadmap || [],
        revenueNotes: body.revenueNotes || [],
        consultantFindings: body.consultantFindings || [],
        visualFlags: body.visualFlags || body.visualOverlays || [],
        aiFixes: body.aiFixes || {
          visualScores: body.visualScores || {},
          visualOverlays: body.visualOverlays || [],
          analysisMode: body.analysisMode || "",
        },
        quickWins: body.quickWins || {
          headlineFix: "",
          ctaFix: "",
          trustFix: "",
        },
        visualLabels: body.visualLabels || [],
        industry: body.industry || null,
        industryConfidence:
          typeof body.industryConfidence === "number"
            ? body.industryConfidence
            : null,
        industryReasons: body.industryReasons || [],
        screenshotUrl: body.screenshotUrl || "",
        isPublic:
          typeof body.isPublic === "boolean" ? body.isPublic : true,
        userId,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.log("AUDITS POST ERROR:", error);

    return NextResponse.json(
      { error: "Unable to save audit" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      id?: string;
      isPublic?: boolean;
    };

    if (!body.id || typeof body.isPublic !== "boolean") {
      return NextResponse.json(
        { error: "Missing report visibility details" },
        { status: 400 }
      );
    }

    const updated = await prisma.audit.updateMany({
      where: {
        id: body.id,
        userId,
      },
      data: {
        isPublic: body.isPublic,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: body.id,
      isPublic: body.isPublic,
    });
  } catch (error) {
    console.log("AUDITS PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update report visibility" },
      { status: 500 }
    );
  }
}
