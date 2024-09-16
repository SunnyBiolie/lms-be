import { doesNotExist, missingFields } from "@/configs";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(request);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) return missingFields();

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      include: {
        _count: {
          select: {
            Transactions: {
              where: {
                returnedAt: {
                  equals: null,
                },
              },
            },
          },
        },
      },
    });

    if (!account) return doesNotExist("Account");

    if (account._count.Transactions > 0)
      return NextResponse.json(
        {
          message: "Failed to delete, you have pending transaction(s)",
        },
        { status: 409 }
      );

    await prisma.transaction.deleteMany({
      where: {
        accountId: account.id,
      },
    });
    await prisma.account.delete({
      where: {
        id: account.id,
      },
    });

    return NextResponse.json({
      message: `Delete ${account.fullName}'s account successfully`,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
