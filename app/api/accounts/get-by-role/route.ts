import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { missingFields } from "@/configs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");

    if (!role) return missingFields();

    const accounts = await prisma.account.findMany({
      where: {
        role,
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
        },
      },
    });

    return NextResponse.json({ data: accounts });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
