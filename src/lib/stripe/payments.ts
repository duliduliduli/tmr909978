import { stripe, STRIPE_CONNECT_CONFIG, PAYMENT_CONFIG } from './config';
import { prisma } from '@/lib/prisma';

// ===== PAYMENT PROCESSING =====

export interface CreatePaymentIntentData {
  bookingId: string;
  amount: number; // in cents
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface ProcessPaymentData {
  bookingId: string;
  paymentMethodId: string;
  savePaymentMethod?: boolean;
  tipAmount?: number; // in cents
}

/**
 * Calculate pricing breakdown for a booking
 */
export function calculatePricing(
  baseAmount: number,
  addOnsAmount: number = 0,
  tipAmount: number = 0,
  taxRate: number = 0.0875 // 8.75% default tax
) {
  const subtotal = baseAmount + addOnsAmount;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalBeforeTip = subtotal + taxAmount;
  const totalAmount = totalBeforeTip + tipAmount;
  // Platform fee on subtotal+tax only — tip goes 100% to provider
  const platformFee = Math.round(totalBeforeTip * (STRIPE_CONNECT_CONFIG.application_fee_percentage / 100));
  const providerAmount = totalAmount - platformFee;

  return {
    baseAmount,
    addOnsAmount,
    tipAmount,
    taxAmount,
    platformFee,
    totalAmount,
    providerAmount,
    subtotal
  };
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(data: CreatePaymentIntentData) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        customer: true,
        provider: true,
        service: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new Error(`Cannot create payment for booking in ${booking.status} state`);
    }

    // Ensure customer has Stripe customer ID
    let customerId = booking.customer.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: booking.customer.email,
        name: `${booking.customer.firstName} ${booking.customer.lastName}`,
        phone: booking.customer.phone || undefined,
        metadata: {
          user_id: booking.customerId,
          platform: 'tumaro'
        }
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: booking.customerId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create payment intent — funds stay on platform account (separate charges pattern)
    // Transfer to provider happens later via stripe.transfers.create()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: PAYMENT_CONFIG.currency,
      customer: customerId,
      automatic_payment_methods: PAYMENT_CONFIG.automatic_payment_methods,
      capture_method: PAYMENT_CONFIG.capture_method,
      confirmation_method: PAYMENT_CONFIG.confirmation_method,
      setup_future_usage: PAYMENT_CONFIG.setup_future_usage,
      transfer_group: `booking_${data.bookingId}`,
      metadata: {
        booking_id: data.bookingId,
        customer_id: booking.customerId,
        provider_id: booking.providerId,
        service_id: booking.serviceId,
        platform: 'tumaro',
        ...data.metadata
      },
      description: `${booking.service.name} - Booking ${booking.bookingNumber}`
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        stripePaymentIntentId: paymentIntent.id
      }
    });

    // Create payment record for tracking
    await prisma.paymentRecord.create({
      data: {
        bookingId: data.bookingId,
        stripePaymentIntentId: paymentIntent.id,
        amount: data.amount,
        currency: PAYMENT_CONFIG.currency,
        status: paymentIntent.status,
      }
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    };

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPayment(bookingId: string, paymentMethodId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { stripePaymentIntentId: true, status: true }
    });

    if (!booking?.stripePaymentIntentId) {
      throw new Error('No payment intent found for booking');
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      booking.stripePaymentIntentId,
      {
        payment_method: paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}/success`
      }
    );

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    };

  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

/**
 * Process a payment for a booking
 */
export async function processPayment(data: ProcessPaymentData) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        customer: true,
        provider: true,
        service: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.provider.stripeAccountId) {
      throw new Error('Provider has not completed Stripe onboarding');
    }

    // Calculate final pricing with tip
    const pricing = calculatePricing(
      booking.baseAmount,
      booking.addOnsAmount || 0,
      data.tipAmount || 0
    );

    // Create payment intent if not exists
    let paymentIntentId = booking.stripePaymentIntentId;

    if (!paymentIntentId) {
      const result = await createPaymentIntent({
        bookingId: data.bookingId,
        amount: pricing.totalAmount,
        paymentMethodId: data.paymentMethodId
      });
      paymentIntentId = result.paymentIntentId;
    } else {
      // Update existing payment intent with new amount if tip was added
      if (data.tipAmount) {
        await stripe.paymentIntents.update(paymentIntentId, {
          amount: pricing.totalAmount,
        });
      }
    }

    // Confirm the payment
    const confirmation = await confirmPayment(data.bookingId, data.paymentMethodId);

    // Update booking with final amounts
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        tipAmount: data.tipAmount || 0,
        totalAmount: pricing.totalAmount,
        platformFee: pricing.platformFee,
        taxAmount: pricing.taxAmount
      }
    });

    // Save payment method if requested
    if (data.savePaymentMethod && booking.customer.stripeCustomerId) {
      await stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: booking.customer.stripeCustomerId
      });
    }

    return {
      paymentIntentId: confirmation.paymentIntentId,
      status: confirmation.status,
      amount: pricing.totalAmount,
      platformFee: pricing.platformFee,
      providerAmount: pricing.providerAmount
    };

  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    // Update booking status to payment failed
    if (data.bookingId) {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'PAYMENT_FAILED' }
      }).catch(console.error);
    }
    
    throw error;
  }
}

/**
 * Issue a refund for a booking
 */
export async function issueRefund(
  bookingId: string,
  amount?: number, // partial refund amount in cents
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        stripePaymentIntentId: true,
        totalAmount: true,
        status: true,
        bookingNumber: true
      }
    });

    if (!booking?.stripePaymentIntentId) {
      throw new Error('No payment found for booking');
    }

    // Get the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripePaymentIntentId
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Cannot refund payment with status: ${paymentIntent.status}`);
    }

    // Create the refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: amount || undefined, // undefined = full refund
      reason,
      metadata: {
        booking_id: bookingId,
        booking_number: booking.bookingNumber,
        platform: 'tumaro',
        refund_type: amount ? 'partial' : 'full'
      }
    });

    // Update booking with refund information
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        refundAmount: refund.amount,
        refundedAt: new Date(),
        status: 'REFUNDED'
      }
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
      created: new Date(refund.created * 1000)
    };

  } catch (error: any) {
    console.error('Error issuing refund:', error);
    throw error;
  }
}

/**
 * Get customer's saved payment methods
 */
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      fingerprint: pm.card?.fingerprint
    }));

  } catch (error: any) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
}

/**
 * Delete a customer's payment method
 */
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return { success: true, id: paymentMethod.id };
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

/**
 * Capture payment for pay-later bookings
 */
export async function capturePayment(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { stripePaymentIntentId: true, status: true }
    });

    if (!booking?.stripePaymentIntentId) {
      throw new Error('No payment intent found for booking');
    }

    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripePaymentIntentId
    );

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    };

  } catch (error: any) {
    console.error('Error capturing payment:', error);
    throw error;
  }
}