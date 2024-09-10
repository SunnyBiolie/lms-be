import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const listAccounts = await prisma.account.findMany({
      where: {
        id: {
          in: data.accountIds,
        },
      },
      select: {
        userName: true,
        id: true,
      },
    });

    return NextResponse.json({ listAccounts });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
