import { missingFields } from "@/configs";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { isAuth, account } = await jwtCheck(request);
    if (!isAuth || !account) {
      return failedJWTCheck();
    }

    if (account.role !== "ADMIN")
      return NextResponse.json(
        { message: "You do not have permission to perform this action" },
        { status: 405 }
      );

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
              Transactions: {
                where: {
                  returnedAt: null,
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

      // Xóa Transactions liên quan
      await prisma.transaction.deleteMany({
        where: {
          bookId: id,
        },
      });

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
