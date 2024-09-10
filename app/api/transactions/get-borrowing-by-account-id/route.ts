import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) return missingFields();

    const borrowing = await prisma.transaction.findMany({
      where: {
        accountId,
        returnedAt: {
          equals: null,
        },
      },
      include: {
        Renewals: true,
      },
    });

    return NextResponse.json({ data: borrowing }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
