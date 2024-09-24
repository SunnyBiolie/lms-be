import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function POST(request: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(request);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const { bookIds } = await request.json();

    if (!bookIds) {
      return NextResponse.json(
        { message: "Missing required field(s) to fetch data" },
        { status: 400 }
      );
    }

    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (!books) {
      return NextResponse.json(
        { message: "Could not find book" },
        { status: 404 }
      );
    } else {
      return NextResponse.json({ books }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
