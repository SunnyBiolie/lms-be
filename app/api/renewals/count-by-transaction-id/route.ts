import { missingFields } from "@/configs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");
    if (!transactionId) return missingFields();

    const count = await prisma.renewal.count({
      where: {
        transactionId,
      },
    });

    return NextResponse.json({ data: count });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
