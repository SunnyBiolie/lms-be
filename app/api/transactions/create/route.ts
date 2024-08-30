import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { maxUnreturnedTransactions } from "@/configs/transaction.config";

export async function POST(request: NextRequest) {
  try {
    const { accountId, bookId, expectedReturnAt } = await request.json();

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

    if (borrowingCount >= book.allQuantity) {
      return NextResponse.json(
        { message: "This book is not avaliable now" },
        { status: 409 }
      );
    }

    // List sách đang được mượn bởi account này
    const listBorrowing = await prisma.transaction.findMany({
      where: {
        accountId: accountId,
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
        expectedReturnAt: [expectedReturnAt],
      },
    });

    return NextResponse.json(
      { message: "Borrow this book successfully" },
      { status: 201 }
    );
  } catch (error) {
    throw error;
  }
}
