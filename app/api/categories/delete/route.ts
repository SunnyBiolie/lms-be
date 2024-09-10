import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

/*
 *  - Validations:
 *    + Kiểm tra có sách nào đang gắn với Category này không
 */

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return missingFields();
    }

    // Kiểm tra có sách nào đang gắn với Category này không
    const books = await prisma.book.findMany({
      where: {
        Categories: {
          some: {
            id: Number(categoryId),
          },
        },
      },
    });

    if (books.length !== 0) {
      return NextResponse.json(
        {
          message: "This category belongs to some books",
        },
        { status: 409 }
      );
    }

    const c = await prisma.category.delete({
      where: {
        id: Number(categoryId),
      },
    });

    return NextResponse.json({
      message: `Delete "${c.name}" successfully`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
