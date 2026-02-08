import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';
import { PAYOUT_CONFIG } from '@/lib/stripe/config';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/bookings/[id]/complete — Provider marks service complete
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await apiRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { providerId, completionPhotos, providerNotes } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'providerId required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { provider: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.providerId !== providerId) {
      return NextResponse.json({ error: 'Not authorized — wrong provider' }, { status: 403 });
    }

    if (booking.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Cannot complete from ${booking.status} status` },
        { status: 400 }
      );
    }

    // Calculate auto-confirm time
    const autoConfirmAt = new Date(Date.now() + PAYOUT_CONFIG.auto_confirm_hours * 60 * 60 * 1000);

    // Calculate payout amounts
    const totalCents = Math.round(booking.totalAmount * 100);
    const platformFeeCents = Math.round((booking.platformFee || 0) * 100);
    const providerAmount = totalCents - platformFeeCents;

    // Update booking
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        currentState: 'COMPLETED',
        actualEndTime: new Date(),
        providerCompletedAt: new Date(),
        autoConfirmAt,
        completionPhotos: completionPhotos || [],
        providerNotes: providerNotes || undefined,
        providerGross: totalCents,
        providerNet: providerAmount,
      },
    });

    // Create payout record (PENDING_RELEASE)
    await prisma.payoutRecord.create({
      data: {
        bookingId: params.id,
        providerId,
        amount: providerAmount,
        platformFee: platformFeeCents,
        status: 'PENDING_RELEASE',
        scheduledFor: autoConfirmAt,
      },
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: params.id,
        eventType: 'COMPLETE_SERVICE',
        fromStatus: 'IN_PROGRESS',
        toStatus: 'COMPLETED',
        triggeredBy: providerId,
        metadata: {
          autoConfirmAt: autoConfirmAt.toISOString(),
          providerAmount,
          platformFee: platformFeeCents,
        },
      },
    });

    // Update provider metrics
    await prisma.providerProfile.update({
      where: { id: providerId },
      data: { completedBookings: { increment: 1 } },
    });

    eventBus.emitBookingEvent('booking.completed', {
      bookingId: params.id,
      providerId,
      customerId: booking.customerId,
      data: { autoConfirmAt, providerAmount },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: params.id,
        status: 'COMPLETED',
        autoConfirmAt,
        providerAmount: providerAmount / 100,
      },
    });
  } catch (error: any) {
    console.error('[Complete] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete' }, { status: 500 });
  }
}
