import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const start = data.range ? data.range[0] : 0;
    const end = data.range ? data.range[1] : Date.now();

    console.log(dayjs(0).format());

    const histories = await prisma.history.findMany({
      where: {
        borrowedAt: {
          gte: dayjs(start).format(),
          lte: dayjs(end).format(),
        },
      },
    });

    return NextResponse.json({ data: histories });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
