import { doesNotExist } from "@/configs";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { Transaction } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(request);
    if (!isAuth) {
      return failedJWTCheck();
    }

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

    if (transaction.receivedFrom === null)
      return NextResponse.json(
        { message: "Transaction with null 'receivedFrom' is returning book?" },
        { status: 400 }
      );

    if (transaction.receivedFrom !== "SYSTEM") {
      const passTransaction = await prisma.transaction.update({
        where: {
          id: transaction.receivedFrom,
        },
        data: {
          returnedAt: transaction.returnedAt,
        },
        include: {
          Renewals: true,
        },
      });

      const re = passTransaction.Renewals.map((tr) => tr.renewedAt);
      const dds = [
        passTransaction.dueDate,
        ...passTransaction.Renewals.map((tr) => tr.dueDate),
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

      await prisma.history.create({
        data: {
          transactionId: passTransaction.id,
          bookId: passTransaction.bookId,
          accountId: passTransaction.accountId,
          renewedAt: re,
          borrowedAt: passTransaction.borrowedAt,
          dueDates: dds as Date[] | string[],
          returnedAt: passTransaction.returnedAt as Date,
          bookTitle: data.title,
          author: data.author,
          userName: data.userName,
          categoriesName: catesName,
          categoriesId: catesId,
          receivedFrom: passTransaction.receivedFrom!,
          passedFor: passTransaction.passedFor,
        },
      });
    }

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
        dueDates: dds as Date[] | string[],
        returnedAt: transaction.returnedAt as Date,
        bookTitle: data.title,
        author: data.author,
        userName: data.userName,
        categoriesName: catesName,
        categoriesId: catesId,
        receivedFrom: transaction.receivedFrom!,
        passedFor: transaction.passedFor,
      },
    });

    return NextResponse.json({
      message: `Return "${data.title}" successfully`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
