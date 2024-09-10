import { doesNotExist, missingFields } from "@/configs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
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

    return NextResponse.json(
      { message: "Delete successfully" },
      {
        headers: {
          // "set-cookie": `token=${token}; Path=/; HttpOnly; SameSite=None; Secure`,
          "Set-Cookie": `access-token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
