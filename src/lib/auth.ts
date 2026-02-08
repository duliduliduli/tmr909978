import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * For use in API routes. Gets the authenticated user from Clerk + DB.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getAuthenticatedUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      customerProfile: true,
      providerProfile: true,
    },
  });

  return user;
}
