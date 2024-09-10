import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { maxUnreturnedTransactions } from "@/configs/transaction.config";
import dayjs from "dayjs";

/*
  Validations:
    + Số lượng đang được mượn của sách này so với tổng số sách
    + Sách có đang được mượn bởi account này
    + Đã chạm đến giới hạn số sách được mượn cùng lúc hay không
*/
export async function POST(request: NextRequest) {
  try {
    const { accountId, bookId, dueDate } = await request.json();

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return NextResponse.json(
        { message: "Could not find book" },
        { status: 404 }
      );
    }

    // Số lượng đang được mượn của sách này
    const borrowingCount = await prisma.transaction.count({
      where: {
        bookId: bookId,
      },
    });

    if (borrowingCount >= book.quantity) {
      return NextResponse.json(
        { message: "This book is not avaliable now" },
        { status: 409 }
      );
    }

    // List sách đang được mượn bởi account này
    const listBorrowing = await prisma.transaction.findMany({
      where: {
        accountId: accountId,
        returnedAt: {
          equals: null,
        },
      },
    });

    if (listBorrowing.findIndex((i) => i.bookId === bookId) !== -1) {
      return NextResponse.json(
        { message: "You are borrowing this book" },
        { status: 409 }
      );
    }

    if (listBorrowing.length >= maxUnreturnedTransactions) {
      return NextResponse.json(
        { message: "You reach max limit of borrowing books" },
        { status: 406 }
      );
    }

    await prisma.transaction.create({
      data: {
        accountId,
        bookId,
        borrowedAt: dayjs(Date.now()).format(),
        dueDate: dueDate,
      },
    });

    return NextResponse.json(
      { message: "Borrow this book successfully" },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
