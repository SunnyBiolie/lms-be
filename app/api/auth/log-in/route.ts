import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { accessTokenMaxAge } from "@/configs/cookie.config";

export async function POST(request: NextRequest) {
  try {
    const { userName, passWord } = await request.json();

    const account = await prisma.account.findUnique({
      where: {
        userName,
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

    if (!account) {
      return NextResponse.json(
        { message: "Username or password is incorrect" },
        {
          status: 401,
        }
      );
    }

    if (passWord !== account.passWord) {
      return NextResponse.json(
        { message: "Username or password is incorrect" },
        {
          status: 401,
        }
      );
    }

    const accessToken = jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + accessTokenMaxAge, userName },
      process.env.SECRET_KEY!
    );

    return NextResponse.json(
      {
        currentAccount: {
          ...account,
          passWord: null,
        },
        message: "Authentication successful",
      },
      {
        status: 200,
        headers: {
          // "set-cookie": `token=${token}; Path=/; HttpOnly; SameSite=None; Secure`,
          "set-cookie": `access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessTokenMaxAge}`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).name },
      { status: 500 }
    );
  }
}
