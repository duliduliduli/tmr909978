import { NextResponse } from 'next/server';

export async function GET() {
  // No real Stripe customers yet — return empty array.
  // When customer auth is wired up, this will:
  //   1. Look up the Stripe customerId from the session
  //   2. Call stripe.paymentMethods.list({ customer, type: 'card' })
  //   3. Return the mapped card list
  return NextResponse.json({ cards: [] });
}
