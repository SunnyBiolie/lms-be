import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const type = data.type;

    const name = data.searchValues.name || "";
    const author = data.searchValues.author || "";
    const categories: number[] = data.searchValues.categories || [];
    const publisher = data.searchValues.publisher || "";
    const yearOfPublication = data.searchValues.yearOfPublication || [
      dayjs(0),
      dayjs(Date.now()),
    ];

    const current =
      type === "paginate"
        ? data.paginationParams.current
        : (type === "goToFirst"
            ? 1
            : type === "deleteLastItem" && data.paginationParams.current - 1) ||
          1;
    const pageSize = data.paginationParams.pageSize || 5;

    const categoriesFilter = categories.map((catId) => {
      const condition = {
        categories: {
          some: {
            id: catId,
          },
        },
      };

      return condition;
    });

    const count = await prisma.book.count({
      where: {
        name: {
          contains: name || "",
          mode: "insensitive",
        },
        author: {
          contains: author || "",
          mode: "insensitive",
        },
        AND: categoriesFilter,
        publisher: {
          contains: publisher || "",
          mode: "insensitive",
        },
        yearOfPublication: {
          lte: yearOfPublication[1],
        },
      },
    });

    const results = await prisma.book.findMany({
      skip: pageSize * (current - 1),
      take: pageSize,
      where: {
        name: {
          contains: name || "",
          mode: "insensitive",
        },
        author: {
          contains: author || "",
          mode: "insensitive",
        },
        AND: categoriesFilter,
        publisher: {
          contains: publisher || "",
          mode: "insensitive",
        },
        yearOfPublication: {
          lte: yearOfPublication[1],
        },
      },
      include: {
        categories: true,
        // transactions: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { total: count, listBooks: results },
      { status: 200 }
    );
  } catch (err) {
    throw err;
  }
}
