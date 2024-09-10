import prisma from "@/lib/prisma";
import { Account } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const data: Account = await request.json();
    const { id, fullName, address, email, phoneNumber, birthDate } = data;

    const edited = await prisma.account.update({
      where: {
        id,
      },
      data: {
        fullName,
        address,
        email,
        phoneNumber,
        birthDate,
      },
      omit: {
        passWord: true,
      },
      include: {
        Transactions: {
          select: {
            bookId: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Change account information successfully",
      data: edited,
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
