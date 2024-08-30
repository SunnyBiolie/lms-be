import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      id,
      accountId,
      bookId,
      bookName,
      author,
      userName,
      borrowedAt,
      expectedReturnAt,
    } = data;

    await prisma.log.create({
      data: {
        id,
        accountId,
        bookId,
        bookName,
        author,
        userName,
        borrowedAt,
        expectedReturnAt,
      },
    });

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Return book successful" },
      { status: 200 }
    );
  } catch (error) {
    throw error;
  }
}
