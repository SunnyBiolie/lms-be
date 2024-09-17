import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    return NextResponse.json("");
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
