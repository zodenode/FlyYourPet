import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalUsers,
    totalRelocations,
    activeRelocations,
    deliveredRelocations,
    statusCounts,
    recentRelocations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.relocation.count(),
    prisma.relocation.count({
      where: { status: { notIn: ["delivered", "cancelled"] } },
    }),
    prisma.relocation.count({ where: { status: "delivered" } }),
    prisma.relocation.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.relocation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        pet: {
          include: {
            owner: { select: { name: true, telegramId: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalRelocations,
    activeRelocations,
    deliveredRelocations,
    statusCounts: Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count])
    ),
    recentRelocations,
  });
}
