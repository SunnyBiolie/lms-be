import { NextRequest, NextResponse } from "next/server";
import { Book } from "@prisma/client";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function POST(request: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(request);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const newData: Book & {
      Categories: number[];
    } = await request.json();

    const isExists = await prisma.book.findFirst({
      where: {
        title: newData.title,
        author: newData.author,
      },
    });

    if (isExists) {
      return NextResponse.json(
        { message: "This book already exists" },
        { status: 409 }
      );
    }

    const connectCats = newData.Categories.map((cat) => {
      return {
        id: cat,
      };
    });

    await prisma.book.create({
      data: {
        ...newData,
        Categories: {
          connect: connectCats,
        },
      },
    });

    return NextResponse.json(
      { message: "Add new book suscessfully" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: (err as Error).name, err },
      { status: 500 }
    );
  }
}
