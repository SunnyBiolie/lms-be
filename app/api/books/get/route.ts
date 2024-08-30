import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    throw error;
  }
}
