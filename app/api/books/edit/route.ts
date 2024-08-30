import { NextRequest, NextResponse } from "next/server";
import { Book } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      name,
      author,
      publisher,
      categories,
      allQuantity,
      yearOfPublication,
    }: Book & {
      categories: number[];
    } = await request.json();

    // Kiểm tra sách có đang được mượn hay không
    const c = await prisma.book.findUnique({
      where: {
        id,
      },
      select: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (c?._count.transactions !== 0) {
      return NextResponse.json(
        { message: "This book is being borrowed" },
        { status: 409 }
      );
    }

    const connectCats = categories.map((cat) => {
      return {
        id: cat,
      };
    });

    await prisma.book.update({
      where: {
        id,
      },
      data: {
        name,
        author,
        publisher,
        categories: {
          set: [],
          connect: connectCats,
        },
        allQuantity,
        yearOfPublication,
      },
    });

    return NextResponse.json("Edit book successfully");
  } catch (err) {
    throw err;
  }
}
