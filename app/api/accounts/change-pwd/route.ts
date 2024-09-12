import { doesNotExist } from "@/configs";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Validation
//  + Mật khẩu mới !== mật khẩu cũ
//  + Mật khẩu cũ phải chính xác
//  + Tài khoản với id phải tồn tại

export async function POST(request: NextRequest) {
  try {
    const accessToken = cookies().get("access-token")?.value;
    const { isAuth } = await jwtCheck(accessToken);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const { oldPwd, newPwd, accountId } = await request.json();

    if (oldPwd === newPwd) {
      return NextResponse.json(
        { message: "The new password cannot be the same as the old one" },
        { status: 400 }
      );
    }

    const acc = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    if (!acc) return doesNotExist("Account");

    if (acc.passWord !== oldPwd)
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        passWord: newPwd,
      },
    });

    return NextResponse.json({ message: "Change password successfully" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
