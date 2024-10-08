import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";

export async function GET(req: NextRequest) {
  try {
    const { isAuth, account } = await jwtCheck(req);
    if (!isAuth || !account) {
      return failedJWTCheck();
    }
    const searchParams = req.nextUrl.searchParams;

    const bookId = searchParams.get("bookId");

    if (!bookId) return missingFields();

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      include: {
        Categories: true,
        _count: {
          select: {
            Transactions: {
              where: {
                receivedFrom: "SYSTEM",
                returnedAt: null,
              },
            },
            LikedBy: {
              where: {
                id: account.id,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: book });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
