import { Book } from "@prisma/client";

interface Categories {
  Categories: {
    connect: {
      id: number;
    }[];
  };
}

const booksData: Partial<Book & Categories>[] = [
  {
    title: "Sons and Lovers",
    author: "D. H. Lawrence",
    publisher: "Gerald Duckworth and Company Ltd",
    publicationDate: new Date("1913"),
    pages: 423,
    quantity: 6,
    price: 325000,
    isSpecial: true,

    Categories: {
      connect: [{ id: 1001 }, { id: 1003 }],
    },
  },
  {
    title: "War and Peace",
    author: "Leo Tolstoy",
    publisher: "The Russian Messenger",
    publicationDate: new Date("1867"),
    pages: 1296,
    quantity: 8,
    price: 1220000,
    isSpecial: true,

    Categories: {
      connect: [{ id: 1006 }],
    },
  },
  {
    title: "Anna Karenina",
    author: "Leo Tolstoy",
    publisher: "The Russian Messenger",
    publicationDate: new Date("1878"),
    pages: 864,
    quantity: 5,
    price: 550000,
    isSpecial: false,

    Categories: {
      connect: [{ id: 1001 }, { id: 1008 }],
    },
  },
];

export default booksData;
