import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data: {
      name: string;
    } = await request.json();

    const name = data.name.toLowerCase();

    const category = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (category) {
      return NextResponse.json(
        { message: `"${data.name}" already exists` },
        { status: 409 }
      );
    }

    await prisma.category.create({
      data: {
        name: name,
      },
    });

    return NextResponse.json({
      message: `Create "${data.name}" the category successfully`,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
