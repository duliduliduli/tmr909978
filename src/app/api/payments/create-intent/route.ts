import { NextRequest, NextResponse } from 'next/server';
import { stripe, PAYMENT_CONFIG } from '@/lib/stripe/config';
import { paymentRateLimit, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success } = await checkRateLimit(paymentRateLimit, ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { amount, tipAmount = 0, metadata = {} } = body;

    // Validate amount (in cents)
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum charge is $0.50.' },
        { status: 400 }
      );
    }

    if (typeof tipAmount !== 'number' || tipAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid tip amount.' },
        { status: 400 }
      );
    }

    const totalAmount = amount + tipAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: PAYMENT_CONFIG.currency,
      automatic_payment_methods: PAYMENT_CONFIG.automatic_payment_methods,
      capture_method: PAYMENT_CONFIG.capture_method,
      metadata: {
        ...metadata,
        tipAmount: String(tipAmount),
        subtotal: String(amount),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);

    if (error?.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment. Please try again.' },
      { status: 500 }
    );
  }
}
