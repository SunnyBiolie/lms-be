import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { doesNotExist, missingFields } from "@/configs";
import { History } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const { accountId, reportId } = await req.json();

    if (!accountId || !reportId) return missingFields();

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        year: true,
        month: true,
      },
    });

    if (!report) return doesNotExist("Report");

    const { year, month } = report;

    // Lấy những giao dịch được return trong tháng (return tạo History nên lấy History)
    const returned = await prisma.history.findMany({
      where: {
        accountId,
        returnedAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    const overdue: History[] = [];
    // Kiểm tra xem giao dịch nào quá hạn
    returned.forEach((his) => {
      if (
        his.returnedAt > his.dueDates[his.dueDates.length - 1] &&
        his.passedFor === null
      ) {
        overdue.push(his);
      }
    });

    return NextResponse.json({ data: overdue });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
