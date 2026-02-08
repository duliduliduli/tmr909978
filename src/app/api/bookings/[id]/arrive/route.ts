import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';
import { eventBus } from '@/lib/events/eventBus';
import { calculateDistance } from '@/lib/utils';

// POST /api/bookings/[id]/arrive — Provider marks arrival
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
    const { providerId, latitude, longitude } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'providerId required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.providerId !== providerId) {
      return NextResponse.json({ error: 'Not authorized — wrong provider' }, { status: 403 });
    }

    // Accept arrival from CONFIRMED or PROVIDER_ASSIGNED status
    if (!['CONFIRMED', 'PROVIDER_ASSIGNED'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot mark arrived from ${booking.status} status` },
        { status: 400 }
      );
    }

    // Optional geo-validation (300m ~ 0.19 miles)
    if (latitude && longitude) {
      const distance = calculateDistance(
        latitude, longitude,
        booking.serviceLatitude, booking.serviceLongitude
      );
      if (distance > 0.5) { // Allow up to 0.5 miles — GPS can be inaccurate
        console.warn(`[Arrive] Provider ${providerId} is ${distance.toFixed(2)} miles from service address`);
      }
    }

    // Update booking
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'IN_PROGRESS',
        currentState: 'IN_PROGRESS',
        actualStartTime: new Date(),
        providerArrivedAt: new Date(),
      },
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: params.id,
        eventType: 'START_SERVICE',
        fromStatus: booking.status,
        toStatus: 'IN_PROGRESS',
        triggeredBy: providerId,
        metadata: latitude && longitude ? { latitude, longitude } : undefined,
      },
    });

    eventBus.emitBookingEvent('booking.started', {
      bookingId: params.id,
      providerId,
      customerId: booking.customerId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      booking: { id: params.id, status: 'IN_PROGRESS', providerArrivedAt: new Date() },
    });
  } catch (error: any) {
    console.error('[Arrive] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark arrival' }, { status: 500 });
  }
}
