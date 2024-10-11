import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import dayjs from "dayjs";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const title = reqData.searchValues.title || "";
    const author = reqData.searchValues.author || "";
    const categories: number[] = reqData.searchValues.categories || [];
    const publisher = reqData.searchValues.publisher || "";
    const publicationDate = (
      reqData.searchValues.publicationDate
        ? {
            gte: dayjs(reqData.searchValues.publicationDate[0]).format(),
            lte: dayjs(reqData.searchValues.publicationDate[1]).format(),
          }
        : {
            lte: dayjs(Date.now()),
          }
    ) as Prisma.DateTimeFilter<"Book">;

    // const { current, pageSize } = reqData.paginationParams;

    const action = reqData.action;

    const current =
      action === "search"
        ? 1
        : action === "paginate" && reqData.paginationParams.current;

    const pageSize = reqData.paginationParams.pageSize;

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
        publicationDate,
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
        publicationDate,
      },
      include: {
        Categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: {
        results,
        total: count,
        pagination: {
          current,
          pageSize,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
