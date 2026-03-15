import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStatusNotification } from "@/lib/notifications";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const relocation = await prisma.relocation.findUnique({
    where: { id },
    include: {
      pet: {
        include: {
          owner: true,
          documents: true,
        },
      },
      flight: { include: { volunteer: true } },
    },
  });

  if (!relocation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(relocation);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const allowed = ["status", "notes", "flightId", "package"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const oldRelocation = await prisma.relocation.findUnique({
    where: { id },
    include: { pet: { include: { owner: true } } },
  });

  const updated = await prisma.relocation.update({
    where: { id },
    data,
    include: {
      pet: { include: { owner: true, documents: true } },
      flight: true,
    },
  });

  if (
    body.status &&
    oldRelocation &&
    oldRelocation.status !== body.status &&
    oldRelocation.pet.owner.telegramId
  ) {
    await sendStatusNotification(
      oldRelocation.pet.owner.telegramId,
      body.status,
      oldRelocation.pet.breed || "Your pet"
    );
  }

  return NextResponse.json(updated);
}
