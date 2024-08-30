import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const listCategories = await prisma.category.findMany();

    return NextResponse.json({ listCategories });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong"}, { status: 500 })
  }
}