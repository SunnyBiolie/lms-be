import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { message: "Missing required field(s) to fetch data" },
        { status: 400 }
      );
    }

    const logs = await prisma.log.findMany({
      where: {
        accountId,
      },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    throw error;
  }
}
