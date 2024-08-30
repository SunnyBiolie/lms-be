import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userInfor, accountValues } = await request.json();

    const { userName } = accountValues;

    const account = await prisma.account.findUnique({
      where: {
        userName,
      },
    });

    // Existing account in the database
    if (account) {
      return NextResponse.json("Username already exists", { status: 409 });
    }

    await prisma.account.create({
      data: {
        ...userInfor,
        ...accountValues,
        role: "USER",
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully. Please log in",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    throw error;
  }
}
