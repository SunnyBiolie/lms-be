import { NextRequest, NextResponse } from "next/server";
import { Book } from "@prisma/client";
import prisma from "@/lib/prisma";

/*
  Validations:
    + Kiểm tra sách có đang được mượn hay không
*/

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      title,
      author,
      publisher,
      Categories,
      quantity,
      publicationDate,
      pages,
    }: Book & {
      Categories: number[];
    } = await request.json();

    // Kiểm tra sách có đang được mượn hay không
    const c = await prisma.book.findUnique({
      where: {
        id,
      },
      select: {
        _count: {
          select: {
            Transactions: true,
          },
        },
      },
    });

    if (c?._count.Transactions !== 0) {
      return NextResponse.json(
        { message: "This book is being borrowed" },
        { status: 409 }
      );
    }

    const connectCats = Categories.map((cat) => {
      return {
        id: cat,
      };
    });

    await prisma.book.update({
      where: {
        id,
      },
      data: {
        title,
        author,
        publisher,
        Categories: {
          set: [],
          connect: connectCats,
        },
        quantity,
        publicationDate,
        pages,
      },
    });

    return NextResponse.json({ message: "Edit book successfully" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
