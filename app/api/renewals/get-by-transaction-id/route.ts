import { missingFields } from "@/configs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");
    if (!transactionId) return missingFields();

    const renewals = await prisma.renewal.findMany({
      where: {
        transactionId,
      },
      orderBy: {
        renewedAt: "desc",
      },
    });

    return NextResponse.json({ data: renewals });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
