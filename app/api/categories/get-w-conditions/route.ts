import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data: {
      name: string;
    } = await request.json();

    const name = data.name.toLowerCase();

    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: name || "",
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            Books: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      data: categories,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
