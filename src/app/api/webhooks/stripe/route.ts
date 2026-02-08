import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { prisma } from '@/lib/prisma';
import { eventBus } from '@/lib/events/eventBus';
import { blockPayoutForDispute } from '@/lib/stripe/transfers';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency check
  const existing = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record event before processing
  await prisma.webhookEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      payload: event.data.object as any,
    },
  });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;
      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object);
        break;
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Error handling ${event.type}:`, err.message);
    // Still return 200 to prevent Stripe retries for handler errors
  }

  return NextResponse.json({ received: true });
}

// ===== EVENT HANDLERS =====

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.booking_id;
  if (!bookingId) {
    console.log('[Webhook] payment_intent.succeeded without booking_id metadata');
    return;
  }

  const chargeId = paymentIntent.latest_charge;

  // Update booking status to CONFIRMED
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      stripeChargeId: chargeId || undefined,
    },
  });

  // Update or create payment record
  await prisma.paymentRecord.upsert({
    where: {
      id: (await prisma.paymentRecord.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        select: { id: true },
      }))?.id || '',
    },
    update: {
      status: 'succeeded',
      stripeChargeId: chargeId || undefined,
    },
    create: {
      bookingId,
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: chargeId || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId,
      eventType: 'PAYMENT_SUCCESS',
      fromStatus: 'PENDING_PAYMENT',
      toStatus: 'CONFIRMED',
      triggeredBy: 'stripe_webhook',
      metadata: { paymentIntentId: paymentIntent.id, chargeId },
    },
  });

  // Emit event
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true, providerId: true },
  });

  eventBus.emitBookingEvent('payment.succeeded', {
    bookingId,
    customerId: booking?.customerId,
    providerId: booking?.providerId,
    data: { amount: paymentIntent.amount, chargeId },
    timestamp: new Date(),
  });

  console.log(`[Webhook] Payment succeeded for booking ${bookingId}`);
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.booking_id;
  if (!bookingId) return;

  const lastError = paymentIntent.last_payment_error;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'PAYMENT_FAILED' },
  });

  // Update payment record
  const existingRecord = await prisma.paymentRecord.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (existingRecord) {
    await prisma.paymentRecord.update({
      where: { id: existingRecord.id },
      data: {
        status: 'failed',
        failureCode: lastError?.code || undefined,
        failureMessage: lastError?.message || undefined,
      },
    });
  }

  await prisma.bookingEvent.create({
    data: {
      bookingId,
      eventType: 'PAYMENT_FAILED',
      fromStatus: 'PENDING_PAYMENT',
      toStatus: 'PAYMENT_FAILED',
      triggeredBy: 'stripe_webhook',
      metadata: { error: lastError?.message },
    },
  });

  eventBus.emitBookingEvent('payment.failed', {
    bookingId,
    data: { error: lastError?.message },
    timestamp: new Date(),
  });

  console.log(`[Webhook] Payment failed for booking ${bookingId}`);
}

async function handleChargeRefunded(charge: any) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  const booking = await prisma.booking.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!booking) return;

  const refundedAmount = charge.amount_refunded;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      refundAmount: refundedAmount / 100, // Store as dollars
      refundedAt: new Date(),
      status: charge.refunded ? 'REFUNDED' : booking.status,
    },
  });

  // Update payment record
  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (paymentRecord) {
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: { status: charge.refunded ? 'refunded' : 'partially_refunded' },
    });
  }

  console.log(`[Webhook] Charge refunded for booking ${booking.id}: $${(refundedAmount / 100).toFixed(2)}`);
}

async function handleDisputeCreated(dispute: any) {
  const chargeId = dispute.charge;
  if (!chargeId) return;

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
  });

  if (!booking) return;

  // Block payout
  await blockPayoutForDispute(booking.id);

  // Update booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'DISPUTED',
      disputeStatus: 'CUSTOMER_DISPUTE',
      disputeOpenedAt: new Date(),
    },
  });

  // Create dispute case
  await prisma.disputeCase.create({
    data: {
      bookingId: booking.id,
      openedBy: 'stripe',
      openedByRole: 'PLATFORM',
      reasonCode: dispute.reason || 'unknown',
      description: `Stripe dispute: ${dispute.reason || 'Unknown reason'}`,
      evidenceJson: { stripeDisputeId: dispute.id, amount: dispute.amount },
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking.id,
      eventType: 'DISPUTE_CREATED',
      toStatus: 'DISPUTED',
      triggeredBy: 'stripe_webhook',
      metadata: { stripeDisputeId: dispute.id, reason: dispute.reason },
    },
  });

  eventBus.emitBookingEvent('booking.disputed', {
    bookingId: booking.id,
    data: { stripeDisputeId: dispute.id, reason: dispute.reason },
    timestamp: new Date(),
  });

  console.log(`[Webhook] Dispute created for booking ${booking.id}`);
}

async function handleDisputeClosed(dispute: any) {
  const chargeId = dispute.charge;
  if (!chargeId) return;

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
  });
  if (!booking) return;

  const disputeCase = await prisma.disputeCase.findFirst({
    where: { bookingId: booking.id },
    orderBy: { createdAt: 'desc' },
  });

  const won = dispute.status === 'won';
  const resolution = won ? 'RESOLVED_PROVIDER' : 'RESOLVED_CUSTOMER';

  if (disputeCase) {
    await prisma.disputeCase.update({
      where: { id: disputeCase.id },
      data: {
        resolution,
        resolvedAt: new Date(),
        resolutionNotes: `Stripe dispute ${dispute.status}`,
      },
    });
  }

  // If merchant won, unblock payout
  if (won) {
    const payoutRecord = await prisma.payoutRecord.findFirst({
      where: { bookingId: booking.id, status: 'BLOCKED_DISPUTE' },
    });
    if (payoutRecord) {
      await prisma.payoutRecord.update({
        where: { id: payoutRecord.id },
        data: { status: 'PENDING_RELEASE' },
      });
    }
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'COMPLETED', disputeStatus: resolution },
    });
  } else {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'REFUNDED', disputeStatus: resolution },
    });
  }

  console.log(`[Webhook] Dispute closed for booking ${booking.id}: ${dispute.status}`);
}

async function handleAccountUpdated(account: any) {
  const accountId = account.id;
  if (!accountId) return;

  const provider = await prisma.providerProfile.findFirst({
    where: { stripeAccountId: accountId },
  });

  if (!provider) return;

  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;
  const detailsSubmitted = account.details_submitted;

  await prisma.providerProfile.update({
    where: { id: provider.id },
    data: {
      stripeOnboarded: chargesEnabled && payoutsEnabled && detailsSubmitted,
    },
  });

  console.log(`[Webhook] Account updated for provider ${provider.id}: charges=${chargesEnabled}, payouts=${payoutsEnabled}`);
}
