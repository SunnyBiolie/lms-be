import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) return missingFields();

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      omit: {
        passWord: true,
      },
    });

    return NextResponse.json({ data: account });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
