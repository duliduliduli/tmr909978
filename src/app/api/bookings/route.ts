import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';
import { calculatePricing, createPaymentIntent } from '@/lib/stripe/payments';
import { eventBus } from '@/lib/events/eventBus';

// POST /api/bookings — Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await apiRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const {
      customerId,
      providerId,
      serviceId,
      scheduledStartTime,
      serviceAddress,
      vehicleInfo,
      specialInstructions,
      addOnServices,
      tipAmount = 0,
    } = body;

    // Validate required fields
    if (!customerId || !providerId || !serviceId || !scheduledStartTime || !serviceAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify provider exists and is onboarded
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Calculate pricing
    const baseAmount = Math.round(service.basePrice * 100); // Convert to cents
    const addOnsAmount = body.addOnsAmount ? Math.round(body.addOnsAmount * 100) : 0;
    const tipCents = Math.round(tipAmount * 100);
    const pricing = calculatePricing(baseAmount, addOnsAmount, tipCents);

    // Generate booking number
    const bookingNumber = `TUM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Parse scheduled times
    const startTime = new Date(scheduledStartTime);
    const estimatedDuration = service.estimatedDuration || 60;
    const endTime = new Date(startTime.getTime() + estimatedDuration * 60 * 1000);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        providerId,
        serviceId,
        status: 'PENDING_PAYMENT',
        currentState: 'PENDING_PAYMENT',
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
        serviceAddress: serviceAddress.street || serviceAddress.address || '',
        serviceLatitude: serviceAddress.latitude,
        serviceLongitude: serviceAddress.longitude,
        serviceCity: serviceAddress.city,
        serviceState: serviceAddress.state,
        servicePostalCode: serviceAddress.postalCode,
        baseAmount: pricing.baseAmount / 100, // Store as dollars in DB
        addOnsAmount: pricing.addOnsAmount / 100,
        taxAmount: pricing.taxAmount / 100,
        tipAmount: pricing.tipAmount / 100,
        totalAmount: pricing.totalAmount / 100,
        platformFee: pricing.platformFee / 100,
        vehicleInfo: vehicleInfo || undefined,
        specialInstructions: specialInstructions || undefined,
        addOnServices: addOnServices || undefined,
      },
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'BOOKING_CREATED',
        toStatus: 'PENDING_PAYMENT',
        triggeredBy: customerId,
        metadata: { bookingNumber },
      },
    });

    // Create PaymentIntent for this booking
    let clientSecret = null;
    let paymentIntentId = null;

    try {
      const paymentResult = await createPaymentIntent({
        bookingId: booking.id,
        amount: pricing.totalAmount,
      });
      clientSecret = paymentResult.clientSecret;
      paymentIntentId = paymentResult.paymentIntentId;
    } catch (paymentError: any) {
      console.error('[Bookings] PaymentIntent creation failed:', paymentError.message);
      // Booking still exists — client can retry payment
    }

    // Emit event
    eventBus.emitBookingEvent('booking.created', {
      bookingId: booking.id,
      customerId,
      providerId,
      data: { bookingNumber, totalAmount: pricing.totalAmount },
      timestamp: new Date(),
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        totalAmount: booking.totalAmount,
        scheduledStartTime: booking.scheduledStartTime,
      },
      clientSecret,
      paymentIntentId,
    });
  } catch (error: any) {
    console.error('[Bookings] POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}

// GET /api/bookings — List bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!customerId && !providerId) {
      return NextResponse.json({ error: 'customerId or providerId required' }, { status: 400 });
    }

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (providerId) where.providerId = providerId;
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { scheduledStartTime: 'desc' },
        take: limit,
        skip: offset,
        include: {
          service: { select: { name: true, category: true } },
          provider: { select: { businessName: true } },
          customer: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, limit, offset });
  } catch (error: any) {
    console.error('[Bookings] GET error:', error);
    return NextResponse.json({ error: 'Failed to list bookings' }, { status: 500 });
  }
}
