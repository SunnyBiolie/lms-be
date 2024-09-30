import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";

const include = {
  ReportAccounts: {
    include: {
      Account: {
        select: {
          fullName: true,
        },
      },
    },
  },
  ReportBooks: {
    include: {
      Book: {
        select: {
          title: true,
          author: true,
          Categories: true,
        },
      },
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const {
      time,
      value,
    }: {
      time: "year" | "quarter" | "month";
      value: {
        year: number;
        quarter?: number;
        month?: number;
      };
    } = await req.json();

    if (!time || !value) return missingFields();

    let report;

    const { year, quarter, month } = value;

    switch (time) {
      case "year":
        if (!year) return missingFields();
        report = await prisma.report.findMany({
          where: {
            year,
          },
          include: include,
        });
        break;
      case "quarter":
        let months: number[] = [];
        switch (quarter) {
          case 1:
            months = [1, 2, 3];
            break;
          case 2:
            months = [4, 5, 6];
            break;
          case 3:
            months = [7, 8, 9];
            break;
          case 4:
            months = [10, 11, 12];
            break;
          default:
            return NextResponse.json(
              { message: "Invalid Quarter" },
              { status: 400 }
            );
        }

        if (!quarter || !year) return missingFields();
        report = await prisma.report.findMany({
          where: {
            year,
            month: {
              in: months,
            },
          },
          include,
        });
        break;
      case "month":
        if (!month || !year) return missingFields();
        report = await prisma.report.findMany({
          where: {
            month,
            year,
          },
          include: include,
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
