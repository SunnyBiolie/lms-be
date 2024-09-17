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
            const result = await prisma.transaction.findMany({
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
            return NextResponse.json({ data: result });
          case "requesting":
            return;
        }
        break;
    }

    return NextResponse.json("");
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
