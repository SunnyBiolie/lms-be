import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const {
      type,
      value,
    }: {
      type: "year" | "quarter" | "month";
      value: {
        year: number;
        quarter?: number;
        month?: number;
      };
    } = await req.json();

    if (!type || !value) return missingFields();

    let report;

    switch (type) {
      case "year":
        break;
      case "quarter":
        break;
      case "month":
        const { month, year } = value;
        if (!month || !year) return missingFields();
        report = await prisma.report.findFirst({
          where: {
            month,
            year,
          },
          include: {
            ReportAccounts: true,
            ReportBooks: true,
          },
        });
        break;
      default:
        throw new Error("Type of this case is not defined");
    }

    return NextResponse.json({ data: report });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
