import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const clerk = clerkMiddleware();

export default async function middleware(req: NextRequest) {
  try {
    return await clerk(req, {} as any);
  } catch (err: any) {
    console.error("[MIDDLEWARE ERROR]", {
      message: err?.message,
      stack: err?.stack?.slice(0, 500),
      url: req.url,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      secretKeyPrefix: process.env.CLERK_SECRET_KEY?.slice(0, 8),
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
    // Don't block the request — let it through without auth
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
