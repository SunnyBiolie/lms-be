import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { getAccountInfor } from "@/lib/helper";

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
        userName: string;
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
        console.log(verifyResult.data);
        const account = await getAccountInfor(verifyResult.data.userName);

        if (account) {
          return NextResponse.json({
            currentAccount: account,
          });
        } else {
          return NextResponse.json(
            { message: "Could not find an account", redirectToAuth: true },
            {
              status: 500,
              headers: {
                "Set-Cookie": `access-token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
              },
            }
          );
        }
      }
    } else throw new Error(verifyResult.message);
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
