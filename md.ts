import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { failedJWTCheck, jwtCheck } from "@/lib/helper";

export async function POST(req: NextRequest) {
  try {
    const { isAuth } = await jwtCheck(req);
    if (!isAuth) {
      return failedJWTCheck();
    }

    return NextResponse.json("");
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: (err as Error).name }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import * as jose from "jose";
// import prisma from "./lib/prisma";

// const allowedOrigins = ["http://localhost:5173"];

// const corsOptions = {
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function middleware(request: NextRequest) {
//   // Check the origin from the request
//   const origin = request.headers.get("origin") ?? "";
//   const isAllowedOrigin = allowedOrigins.includes(origin);

//   // Handle preflighted requests
//   const isPreflight = request.method === "OPTIONS";

//   if (isPreflight) {
//     const preflightHeaders = {
//       ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
//       ...corsOptions,
//     };
//     return NextResponse.json({}, { headers: preflightHeaders });
//   }

//   let cookie = request.cookies.get("access-token");
//   try {
//     const decoded = await jose.jwtVerify(
//       cookie!.value,
//       new TextEncoder().encode(process.env.SECRET_KEY)
//     );
//     const { userName } = decoded.payload;

//     const check = await prisma.account.findUnique({
//       where: {
//         userName: userName as string,
//       },
//     });
//     console.log(check);
//   } catch (err) {
//     console.log(err);
//   }

//   // Handle simple requests
//   const response = NextResponse.next();

//   if (isAllowedOrigin) {
//     response.headers.set("Access-Control-Allow-Origin", origin);
//   }

//   Object.entries(corsOptions).forEach(([key, value]) => {
//     response.headers.set(key, value);
//   });

//   return response;
// }

// export const config = {
//   matcher: "/api/:path*",
// };
