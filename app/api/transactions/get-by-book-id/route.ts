import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { message: "Missing required field(s) to fetch data" },
        { status: 400 }
      );
    }

    const listTransactions = await prisma.transaction.findMany({
      where: {
        bookId,
      },
    });

    return NextResponse.json({ listTransactions }, { status: 200 });
  } catch (err) {
    throw err;
  }
}
