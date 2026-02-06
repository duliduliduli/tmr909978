import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    if (!providerId || !dateStr) {
      return NextResponse.json(
        { error: 'Provider ID and date are required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    const dayOfWeek = requestedDate.getDay();

    // For mock/testing: generate realistic time slots
    // Providers are available Mon-Sat, closed Sunday
    if (dayOfWeek === 0) {
      return NextResponse.json({
        availableSlots: [],
        message: 'Provider is not available on Sundays',
      });
    }

    const serviceDuration = 60; // 1 hour default

    // Business hours: 8 AM - 6 PM (weekdays), 9 AM - 5 PM (Saturday)
    const startHour = dayOfWeek === 6 ? 9 : 8;
    const endHour = dayOfWeek === 6 ? 17 : 18;

    const availableSlots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals

    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes + serviceDuration <= endMinutes) {
      const slotStart = new Date(requestedDate);
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + serviceDuration);

      const isFutureSlot = slotStart >= minBookingTime;

      // Simulate some slots being taken (every 3rd slot on busy days)
      const slotIndex = (currentMinutes - startHour * 60) / slotInterval;
      const isBusy = dayOfWeek >= 1 && dayOfWeek <= 5 && (slotIndex % 5 === 2);

      if (isFutureSlot && !isBusy) {
        availableSlots.push({
          startTime: formatTime(slotStart),
          endTime: formatTime(slotEnd),
          duration: serviceDuration,
          available: true,
        });
      }

      currentMinutes += slotInterval;
    }

    return NextResponse.json({
      availableSlots,
      providerSchedule: {
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        dayOfWeek,
      },
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// Helper function to format Date to "HH:MM" string
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
