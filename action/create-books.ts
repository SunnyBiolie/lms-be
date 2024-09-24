"use server";

import booksData from "@/data/books-data";
import prisma from "@/lib/prisma";
import { Book } from "@prisma/client";

export const createBooks = async () => {
  try {
    (booksData as Book[]).forEach(async (item: Book) => {
      await prisma.book.create({
        data: item,
      });
    });
  } catch (err) {
    throw err;
  }
};
