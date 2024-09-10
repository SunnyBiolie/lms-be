import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const type = data.type;

    const title = data.searchValues.title || "";
    const author = data.searchValues.author || "";
    const categories: number[] = data.searchValues.categories || [];
    const publisher = data.searchValues.publisher || "";
    const publicationDate = data.searchValues.publicationDate || [
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
        Categories: {
          some: {
            id: catId,
          },
        },
      };

      return condition;
    });

    const count = await prisma.book.count({
      where: {
        title: {
          contains: title || "",
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
        publicationDate: {
          lte: publicationDate[1],
        },
        // Transactions: {
        //   some: {
        //     returnedAt: {
        //       equals: null,
        //     },
        //   },
        // },
      },
    });

    const results = await prisma.book.findMany({
      skip: pageSize * (current - 1),
      take: pageSize,
      where: {
        title: {
          contains: title || "",
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
        publicationDate: {
          lte: publicationDate[1],
        },
      },
      include: {
        Categories: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { total: count, listBooks: results },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
