"use server";

import accounts from "@/data/accounts-data";
import prisma from "@/lib/prisma";
import { Account } from "@prisma/client";

export const createAccounts = async () => {
  try {
    await prisma.account.createMany({
      data: accounts as Account[],
    });
  } catch (err) {
    throw err;
  }
};
