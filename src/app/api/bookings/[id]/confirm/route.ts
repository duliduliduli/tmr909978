import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';
import { releasePayoutToProvider } from '@/lib/stripe/transfers';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/bookings/[id]/confirm — Customer confirms satisfaction
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
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== customerId) {
      return NextResponse.json({ error: 'Not authorized — wrong customer' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Cannot confirm from ${booking.status} status` },
        { status: 400 }
      );
    }

    if (booking.customerConfirmedAt) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 });
    }

    // Mark confirmed
    await prisma.booking.update({
      where: { id: params.id },
      data: { customerConfirmedAt: new Date() },
    });

    // Release payout to provider
    let payoutResult = null;
    try {
      payoutResult = await releasePayoutToProvider(params.id);
    } catch (payoutError: any) {
      console.error('[Confirm] Payout release failed:', payoutError.message);
      // Confirmation still recorded — payout can be retried
    }

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: params.id,
        eventType: 'CUSTOMER_CONFIRM',
        toStatus: 'COMPLETED',
        triggeredBy: customerId,
        metadata: payoutResult ? { transferId: payoutResult.transferId } : undefined,
      },
    });

    eventBus.emitBookingEvent('booking.confirmed', {
      bookingId: params.id,
      customerId,
      providerId: booking.providerId,
      data: { payoutReleased: !!payoutResult },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      confirmed: true,
      payoutReleased: !!payoutResult,
      transferId: payoutResult?.transferId,
    });
  } catch (error: any) {
    console.error('[Confirm] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to confirm' }, { status: 500 });
  }
}
