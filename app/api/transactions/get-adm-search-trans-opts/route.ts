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

    if (!type || !by) return missingFields();

    const options = [];
    switch (by) {
      case "account":
        const allAccounts = await prisma.account.findMany({
          where: {
            role: {
              not: "ADMIN",
            },
          },
        });

        switch (type) {
          case "borrowing":
            for await (const acc of allAccounts) {
              const count = await prisma.transaction.count({
                where: {
                  accountId: acc.id,
                  returnedAt: {
                    equals: null,
                  },
                  receivedFrom: {
                    not: null,
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: acc.id,
                  label: acc.fullName,
                  count,
                });
            }
            return NextResponse.json({ data: options });

          case "requesting":
            for await (const acc of allAccounts) {
              const count = await prisma.transaction.count({
                where: {
                  accountId: acc.id,
                  returnedAt: {
                    equals: null,
                  },
                  receivedFrom: {
                    equals: null,
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: acc.id,
                  label: acc.fullName,
                  count,
                });
            }
            return NextResponse.json({ data: options });

          case "returned":
            for await (const acc of allAccounts) {
              const count = await prisma.transaction.count({
                where: {
                  accountId: acc.id,
                  returnedAt: {
                    not: null,
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: acc.id,
                  label: acc.fullName,
                  count,
                });
            }
            return NextResponse.json({ data: options });
        }
      case "book":
        const allBooks = await prisma.book.findMany();

        switch (type) {
          case "borrowing":
            for await (const b of allBooks) {
              const count = await prisma.transaction.count({
                where: {
                  bookId: b.id,
                  returnedAt: {
                    equals: null,
                  },
                  receivedFrom: {
                    equals: "SYSTEM",
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: b.id,
                  label: b.title,
                  count,
                });
            }
            return NextResponse.json({ data: options });

          case "requesting":
            for await (const b of allBooks) {
              const count = await prisma.transaction.count({
                where: {
                  bookId: b.id,
                  returnedAt: {
                    equals: null,
                  },
                  receivedFrom: {
                    equals: null,
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: b.id,
                  label: b.title,
                  count,
                });
            }
            return NextResponse.json({ data: options });

          case "returned":
            for await (const b of allBooks) {
              const count = await prisma.transaction.count({
                where: {
                  bookId: b.id,
                  returnedAt: {
                    not: null,
                  },
                  receivedFrom: {
                    equals: "SYSTEM",
                  },
                },
              });

              if (count > 0)
                options.push({
                  id: b.id,
                  label: b.title,
                  count,
                });
            }
            return NextResponse.json({ data: options });
        }
    }

    return NextResponse.json({ data: "" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
