import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerk middleware can throw on Next.js 13.5 — catch and pass through
const clerk = clerkMiddleware();

export default async function middleware(req: NextRequest) {
  try {
    return await clerk(req, {} as any);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
