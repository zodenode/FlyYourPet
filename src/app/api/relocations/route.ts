import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const destination = searchParams.get("destination");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (destination) where.destination = { contains: destination, mode: "insensitive" };

  const [relocations, total] = await Promise.all([
    prisma.relocation.findMany({
      where,
      include: {
        pet: {
          include: {
            owner: { select: { id: true, name: true, phone: true, email: true, telegramId: true } },
            documents: true,
          },
        },
        flight: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.relocation.count({ where }),
  ]);

  return NextResponse.json({ relocations, total, page, limit });
}
