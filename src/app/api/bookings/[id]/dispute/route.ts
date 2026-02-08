import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';
import { PAYOUT_CONFIG } from '@/lib/stripe/config';
import { blockPayoutForDispute } from '@/lib/stripe/transfers';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/bookings/[id]/dispute — Open a dispute
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
    const { userId, role, reasonCode, description, evidence } = body;

    if (!userId || !reasonCode || !description) {
      return NextResponse.json({ error: 'userId, reasonCode, and description required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Cannot dispute from ${booking.status} status` },
        { status: 400 }
      );
    }

    // Check dispute window
    if (booking.providerCompletedAt) {
      const hoursSinceCompletion =
        (Date.now() - booking.providerCompletedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > PAYOUT_CONFIG.dispute_window_hours) {
        return NextResponse.json(
          { error: `Dispute window (${PAYOUT_CONFIG.dispute_window_hours}h) has expired` },
          { status: 400 }
        );
      }
    }

    // Determine role
    const openedByRole =
      booking.customerId === userId ? 'CUSTOMER' :
      booking.providerId === userId ? 'PROVIDER' : (role || 'CUSTOMER');

    // Block payout
    await blockPayoutForDispute(params.id);

    // Update booking
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'DISPUTED',
        currentState: 'DISPUTED',
        disputeStatus: openedByRole === 'CUSTOMER' ? 'CUSTOMER_DISPUTE' : 'PROVIDER_DISPUTE',
        disputeOpenedAt: new Date(),
      },
    });

    // Create dispute case
    const disputeCase = await prisma.disputeCase.create({
      data: {
        bookingId: params.id,
        openedBy: userId,
        openedByRole: openedByRole as any,
        reasonCode,
        description,
        evidenceJson: evidence || undefined,
      },
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: params.id,
        eventType: 'INITIATE_DISPUTE',
        fromStatus: 'COMPLETED',
        toStatus: 'DISPUTED',
        triggeredBy: userId,
        metadata: { disputeCaseId: disputeCase.id, reasonCode },
      },
    });

    eventBus.emitBookingEvent('booking.disputed', {
      bookingId: params.id,
      userId,
      customerId: booking.customerId,
      providerId: booking.providerId,
      data: { reasonCode, disputeCaseId: disputeCase.id },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      disputeCase: {
        id: disputeCase.id,
        reasonCode: disputeCase.reasonCode,
        resolution: disputeCase.resolution,
      },
    });
  } catch (error: any) {
    console.error('[Dispute] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to open dispute' }, { status: 500 });
  }
}
