"use server";

import categoriesData from "@/data/categories-data";
import prisma from "@/lib/prisma";
import { Book } from "@prisma/client";
import dayjs from "dayjs";

export const createCategories = async () => {
  try {
    await prisma.category.createMany({
      data: categoriesData,
    });
  } catch (err) {
    throw err;
  }
};
