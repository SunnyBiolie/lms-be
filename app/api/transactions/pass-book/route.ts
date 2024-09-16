import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { doesNotExist, missingFields } from "@/configs";
import dayjs from "dayjs";

export async function PATCH(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { tranPassId, tranReceiveId, dueDate } = reqData;

    if (!tranPassId || !tranReceiveId || !dueDate) return missingFields();

    // tranReceiveId có tồn tại, tranReceiveId đã được ai khác pass chưa, tranPassId đã pass cho ai khác chưa, tranPassId phải mượn từ SYSTEM?

    const receiverTran = await prisma.transaction.findUnique({
      where: {
        id: tranReceiveId,
      },
      include: {
        Account: true,
        Book: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!receiverTran) return doesNotExist("Request");

    if (receiverTran.receivedFrom !== null)
      return NextResponse.json(
        {
          message: `Another user passed this book to ${receiverTran.Account.fullName}`,
        },
        { status: 409 }
      );

    const passTran = await prisma.transaction.findUnique({
      where: {
        id: tranPassId,
      },
    });

    if (!passTran) return doesNotExist("Transaction pass");

    if (passTran.passedFor !== null) {
      return NextResponse.json(
        {
          message: "You passed this book for someone else",
        },
        {
          status: 409,
        }
      );
    }

    if (passTran.receivedFrom !== "SYSTEM") {
      return NextResponse.json(
        { message: "You are not allowed to pass this book" },
        { status: 405 }
      );
    }

    await prisma.transaction.update({
      where: {
        id: tranPassId,
      },
      data: {
        passedFor: tranReceiveId,
      },
    });

    await prisma.transaction.update({
      where: {
        id: tranReceiveId,
      },
      data: {
        receivedFrom: tranPassId,
        borrowedAt: dayjs(Date.now()).format(),
        dueDate,
      },
    });

    return NextResponse.json({
      message: `Pass ${receiverTran.Book.title} to ${receiverTran.Account.fullName} successfully`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
