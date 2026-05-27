import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type FeedbackRequest = {
  auditId?: string;
  rating?: string;
  comment?: string;
};

const allowedRatings = ["helpful", "not_accurate"];

async function getAuthUserId() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/authOptions");

  const session = await getServerSession(authOptions);

  return (session?.user as { id?: string } | undefined)?.id || null;
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

    const body = (await req.json()) as FeedbackRequest;
    const auditId = String(body.auditId || "").trim();
    const rating = String(body.rating || "").trim();
    const comment = String(body.comment || "").trim().slice(0, 1200);

    if (!auditId || !allowedRatings.includes(rating)) {
      return NextResponse.json(
        { error: "Missing or invalid feedback details" },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const feedback = await prisma.auditFeedback.create({
      data: {
        auditId,
        rating,
        comment: comment || null,
      },
      select: {
        id: true,
        rating: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("AUDIT FEEDBACK ERROR:", error);

    return NextResponse.json(
      { error: "Unable to save feedback" },
      { status: 500 }
    );
  }
}
