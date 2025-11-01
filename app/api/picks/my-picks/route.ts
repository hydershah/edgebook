import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const picks = await prisma.pick.findMany({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedPicks = picks.map((pick) => ({
      ...pick,
      createdAt: pick.createdAt.toISOString(),
      gameDate: pick.gameDate.toISOString(),
      lockedAt: pick.lockedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ picks: serializedPicks });
  } catch (error) {
    console.error("Error fetching picks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
