"use server";

import prisma from "@/lib/prisma";
import { randomDate, randomNumber } from "@/lib/utils";
import { History, Transaction } from "@prisma/client";

export const createTransactions = async () => {
  try {
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
      },
    });

    const accountsId = accounts.map((a) => a.id);

    const books = await prisma.book.findMany({
      select: {
        id: true,
      },
    });

    const booksId = books.map((b) => b.id);

    let transactions: Partial<Transaction>[] = [];

    for (let i = 0; i < 20; i++) {
      const accId = accountsId[Math.floor(Math.random() * accountsId.length)];
      const bookId = booksId[Math.floor(Math.random() * booksId.length)];
      const borrowedAt = randomDate(new Date(2024, 0, 1), new Date());

      const returnedAt = new Date(borrowedAt);
      returnedAt.setDate(borrowedAt.getDate() + randomNumber(4, 7));

      transactions.push({
        accountId: accId,
        bookId: bookId,
        borrowedAt: borrowedAt,
        dueDate: returnedAt,
        returnedAt,
      });
    }

    const trans = await prisma.transaction.createManyAndReturn({
      data: transactions as Transaction[],
    });

    const histories: Partial<History>[] = await Promise.all(
      trans.map(async (tr) => {
        const book = await prisma.book.findUnique({
          where: { id: tr.bookId },
          include: {
            Categories: true,
          },
        });
        const categoriesName = book?.Categories.map((c) => c.name);
        const categoriesId = book?.Categories.map((c) => c.id.toString());

        const acc = await prisma.account.findUnique({
          where: { id: tr.accountId },
        });

        return {
          transactionId: tr.id,
          bookId: tr.bookId,
          accountId: tr.accountId,
          renewedAt: [],
          borrowedAt: tr.borrowedAt,
          dueDates: [tr.returnedAt as Date],
          returnedAt: tr.returnedAt as Date,
          bookTitle: book!.title,
          author: book!.author,
          userName: acc!.userName,
          categoriesName: categoriesName!,
          categoriesId: categoriesId!,
        };
      })
    );

    await prisma.history.createMany({
      data: histories as History[],
    });

    return;
  } catch (err) {
    throw err;
  }
};
