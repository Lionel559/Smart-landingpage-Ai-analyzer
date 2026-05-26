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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing audit id" },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!audit || audit.userId !== userId) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.log("AUDIT DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to delete audit" },
      { status: 500 }
    );
  }
}
