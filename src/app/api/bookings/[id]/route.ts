import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bookings/[id] — Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            businessPhone: true,
            stripeOnboarded: true,
            avgRating: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        paymentRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        payoutRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        disputeCases: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        events: {
          orderBy: { triggeredAt: 'desc' },
          take: 20,
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('[Bookings] GET [id] error:', error);
    return NextResponse.json({ error: 'Failed to get booking' }, { status: 500 });
  }
}
