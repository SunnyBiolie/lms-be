import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
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

      await prisma.book.delete({
        where: {
          id,
        },
      });

      return NextResponse.json(
        { message: "Delete book suscessfully" },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Id is missing" }, { status: 400 });
  } catch (err) {
    throw err;
  }
}
