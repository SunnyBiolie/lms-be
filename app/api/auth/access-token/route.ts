import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const accessToken = cookies().get("access-token")?.value;

    if (!accessToken) {
      // return NextResponse.redirect("http://localhost:5173/auth/login", {status: 307});
      return NextResponse.json({
        redirectToAuth: true,
      });
    }

    const verifyResult: {
      type: "success" | "error";
      message?: string;
      data?: {
        [props: string]: string;
        username: string;
      };
    } = await new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.SECRET_KEY!, (err, decoded) => {
        return err
          ? reject({
              type: "error",
              error: "Something went wrong",
            })
          : // @ts-ignore
            resolve({ type: "success", data: decoded });
      });
    });

    if (verifyResult.type === "success") {
      if (verifyResult.data) {
        const account = await prisma.account.findFirst({
          where: {
            userName: verifyResult.data.userName,
          },
          select: {
            id: true,
            userName: true,
            role: true,
            transactions: {
              select: {
                bookId: true,
              },
            },
          },
        });

        if (account) {
          return NextResponse.json({
            currentAccount: account,
          });
        } else {
          throw new Error("Please clear your cookies");
        }
      }
    } else throw new Error(verifyResult.message);
  } catch (error) {
    throw error;
  }
}
