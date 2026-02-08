import { stripe, STRIPE_CONNECT_CONFIG, PAYOUT_CONFIG } from './config';
import { prisma } from '@/lib/prisma';

/**
 * Release payout to provider via Stripe Transfer
 * Called after customer confirms or auto-confirm timeout
 */
export async function releasePayoutToProvider(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      provider: true,
      paymentRecords: { where: { status: 'succeeded' }, take: 1 },
      payoutRecords: { where: { status: 'PENDING_RELEASE' }, take: 1 },
    },
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'COMPLETED') throw new Error('Booking must be COMPLETED to release payout');
  if (!booking.customerConfirmedAt && (!booking.autoConfirmAt || new Date() < booking.autoConfirmAt)) {
    throw new Error('Booking not yet confirmed by customer or auto-confirm');
  }
  if (booking.disputeOpenedAt) throw new Error('Cannot release payout — active dispute');

  const providerAccountId = booking.provider.stripeAccountId;
  if (!providerAccountId) throw new Error('Provider has no Stripe Connect account');

  const paymentRecord = booking.paymentRecords[0];
  if (!paymentRecord?.stripeChargeId) throw new Error('No charge ID found for this booking');

  const payoutRecord = booking.payoutRecords[0];
  if (!payoutRecord) throw new Error('No payout record found');

  // Calculate provider amount: total - platform fee
  const totalCents = Math.round(booking.totalAmount * 100);
  const platformFeeCents = Math.round((booking.platformFee || 0) * 100);
  const providerAmount = totalCents - platformFeeCents;

  if (providerAmount < PAYOUT_CONFIG.minimum_transfer_amount) {
    throw new Error(`Transfer amount ($${(providerAmount / 100).toFixed(2)}) below minimum`);
  }

  // Create the Stripe transfer
  const transfer = await stripe.transfers.create({
    amount: providerAmount,
    currency: 'usd',
    destination: providerAccountId,
    source_transaction: paymentRecord.stripeChargeId,
    transfer_group: `booking_${bookingId}`,
    metadata: {
      booking_id: bookingId,
      booking_number: booking.bookingNumber,
      platform_fee: String(platformFeeCents),
    },
  });

  // Update payout record
  await prisma.payoutRecord.update({
    where: { id: payoutRecord.id },
    data: {
      stripeTransferId: transfer.id,
      status: 'RELEASED',
      releasedAt: new Date(),
      amount: providerAmount,
    },
  });

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      stripeTransferId: transfer.id,
      providerGross: totalCents,
      providerNet: providerAmount,
    },
  });

  return {
    transferId: transfer.id,
    amount: providerAmount,
    status: 'released',
  };
}

/**
 * Block payout for an active dispute
 */
export async function blockPayoutForDispute(bookingId: string) {
  const payoutRecord = await prisma.payoutRecord.findFirst({
    where: { bookingId, status: 'PENDING_RELEASE' },
  });

  if (!payoutRecord) return; // Already released or no record

  await prisma.payoutRecord.update({
    where: { id: payoutRecord.id },
    data: { status: 'BLOCKED_DISPUTE' },
  });
}

/**
 * Get provider earnings summary
 */
export async function getProviderEarnings(
  providerId: string,
  from?: Date,
  to?: Date
) {
  const dateFilter = {
    ...(from && { gte: from }),
    ...(to && { lte: to }),
  };
  const hasDateFilter = from || to;

  const [released, pending, blocked] = await Promise.all([
    prisma.payoutRecord.aggregate({
      where: {
        providerId,
        status: 'RELEASED',
        ...(hasDateFilter && { releasedAt: dateFilter }),
      },
      _sum: { amount: true, platformFee: true },
      _count: true,
    }),
    prisma.payoutRecord.aggregate({
      where: { providerId, status: 'PENDING_RELEASE' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payoutRecord.aggregate({
      where: { providerId, status: 'BLOCKED_DISPUTE' },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const recentPayouts = await prisma.payoutRecord.findMany({
    where: { providerId, status: 'RELEASED' },
    orderBy: { releasedAt: 'desc' },
    take: 20,
    include: {
      booking: {
        select: {
          bookingNumber: true,
          scheduledStartTime: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  return {
    totalEarnings: released._sum.amount || 0,
    totalFees: released._sum.platformFee || 0,
    releasedCount: released._count,
    pendingEarnings: pending._sum.amount || 0,
    pendingCount: pending._count,
    blockedEarnings: blocked._sum.amount || 0,
    blockedCount: blocked._count,
    recentPayouts,
  };
}
