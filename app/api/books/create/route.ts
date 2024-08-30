import { NextRequest, NextResponse } from "next/server";
import { Book } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const newData: Book & {
      categories: number[];
    } = await request.json();

    const isExists = await prisma.book.findFirst({
      where: {
        name: newData.name,
        author: newData.author,
      },
    });

    if (isExists) {
      return NextResponse.json(
        { message: "This book already exists" },
        { status: 409 }
      );
    }

    const connectCats = newData.categories.map((cat) => {
      return {
        id: cat,
      };
    });

    await prisma.book.create({
      data: {
        ...newData,
        categories: {
          connect: connectCats,
        },
      },
    });

    return NextResponse.json(
      { message: "Add new book suscessfully" },
      { status: 201 }
    );
  } catch (err) {
    throw err;
  }
}
