import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { maxUnreturnedTransactions } from "@/configs/transaction.config";
import dayjs from "dayjs";
import {
  bookNumberPriorForMember,
  bookNumberPriorForVip,
} from "@/configs/membership.config";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

/*
  Validations:
    + Số lượng đang được mượn của sách này so với tổng số sách
    + Sách có đang được mượn bởi account này
    + Đã chạm đến giới hạn số sách được mượn cùng lúc hay không
*/
export async function POST(request: NextRequest) {
  try {
    const { isAuth, account } = await jwtCheck(request);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const { accountId, bookId, dueDate } = await request.json();

    if (!account || account.id !== accountId) return failedJWTCheck();

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
        returnedAt: {
          equals: null,
        },
      },
    });

    const available = book.quantity - borrowingCount;
    // Check: Sách còn lại trong kho bằng 0
    if (available <= 0) {
      return NextResponse.json(
        { message: "This book is not avaliable now" },
        { status: 409 }
      );
    }

    let isPrior = true;
    if (available <= bookNumberPriorForVip) {
      switch (account.role) {
        case "USER":
          isPrior = false;
          break;
        case "MEMBER":
          isPrior = false;
          break;
      }
    } else if (available <= bookNumberPriorForMember) {
      switch (account.role) {
        case "USER":
          isPrior = false;
          break;
      }
    }

    // Check: Ưu tiên theo role khi số lượng trong kho còn ít
    if (!isPrior)
      return NextResponse.json(
        { message: "You do not have priority for borrowing this book" },
        { status: 409 }
      );

    // List sách đang được mượn bởi account này
    const listBorrowing = await prisma.transaction.findMany({
      where: {
        accountId: accountId,
        returnedAt: {
          equals: null,
        },
      },
    });

    // Check: Account đang mượn sách này
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
        dueDate: dueDate,
        receivedFrom: "SYSTEM",
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
