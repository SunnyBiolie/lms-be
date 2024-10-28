import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function GET(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const searchParams = req.nextUrl.searchParams;
    const current = searchParams.get("current")
      ? Number(searchParams.get("current"))
      : 1;
    const pageSize = searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 5;

    const total = await prisma.book.count();

    const listBooks = await prisma.book.findMany({
      skip: pageSize * (current - 1),
      take: pageSize,
      include: {
        Categories: true,
        _count: {
          select: {
            Transactions: {
              where: {
                returnedAt: {
                  equals: null,
                },
                receivedFrom: {
                  equals: "SYSTEM",
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: {
        listBooks,
        total,
        pagination: {
          current,
          pageSize,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
