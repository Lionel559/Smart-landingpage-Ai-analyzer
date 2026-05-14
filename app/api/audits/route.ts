import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const audits = await prisma.audit.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    const normalized = audits.map((audit: any) => ({
      ...audit,
      consultantFindings: audit.consultantFindings || [],
      quickWins: audit.quickWins || {},
      visualLabels: audit.visualLabels || [],
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.log("AUDITS GET ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

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
        quickWins: body.quickWins || {},
        visualLabels: body.visualLabels || [],
        screenshotUrl: body.screenshotUrl || "",
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