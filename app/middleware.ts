import { NextResponse, NextRequest } from "next/server";

export const middleware = async (req: NextRequest) => {
  console.debug("REQUEST HEADERS:::: ", req.headers);

  const response = NextResponse.next();
  response.headers.set(
    "x-forwarded-host",
    req.headers.get("origin")?.replace(/(http|https):\/\//, "") || "*"
  );
  return response;
};

export const config = {
  matcher: ['/:path*'],
};