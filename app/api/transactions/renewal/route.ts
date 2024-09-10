import { doesNotExist } from "@/configs";
import { maxRenewalTime } from "@/configs/transaction.config";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

/**
 *  Validations:
 *    + Kiểm tra tồn tại của Transaction với id
 *    + Kiểm tra đã đạt giới hạn số lần gia hạn hay chưa
 */

export async function PATCH(request: NextRequest) {
  try {
    const { id, newDueDate } = await request.json();

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    // Kiểm tra tồn tại của Transaction với id
    if (!transaction) {
      return doesNotExist("Transaction");
    }

    // Kiểm tra đã đạt giới hạn số lần gia hạn hay chưa
    if (transaction.dueDates.length - 1 >= maxRenewalTime) {
      return NextResponse.json(
        {
          message: "You reached the maximum number of renewals for this book",
        },
        { status: 409 }
      );
    }

    await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        borrowedAt: {
          push: dayjs(Date.now()).format(),
        },
        dueDates: {
          push: newDueDate,
        },
      },
    });

    return NextResponse.json(
      { message: "Renewal return date successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
