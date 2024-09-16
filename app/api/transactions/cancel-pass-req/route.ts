import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { doesNotExist, missingFields } from "@/configs";

//  Kiểm tra được tài khoản khác pass sách hay chưa

export async function DELETE(req: NextRequest) {
  try {
    const { isAuth, account } = await jwtCheck(req);
    if (!isAuth) {
        return failedJWTCheck();
      }
      
      const searchParams = req.nextUrl.searchParams;
      const transactionId = searchParams.get("transactionId");
      console.log(searchParams, transactionId);

    if (!transactionId) return missingFields();

    const tr = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!tr) return doesNotExist("Transactions");
    if (tr.accountId !== account?.id)
      return NextResponse.json(
        { message: "You don't have permission" },
        { status: 405 }
      );

    if (tr.receivedFrom && tr.borrowedAt)
      return NextResponse.json(
        { message: "Someone has passed this book to you" },
        { status: 409 }
      );

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return NextResponse.json({ message: "Cancel request successfully" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
