import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return missingFields();
    }

    const listTransactions = await prisma.transaction.findMany({
      where: {
        bookId,
        returnedAt: {
          equals: null,
        },
        receivedFrom: {
          not: null,
        },
      },
      include: {
        Renewals: true,
      },
    });

    return NextResponse.json({ listTransactions }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
