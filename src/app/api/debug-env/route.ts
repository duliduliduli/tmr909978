import { NextResponse } from "next/server";

// Temporary diagnostic route — remove after fixing middleware issue
export async function GET() {
  return NextResponse.json({
    hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
    clerkSecretPrefix: process.env.CLERK_SECRET_KEY?.slice(0, 8) || "MISSING",
    clerkSecretLength: process.env.CLERK_SECRET_KEY?.length || 0,
    hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    publishablePrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0, 12) || "MISSING",
    hasSignInUrl: !!process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "NOT SET",
    hasSignUpUrl: !!process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}
