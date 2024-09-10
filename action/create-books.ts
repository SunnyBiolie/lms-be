"use server";

import prisma from "@/lib/prisma";
import { Book } from "@prisma/client";
import dayjs from "dayjs";

export const createBooks = async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/benoitvallon/100-best-books/master/books.json",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data: {
      title: string;
      author: string;
      year: Number;
      pages: Number;
    }[] = await response.json();

    const firstTenData = data.slice(0, 20);

    // @ts-ignore
    const formatedData: (Book & {
      Categories: string[];
    })[] = firstTenData.map((book, index) => ({
      title: book.title,
      author: book.author,
      publisher: "unknown",
      publicationDate: dayjs(book.year.toString()).format(),
      pages: book.pages,
      quantity: 10,
      Categories: {
        connect: [{ id: Math.round(Math.random() * 10) }],
      },
    }));

    await prisma.category.createMany({
      data: [
        {
          id: 1,
          name: "action",
        },
        {
          id: 2,
          name: "adventure",
        },
        {
          id: 3,
          name: "fantasy",
        },
        {
          id: 4,
          name: "mystery",
        },
        {
          id: 5,
          name: "horror",
        },
        {
          id: 6,
          name: "historical",
        },
        {
          id: 7,
          name: "romance",
        },
        {
          id: 8,
          name: "literary",
        },
        {
          id: 9,
          name: "self-help",
        },
        {
          id: 10,
          name: "history",
        },
      ],
    });

    formatedData.forEach(async (item: Book) => {
      await prisma.book.create({
        data: item,
      });
    });
  } catch (err) {
    throw err;
  }
};
