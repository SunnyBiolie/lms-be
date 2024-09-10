import { missingFields } from "@/configs";
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

    return missingFields();
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
