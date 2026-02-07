import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit, checkRateLimit } from '@/lib/rateLimit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await checkRateLimit(apiRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = params;

    await prisma.savedAddress.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await checkRateLimit(apiRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = params;
    const body = await request.json();
    const { label, address, latitude, longitude, city, state, postalCode } = body;

    const updatedAddress = await prisma.savedAddress.update({
      where: { id },
      data: {
        label,
        address,
        latitude,
        longitude,
        city,
        state,
        postalCode
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}