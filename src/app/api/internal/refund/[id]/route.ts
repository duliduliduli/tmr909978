import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/config';
import { issueRefund } from '@/lib/stripe/payments';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/internal/refund/[id] — Admin-initiated refund
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify cron/admin secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, reason = 'requested_by_customer' } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payoutRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If payout was already released, reverse the transfer first
    const payoutRecord = booking.payoutRecords[0];
    if (payoutRecord?.status === 'RELEASED' && payoutRecord.stripeTransferId) {
      try {
        await stripe.transfers.createReversal(payoutRecord.stripeTransferId, {
          amount: amount ? Math.round(amount * 100) : undefined, // undefined = full reversal
        });

        await prisma.payoutRecord.update({
          where: { id: payoutRecord.id },
          data: { status: 'REVERSED' },
        });
      } catch (reverseError: any) {
        console.error('[Refund] Transfer reversal failed:', reverseError.message);
        return NextResponse.json(
          { error: `Transfer reversal failed: ${reverseError.message}` },
          { status: 500 }
        );
      }
    } else if (payoutRecord?.status === 'PENDING_RELEASE') {
      // Just block the payout
      await prisma.payoutRecord.update({
        where: { id: payoutRecord.id },
        data: { status: 'BLOCKED_DISPUTE' },
      });
    }

    // Issue the refund
    const refundResult = await issueRefund(
      params.id,
      amount ? Math.round(amount * 100) : undefined,
      reason
    );

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: params.id,
        eventType: 'PROCESS_REFUND',
        fromStatus: booking.status,
        toStatus: 'REFUNDED',
        triggeredBy: 'admin',
        metadata: {
          refundId: refundResult.refundId,
          amount: refundResult.amount,
          reason,
        },
      },
    });

    eventBus.emitBookingEvent('booking.cancelled', {
      bookingId: params.id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      data: { refunded: true, amount: refundResult.amount },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      refund: refundResult,
      transferReversed: payoutRecord?.status === 'RELEASED',
    });
  } catch (error: any) {
    console.error('[Refund] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 500 });
  }
}
