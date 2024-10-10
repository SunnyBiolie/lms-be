import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";
import { Category } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { categories } = reqData;

    if (!categories) return missingFields();

    const cateIds = categories.map((c: Category) => c.id);

    const listBooks = await prisma.book.findMany({
      where: {
        Categories: {
          some: {
            id: {
              in: cateIds,
            },
          },
        },
      },
      include: {
        Categories: true,
      },
    });

    return NextResponse.json({ data: listBooks });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
