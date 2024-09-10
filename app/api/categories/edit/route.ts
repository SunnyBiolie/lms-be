import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { doesNotExist } from "@/configs";

/*
 *  - Validations:
 *    + Kiểm tra tồn tại của Category với id
 *    + Kiểm tra có sách nào đang gắn với Category này không
 */
export async function POST(request: NextRequest) {
  try {
    const data: {
      categoryId: number;
      name: string;
    } = await request.json();

    const name = data.name.toLowerCase();

    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    // Kiểm tra tồn tại của Category với id
    if (!category) {
      return doesNotExist("Category");
    }

    // Kiểm tra có sách nào đang gắn với Category này không
    const books = await prisma.book.findMany({
      where: {
        Categories: {
          some: {
            id: Number(data.categoryId),
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

    await prisma.category.update({
      where: {
        id: data.categoryId,
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json({
      message: `Changed "${category.name}" to "${data.name}"`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
