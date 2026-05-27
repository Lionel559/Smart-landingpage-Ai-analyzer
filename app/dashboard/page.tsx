import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

const FREE_WEEKLY_SCAN_LIMIT = 2;
const SCAN_RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

const isFreePlan = (plan?: string | null) =>
  (plan || "free").toLowerCase() === "free";

const getResetAt = (lastScanReset: Date | null, now: Date) =>
  new Date((lastScanReset || now).getTime() + SCAN_RESET_INTERVAL_MS);

async function getDashboardUsage(userId: string) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      scansUsed: true,
      lastScanReset: true,
    },
  });

  if (!user) {
    return {
      plan: "free",
      scansUsed: 0,
      limit: FREE_WEEKLY_SCAN_LIMIT,
      resetAt: getResetAt(now, now).toISOString(),
    };
  }

  const shouldReset =
    !user.lastScanReset ||
    now.getTime() - user.lastScanReset.getTime() >= SCAN_RESET_INTERVAL_MS;

  const usage = shouldReset
    ? await prisma.user.update({
        where: { id: userId },
        data: {
          scansUsed: 0,
          lastScanReset: now,
        },
        select: {
          plan: true,
          scansUsed: true,
          lastScanReset: true,
        },
      })
    : user;

  const free = isFreePlan(usage.plan);

  return {
    plan: usage.plan,
    scansUsed: usage.scansUsed,
    limit: free ? FREE_WEEKLY_SCAN_LIMIT : null,
    resetAt: free ? getResetAt(usage.lastScanReset, now).toISOString() : null,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const initialUsage = await getDashboardUsage(userId);

  return <DashboardClient initialUsage={initialUsage} />;
}
