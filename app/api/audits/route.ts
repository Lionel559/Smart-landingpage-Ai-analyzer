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
    console.error("AUDITS API ERROR:", error);
    return NextResponse.json([]);
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
    console.error("AUDITS PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update report visibility" },
      { status: 500 }
    );
  }
}
