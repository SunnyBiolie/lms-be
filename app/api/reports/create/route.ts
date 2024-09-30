import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";
import { missingFields } from "@/configs";
import { History, Rp_Account, Rp_Book, Transaction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    const reqData = await req.json();

    const { month, year } = reqData;

    if (!month || !year) return missingFields();

    const listRps = await prisma.report.findMany({
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });

    // Kiểm tra hành động có hợp lệ
    const m = listRps[0].month;
    const y = listRps[0].year;
    // const invalid = new Date() < new Date(y, m + 1);
    const invalid = new Date() < new Date(2024, 8, 25);
    if (invalid)
      return NextResponse.json(
        {
          message: `The time to report for ${Intl.DateTimeFormat("en", {
            month: "long",
          }).format(new Date(year, month - 1))} has not arrived yet`,
        },
        { status: 400 }
      );

    // Lấy những giao dịch được tạo ra trong tháng
    const borrowed = await prisma.transaction.findMany({
      where: {
        borrowedAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
        receivedFrom: {
          not: null,
        },
      },
      select: {
        accountId: true,
      },
    });

    const uniqueBorrowedAccountIds = [
      ...new Set(borrowed.map((b) => b.accountId)),
    ];

    const listBorrowedCount = uniqueBorrowedAccountIds.map((id) => {
      const arr = borrowed.filter((item) => item.accountId === id);
      return {
        accountId: id,
        borrowCount: arr.length,
      };
    });

    // Lấy những giao dịch được return trong tháng (return tạo History nên lấy History)
    const returned = await prisma.history.findMany({
      where: {
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

    // Lấy danh sách các accountId duy nhất
    const uniqueOverdueAccountIds = [
      ...new Set(overdue.map((his) => his.accountId)),
    ];

    const listOverdueCount = uniqueOverdueAccountIds.map((accId) => {
      const arr = overdue.filter((item) => item.accountId === accId);
      return {
        accountId: accId,
        overdueCount: arr.length,
      };
    });

    const uniqueMergeIds = [
      ...new Set(
        [...listBorrowedCount, ...listOverdueCount].map(
          (item) => item.accountId
        )
      ),
    ];

    const Rp_Accounts = uniqueMergeIds.map((accId) => {
      const arr = [...listBorrowedCount, ...listOverdueCount].filter(
        (item) => item.accountId === accId
      );
      return arr.reduce((acc, curr) => ({ ...acc, ...curr }));
    });

    const bookBorrowing = await prisma.transaction.findMany({
      where: {
        borrowedAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
        receivedFrom: {
          equals: "SYSTEM",
        },
      },
    });

    const uniqueBookIds = [
      ...new Set(bookBorrowing.map((trans) => trans.bookId)),
    ];

    const Rp_Books = uniqueBookIds.map((bookId) => {
      const arr = bookBorrowing.filter((trans) => trans.bookId === bookId);
      return {
        bookId,
        borrowedCount: arr.length,
      };
    });

    // Tạo Report chung của tháng
    const report = await prisma.report.create({
      data: {
        month,
        year,
      },
    });

    const rpAccountsData: Partial<Rp_Account>[] = Rp_Accounts.map((item) => {
      return {
        reportId: report.id,
        borrowCount: 0,
        overdueCount: 0,
        isViewedByUser: false,
        ...item,
      };
    });

    // Tạo Report cho Account
    const result_rp_account = await prisma.rp_Account.createManyAndReturn({
      data: rpAccountsData as Rp_Account[],
      // include: {
      //   Account: {
      //     select: {
      //       fullName: true,
      //     },
      //   },
      // },
    });

    const rpBooksData: Partial<Rp_Book>[] = Rp_Books.map((item) => {
      return {
        reportId: report.id,
        ...item,
      };
    });

    // Tạo Report cho Book
    const result_rp_book = await prisma.rp_Book.createManyAndReturn({
      data: rpBooksData as Rp_Book[],
      // include: {
      //   Book: {
      //     select: {
      //       title: true,
      //     },
      //   },
      // },
    });

    return NextResponse.json({
      data: {
        Report: report,
        ReportAccounts: result_rp_account.length,
        ReportBooks: result_rp_book.length,
      },
    });

    // return NextResponse.json({
    //   data: {
    //     ReportAccounts: 5,
    //     ReportBooks: 5,
    //   },
    // });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}
