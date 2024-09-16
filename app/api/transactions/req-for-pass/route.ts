import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { accountId, bookId } = reqData;

    // Chưa kiểm tra số lượng tối đa giao dịch chưa return

    await prisma.transaction.create({
      data: {
        accountId,
        bookId,
      },
    });

    return NextResponse.json({ message: "Create request successfully" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
