import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";

export async function GET(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const searchParams = req.nextUrl.searchParams;
    const bookId = searchParams.get("bookId");

    if (!bookId) return missingFields();

    const requesting = await prisma.transaction.findMany({
      where: {
        bookId,
        receivedFrom: {
          equals: null,
        },
        returnedAt: {
          equals: null,
        },
      },
      include: {
        Account: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ data: requesting });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
