import { NextRequest, NextResponse } from "next/server";
import { Book } from "@prisma/client";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

/*
  Validations:
    + Kiểm tra sách có đang được mượn hay không
*/

export async function POST(request: NextRequest) {
  try {
    const { isAuth, account } = await jwtCheck(request);
    if (!isAuth || !account) {
      return failedJWTCheck();
    }

    if (account.role !== "ADMIN")
      return NextResponse.json(
        { message: "You have no right to do this action" },
        { status: 409 }
      );

    const {
      id,
      title,
      author,
      publisher,
      Categories,
      quantity,
      publicationDate,
      pages,
      isSpecial,
      price,
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
            Transactions: {
              where: {
                returnedAt: {
                  equals: null,
                },
              },
            },
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

    console.log(Categories);

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
        price,
        isSpecial: !!isSpecial,
      },
    });

    return NextResponse.json({ message: "Edit book successfully" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
