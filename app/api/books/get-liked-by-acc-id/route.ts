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

    const type = searchParams.get("type");
    const accountId = searchParams.get("accountId");

    if (!type || !accountId) return missingFields();

    if (type === "owner" && account.id !== accountId) {
      return NextResponse.json(
        { message: "This collection is not yours" },
        { status: 409 }
      );
    }

    const listBooks = await prisma.book.findMany({
      where: {
        LikedBy: {
          some: {
            id: {
              equals: accountId,
            },
          },
        },
      },
    });

    return NextResponse.json({ data: listBooks });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
