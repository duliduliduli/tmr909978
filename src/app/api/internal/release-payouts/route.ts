import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { releasePayoutToProvider } from '@/lib/stripe/transfers';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/internal/release-payouts — Cron job to auto-confirm and release payouts
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find bookings eligible for auto-confirm
    const eligibleBookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        customerConfirmedAt: null,
        autoConfirmAt: { lte: new Date() },
        disputeOpenedAt: null,
      },
      select: {
        id: true,
        bookingNumber: true,
        customerId: true,
        providerId: true,
      },
    });

    let released = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const booking of eligibleBookings) {
      try {
        // Auto-confirm
        await prisma.booking.update({
          where: { id: booking.id },
          data: { customerConfirmedAt: new Date() },
        });

        // Release payout
        await releasePayoutToProvider(booking.id);

        // Create event
        await prisma.bookingEvent.create({
          data: {
            bookingId: booking.id,
            eventType: 'AUTO_CONFIRM',
            toStatus: 'COMPLETED',
            triggeredBy: 'system_cron',
            metadata: { auto_confirmed: true },
          },
        });

        eventBus.emitBookingEvent('booking.confirmed', {
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
          data: { auto_confirmed: true },
          timestamp: new Date(),
        });

        released++;
      } catch (err: any) {
        failed++;
        errors.push(`${booking.bookingNumber}: ${err.message}`);
        console.error(`[Cron] Failed to release payout for ${booking.bookingNumber}:`, err.message);
      }
    }

    console.log(`[Cron] Release payouts: ${released} released, ${failed} failed, ${eligibleBookings.length} total`);

    return NextResponse.json({
      processed: eligibleBookings.length,
      released,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[Cron] Release payouts error:', error);
    return NextResponse.json({ error: 'Failed to process payouts' }, { status: 500 });
  }
}
