import { doesNotExist } from "@/configs";
import prisma from "@/lib/prisma";
import { Transaction } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const data: Transaction & {
      title: string;
      author: string;
      userName: string;
    } = await request.json();

    const transaction = await prisma.transaction.update({
      where: {
        id: data.id,
      },
      data: {
        returnedAt: dayjs(Date.now()).format(),
      },
      include: {
        Renewals: true,
      },
    });

    const re = transaction.Renewals.map((tr) => tr.renewedAt);
    const dds = [
      transaction.dueDate,
      ...transaction.Renewals.map((tr) => tr.dueDate),
    ];

    const book = await prisma.book.findUnique({
      where: {
        id: data.bookId,
      },
      include: {
        Categories: true,
      },
    });

    const catesName = book?.Categories.map((c) => c.name);
    const catesId = book?.Categories.map((c) => c.id.toString());

    const history = await prisma.history.create({
      data: {
        transactionId: transaction.id,
        bookId: transaction.bookId,
        accountId: transaction.accountId,
        renewedAt: re,
        borrowedAt: transaction.borrowedAt,
        dueDates: dds,
        returnedAt: transaction.returnedAt as Date,
        bookTitle: data.title,
        author: data.author,
        userName: data.userName,
        categoriesName: catesName,
        categoriesId: catesId,
      },
    });

    return NextResponse.json({
      message: `Return "${data.title}" successfully`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
