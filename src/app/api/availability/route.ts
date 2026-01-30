import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!providerId || !dateStr) {
      return NextResponse.json(
        { error: 'Provider ID and date are required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(dateStr);
    const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get provider's availability rules
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        availabilityRules: true,
        services: serviceId ? { where: { id: serviceId } } : true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get service duration (default to 2 hours if not specified)
    let serviceDuration = 120; // minutes
    if (serviceId && provider.services.length > 0) {
      const service = Array.isArray(provider.services) 
        ? provider.services[0] 
        : provider.services;
      serviceDuration = service.estimatedDuration || 120;
    }

    // Find availability rule for this day
    const availabilityRule = provider.availabilityRules.find(
      rule => rule.dayOfWeek === dayOfWeek && rule.isAvailable
    );

    if (!availabilityRule) {
      return NextResponse.json({
        availableSlots: [],
        message: 'Provider is not available on this day',
      });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        providerId,
        scheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      select: {
        scheduledFor: true,
        estimatedDuration: true,
      },
    });

    // Generate available time slots
    const availableSlots: TimeSlot[] = [];
    const startTime = parseTimeString(availabilityRule.startTime);
    const endTime = parseTimeString(availabilityRule.endTime);

    // Generate slots in 30-minute intervals
    const slotInterval = 30; // minutes
    let currentTime = startTime;

    while (currentTime + serviceDuration <= endTime) {
      const slotStart = new Date(requestedDate);
      slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + serviceDuration);

      // Check if this slot conflicts with existing bookings
      const isAvailable = !existingBookings.some(booking => {
        const bookingStart = new Date(booking.scheduledFor);
        const bookingEnd = new Date(bookingStart);
        bookingEnd.setMinutes(bookingStart.getMinutes() + (booking.estimatedDuration || 120));

        // Check for overlap
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });

      // Check if slot is in the future (at least 2 hours from now)
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const isFutureSlot = slotStart >= minBookingTime;

      availableSlots.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        duration: serviceDuration,
        available: isAvailable && isFutureSlot,
      });

      currentTime += slotInterval;
    }

    return NextResponse.json({
      availableSlots: availableSlots.filter(slot => slot.available),
      allSlots: availableSlots, // Include all slots for debugging
      providerSchedule: {
        startTime: availabilityRule.startTime,
        endTime: availabilityRule.endTime,
        dayOfWeek,
      },
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to parse time string "HH:MM" to minutes since midnight
function parseTimeString(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to format Date to "HH:MM" string
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}