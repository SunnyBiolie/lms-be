import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { accountId, bookId, action } = reqData;

    if (!accountId || !bookId || !action) return missingFields();

    let message;

    switch (action) {
      case "like":
        await prisma.account.update({
          where: {
            id: accountId,
          },
          data: {
            LikedBooks: {
              connect: {
                id: bookId,
              },
            },
          },
        });
        message = "Like this book successfully";
        break;
      case "unlike":
        await prisma.account.update({
          where: {
            id: accountId,
          },
          data: {
            LikedBooks: {
              disconnect: {
                id: bookId,
              },
            },
          },
        });
        message = "Unlike this book successfully";
        break;
      default:
        throw new Error("Action not supported");
    }

    return NextResponse.json({ message });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
