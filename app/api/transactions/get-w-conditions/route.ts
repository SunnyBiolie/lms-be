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

    const type = searchParams.get("type") as
      | "borrowing"
      | "requesting"
      | "returned";
    const by = searchParams.get("by") as "account" | "book";
    const id = searchParams.get("id");

    if (!type || !by || !id) return missingFields();

    switch (by) {
      case "account":
        switch (type) {
          case "borrowing":
            const borrowing = await prisma.transaction.findMany({
              where: {
                accountId: id,
                returnedAt: {
                  equals: null,
                },
                receivedFrom: {
                  not: null,
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: borrowing });
          case "requesting":
            const requesting = await prisma.transaction.findMany({
              where: {
                accountId: id,
                returnedAt: {
                  equals: null,
                },
                receivedFrom: {
                  equals: null,
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: requesting });
          case "returned":
            const returned = await prisma.transaction.findMany({
              where: {
                accountId: id,
                returnedAt: {
                  not: null,
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: returned });
        }
      case "book":
        switch (type) {
          case "borrowing":
            const borrowing = await prisma.transaction.findMany({
              where: {
                bookId: id,
                returnedAt: {
                  equals: null,
                },
                receivedFrom: {
                  equals: "SYSTEM",
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: borrowing });
          case "requesting":
            const requesting = await prisma.transaction.findMany({
              where: {
                bookId: id,
                returnedAt: {
                  equals: null,
                },
                receivedFrom: {
                  equals: null,
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: requesting });
          case "returned":
            const returned = await prisma.transaction.findMany({
              where: {
                bookId: id,
                returnedAt: {
                  not: null,
                },
                receivedFrom: {
                  equals: "SYSTEM",
                },
              },
              include: {
                Account: {
                  select: {
                    fullName: true,
                  },
                },
                Book: {
                  select: {
                    title: true,
                  },
                },
              },
            });
            return NextResponse.json({ data: returned });
        }
      default:
        throw new Error("");
    }
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
