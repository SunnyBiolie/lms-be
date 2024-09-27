import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { doesNotExist, missingFields } from "@/configs";

export async function GET(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const searchParams = req.nextUrl.searchParams;
    const reportId = searchParams.get("reportId");

    if (!reportId) return missingFields();

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    // Check: tồn tại report với id được truyền lên
    if (!report) return doesNotExist("Report");

    const rpAccounts = await prisma.rp_Account.findMany({
      where: {
        reportId,
      },
      include: {
        Account: {
          select: {
            fullName: true,
            userName: true,
          },
        },
      },
    });

    const rpBooks = await prisma.rp_Book.findMany({
      where: {
        reportId,
      },
      include: {
        Book: {
          select: {
            title: true,
          },
        },
      },
    });

    const membership = await prisma.membershipLog.findMany({
      where: {
        reportId,
      },
      include: {
        Account: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        report: report,
        ReportAccounts: rpAccounts,
        ReportBooks: rpBooks,
        MembershipLogs: membership,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
