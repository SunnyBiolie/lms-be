import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import jwt from "jsonwebtoken";
import { Account, Report, Rp_Account } from "@prisma/client";
import {
  maxOverdueCountPerPeriodForMember,
  maxOverdueCountPerPeriodForVIP,
  minBorrowCountPerMonthForMember,
  minBorrowCountPerMonthForVIP,
} from "@/configs/membership.config";

export const getAccountInfor = async (userName: string) => {
  try {
    const account = await prisma.account.findUnique({
      where: {
        userName: userName,
      },
      omit: {
        passWord: true,
      },
      include: {
        Transactions: {
          where: {
            returnedAt: {
              equals: null,
            },
          },
          select: {
            bookId: true,
          },
        },
      },
    });

    return account;
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
};

export const jwtCheck = async (req: NextRequest) => {
  const cookie = req.cookies.get("access-token");

  if (!cookie) {
    return { isAuth: false };
  }

  const accessToken = cookie.value;

  try {
    // @ts-ignore
    const decoded: {
      [props: string]: string | number;
      userName: string;
    } = jwt.verify(accessToken, process.env.SECRET_KEY!);
    const userName = decoded.userName;
    const check = await prisma.account.findUnique({
      where: {
        userName,
      },
    });
    if (!check) return { isAuth: false };
    return { isAuth: true, account: check };
  } catch (err) {
    return { isAuth: false };
  }
};

export const failedJWTCheck = () => {
  return NextResponse.json(
    {
      redirectToAuth: true,
      // redirectFrom: req.nextUrl,
      message: "Something went wrong, please login again",
    },
    {
      status: 500,
      headers: {
        "Set-Cookie": `access-token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    }
  );
};

export const calculateMembership = (
  upTo: "MEMBER" | "VIP",
  account: Account,
  listReports: (Report & { ReportAccounts: Rp_Account[] })[]
) => {
  const minBorrowCount =
    upTo === "MEMBER"
      ? minBorrowCountPerMonthForMember
      : upTo === "VIP"
      ? minBorrowCountPerMonthForVIP
      : 0;
  const maxOverduteCount =
    upTo === "MEMBER"
      ? maxOverdueCountPerPeriodForMember
      : upTo === "VIP"
      ? maxOverdueCountPerPeriodForVIP
      : 0;
  let matchCondition = true;
  const montlyRpAcc = [];

  for (const report of listReports) {
    const rpAcc = report.ReportAccounts.find(
      (rp) => rp.accountId === account.id
    );
    // Nếu một tháng không có report account (tức không có giao dịch mượn/trả --> ko đáp ứng)
    if (!rpAcc) {
      matchCondition = false;
      break;
    }
    montlyRpAcc.push(rpAcc);
  }

  // Nếu matchCondition vẫn là true sau vòng lặp trên, tức đủ 12 tháng có report account
  if (matchCondition) {
    let overdueCount = 0;
    for (const rpAcc of montlyRpAcc) {
      // Nếu có một tháng mượn ít hơn 3 quyển (3 giao dịch mượn) --> ko đáp ứng
      if (rpAcc.borrowCount < minBorrowCount) {
        matchCondition = false;
        break;
      }
      overdueCount += rpAcc.overdueCount;
    }
    // Nếu matchCondition vẫn là true sau vòng lặp trên, tức cả 3 tháng đều mượn từ 3 quyển trở lên --> xét tới tổng số giao dịch đã trả bị quá hạn trong 3 tháng trên, lớn hơn 3 --> ko đáp ứng
    if (matchCondition && overdueCount > maxOverduteCount) {
      matchCondition = false;
    }
  }

  return {
    accountId: account.id,
    upgrade: matchCondition,
  };
};
