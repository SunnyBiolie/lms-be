import { NextResponse } from "next/server";
import prisma from "./prisma";

export const getAccountInfor = async (userName: string) => {
  try {
    const account = await prisma.account.findUnique({
      where: {
        userName: userName,
      },
      omit: {
        passWord: true,
      },
      include: {
        Transactions: {
          where: {
            returnedAt: {
              equals: null,
            },
          },
          select: {
            bookId: true,
          },
        },
      },
    });

    return account;
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
};
