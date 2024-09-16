import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import jwt from "jsonwebtoken";

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

export const jwtCheck = async (req: NextRequest) => {
  const cookie = req.cookies.get("access-token");

  if (!cookie) {
    return { isAuth: false };
  }

  const accessToken = cookie.value;

  try {
    // @ts-ignore
    const decoded: {
      [props: string]: string | number;
      userName: string;
    } = jwt.verify(accessToken, process.env.SECRET_KEY!);
    const userName = decoded.userName;
    const check = await prisma.account.findUnique({
      where: {
        userName,
      },
    });
    if (!check) return { isAuth: false };
    return { isAuth: true, account: check };
  } catch (err) {
    return { isAuth: false };
  }
};

export const failedJWTCheck = () => {
  return NextResponse.json(
    {
      redirectToAuth: true,
      message: "Something went wrong, please login again",
    },
    {
      status: 500,
      headers: {
        "Set-Cookie": `access-token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    }
  );
};
