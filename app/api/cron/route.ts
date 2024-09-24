import { NextResponse } from "next/server";
import "../../../lib/cron"; // Import cron để chạy ngay khi server khởi động

export async function GET() {
  return NextResponse.json({
    message: "API route is working, and cron is running",
  });
}
