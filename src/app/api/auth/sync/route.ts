import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? "";
  const firstName = clerkUser.firstName ?? "";
  const lastName = clerkUser.lastName ?? "";
  const avatar = clerkUser.imageUrl ?? null;
  const phone =
    clerkUser.phoneNumbers.find(
      (p) => p.id === clerkUser.primaryPhoneNumberId
    )?.phoneNumber ?? null;

  // Upsert User by clerkUserId
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email,
      firstName,
      lastName,
      avatar,
      phone,
      lastLoginAt: new Date(),
    },
    create: {
      clerkUserId,
      email,
      firstName,
      lastName,
      avatar,
      phone,
      emailVerified: true,
      lastLoginAt: new Date(),
    },
    include: {
      customerProfile: true,
      providerProfile: true,
    },
  });

  // Auto-create CustomerProfile if missing
  if (!user.customerProfile) {
    await prisma.customerProfile.create({
      data: { userId: user.id },
    });
  }

  // Re-fetch to get fresh profile IDs
  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      customerProfile: true,
      providerProfile: true,
    },
  });

  return NextResponse.json({
    userId: freshUser!.id,
    customerProfileId: freshUser!.customerProfile?.id ?? null,
    providerProfileId: freshUser!.providerProfile?.id ?? null,
    firstName,
    lastName,
    email,
    avatar,
    phone,
  });
}
