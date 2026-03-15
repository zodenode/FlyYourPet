import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.document.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.redirect(
      new URL("/admin/documents", _req.url),
      303
    );
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}
