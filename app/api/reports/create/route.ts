import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";
import { Transaction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { month, year } = reqData;

    if (!month || !year) return missingFields();

    // const report = await prisma.report.create({
    //   data: {
    //     month,
    //     year,
    //   },
    // });

    const borrowed = await prisma.transaction.findMany({
      where: {
        borrowedAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
        receivedFrom: {
          not: null,
        },
      },
    });

    const uniqueBorrowedId = [...new Set(borrowed.map((b) => b.accountId))];

    const listBorrowedCount = uniqueBorrowedId.map((id) => {
      const arr = borrowed.filter((item) => item.accountId === id);
      return {
        id,
        borrowedCount: arr.length,
      };
    });

    const returned = await prisma.transaction.findMany({
      where: {
        returnedAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    const uniqueReturnedId = [...new Set(returned.map((b) => b.accountId))];

    const listReturnedCount = uniqueReturnedId.map((id) => {
      const arr = returned.filter((item) => item.accountId === id);
      return {
        id,
        returnedCount: arr.length,
      };
    });

    [...listBorrowedCount, ...listReturnedCount]

    return NextResponse.json({ data: [...listBorrowedCount, ...listReturnedCount] });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
