import { missingFields } from "@/configs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return missingFields();
    }

    const histories = await prisma.history.findMany({
      where: {
        accountId,
      },
      orderBy: {
        returnedAt: "desc",
      },
    });

    return NextResponse.json({ data: histories });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
