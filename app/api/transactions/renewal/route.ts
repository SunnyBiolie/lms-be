import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const { id, newExpectedReturnAt } = await request.json();

    await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        expectedReturnAt: {
          push: newExpectedReturnAt,
        },
      },
    });

    return NextResponse.json(
      { message: "Renewal return date successfully" },
      { status: 200 }
    );
  } catch (error) {
    throw error;
  }
}
