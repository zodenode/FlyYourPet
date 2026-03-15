import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pass-through middleware (next-intl removed; i18n not used on landing)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
