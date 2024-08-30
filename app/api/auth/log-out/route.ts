import dayjs from "dayjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        message: "Log out successful",
      },
      {
        status: 200,
        headers: {
          // "set-cookie": `token=${token}; Path=/; HttpOnly; SameSite=None; Secure`,
          "Set-Cookie": `access-token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
}
