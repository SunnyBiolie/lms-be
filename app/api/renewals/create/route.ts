import { doesNotExist } from "@/configs";
import { maxRenewalTime } from "@/configs/transaction.config";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

// Kiểm tra sách đã quá hạn trả hay chưa
// Kiểm tra số lần gia hạn

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { transactionId, dueDate } = data;

    const renewals = await prisma.renewal.findMany({
      where: {
        transactionId,
      },
    });

    if (renewals.length === 0) {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

      if (!transaction) return doesNotExist("Transaction");

      // Sách đã quá hạn
      if (transaction.dueDate.getTime() < Date.now())
        return NextResponse.json(
          {
            message: "The book is past the return date",
          },
          {
            status: 400,
          }
        );
    }

    if (renewals.length >= maxRenewalTime)
      return NextResponse.json(
        {
          message: "You reached the maximum number of renewals for this book",
        },
        { status: 409 }
      );

    await prisma.renewal.create({
      data: {
        transactionId,
        renewedAt: dayjs(Date.now()).format(),
        dueDate,
      },
    });

    return NextResponse.json({ message: "Book renewed successfully" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
