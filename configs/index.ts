import { NextResponse } from "next/server";

export const missingFields = () => {
  return NextResponse.json(
    { message: "Missing required field(s) to fetch data" },
    { status: 400 }
  );
};

export const doesNotExist = (name: string) => {
  return NextResponse.json(
    { message: `"${name}" does not exist` },
    { status: 404 }
  );
};
