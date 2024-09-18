import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { doesNotExist, missingFields } from "@/configs";

export async function GET(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) return missingFields();

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        Account: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!transaction) return doesNotExist("Transaction");

    return NextResponse.json({ data: transaction });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
