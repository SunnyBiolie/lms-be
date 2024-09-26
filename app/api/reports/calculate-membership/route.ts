import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateMembership, failedJWTCheck, jwtCheck } from "@/lib/helper";
import { dayInMiliseconds, missingFields } from "@/configs";
import { Report } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    // const reqData = await req.json();

    // const { report }: { report: Report } = reqData;

    // if (!report) return missingFields();

    // const lastTwelveMonthReport = await prisma.report.findMany({
    //   orderBy: [
    //     {
    //       year: "desc",
    //     },
    //     {
    //       month: "desc",
    //     },
    //   ],
    //   take: 12,
    //   include: {
    //     ReportAccounts: true,
    //   },
    // });

    // // Lấy danh sách Account có role "USER" và tài khoản được tạo > 3 tháng
    // const listUsers = await prisma.account.findMany({
    //   where: {
    //     role: "USER",
    //     createdAt: {
    //       lte: new Date(Date.now() - 90 * dayInMiliseconds),
    //     },
    //   },
    // });
    // // Lấy danh sách report 3 tháng gần nhất
    // const lastThreeMonthReport = lastTwelveMonthReport.slice(0, 3);
    // // Kiểm tra trong danh sách Account trên,tài khoản nào đáp ứng điều kiện nâng cấp
    // const upgradeToMemberResult = listUsers.map((account) => {
    //   return calculateMembership("MEMBER", account, lastThreeMonthReport);
    // });

    // // Lấy danh sách Account có role "MEMBER" và tài khoản được tạo > 1 năm
    // const listMembers = await prisma.account.findMany({
    //   where: {
    //     role: "MEMBER",
    //     createdAt: {
    //       lte: new Date(Date.now() - 365 * dayInMiliseconds),
    //     },
    //   },
    // });
    // // Kiểm tra trong danh sách Account trên,tài khoản nào đáp ứng điều kiện nâng cấp
    // const upgradeToVIPResult = listMembers.map((account) => {
    //   return calculateMembership("VIP", account, lastTwelveMonthReport);
    // });

    // // Lọc ra những tà khoản sẽ được nâng lên MEMBER
    // const willMembers = upgradeToMemberResult.filter(
    //   (item) => item.upgrade === true
    // );
    // // Lọc ra những tà khoản sẽ được nâng lên VIP
    // const willVips = upgradeToVIPResult.filter((item) => item.upgrade === true);

    // let newMembers;
    // let newVips;

    // // Thực hiện nâng cấp MEMBER: thêm record cho bảng MembershipLog và update bảng Account
    // if (willMembers.length > 0) {
    //   newMembers = await Promise.all(
    //     willMembers.map(async (item) => {
    //       await prisma.membershipLog.create({
    //         data: {
    //           accountId: item.accountId,
    //           reportId: report.id,
    //           from: "USER",
    //           to: "MEMBER",
    //           createdAt: report.createdAt,
    //         },
    //       });

    //       return await prisma.account.update({
    //         where: {
    //           id: item.accountId,
    //         },
    //         data: {
    //           role: "MEMBER",
    //         },
    //       });
    //     })
    //   );
    // }
    // // Thực hiện nâng cấp VIP: thêm record cho bảng MembershipLog và update bảng Account
    // if (willVips.length > 0) {
    //   newVips = await Promise.all(
    //     willVips.map(async (item) => {
    //       await prisma.membershipLog.create({
    //         data: {
    //           reportId: report.id,
    //           accountId: item.accountId,
    //           from: "MEMBER",
    //           to: "VIP",
    //           createdAt: report.createdAt,
    //         },
    //       });

    //       return await prisma.account.update({
    //         where: {
    //           id: item.accountId,
    //         },
    //         data: {
    //           role: "VIP",
    //         },
    //       });
    //     })
    //   );
    // }

    // return NextResponse.json({
    //   data: {
    //     members: newMembers.lenght,
    // vips: newVips.lenght,
    //   },
    // });
    return NextResponse.json({
      data: {
        members: 2,
        vips: 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
