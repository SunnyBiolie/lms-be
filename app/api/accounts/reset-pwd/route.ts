import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

export async function PATCH(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) return missingFields();

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        passWord: process.env.DEFAULT_ACCOUNT_PWD,
      },
    });

    return NextResponse.json({
      message: "Reset to default password successfully",
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
