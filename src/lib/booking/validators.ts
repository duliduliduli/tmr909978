import { 
  CreateBookingSchema,
  UpdateBookingSchema,
  TimeSlotSchema,
  ServiceAreaSchema,
  BookingValidationError,
  BookingConflictError 
} from './types';
import { prisma } from '@/lib/prisma';

// ===== VALIDATION UTILITIES =====

/**
 * Validate booking creation data
 */
export async function validateCreateBooking(data: any) {
  try {
    const validated = CreateBookingSchema.parse(data);
    
    // Additional business validations
    await validateTimeSlot({
      startTime: validated.scheduledStartTime,
      endTime: new Date(
        new Date(validated.scheduledStartTime).getTime() + (2 * 60 * 60 * 1000) // 2 hours default
      ).toISOString(),
      providerId: data.providerId
    });

    await validateServiceArea({
      latitude: validated.serviceAddress.latitude,
      longitude: validated.serviceAddress.longitude,
      providerId: data.providerId
    });

    return validated;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      throw new BookingValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

/**
 * Validate booking update data
 */
export async function validateUpdateBooking(bookingId: string, data: any) {
  try {
    const validated = UpdateBookingSchema.parse(data);

    // Check if booking exists and is in valid state for updates
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true }
    });

    if (!booking) {
      throw new BookingValidationError('Booking not found', 'bookingId');
    }

    // Only allow updates for draft/confirmed bookings
    const updatableStates = ['DRAFT', 'CONFIRMED', 'PROVIDER_ASSIGNED'];
    if (!updatableStates.includes(booking.status)) {
      throw new BookingValidationError(
        `Cannot update booking in ${booking.status} state`,
        'status'
      );
    }

    // If updating time, validate the new slot
    if (validated.scheduledStartTime) {
      await validateTimeSlot({
        startTime: validated.scheduledStartTime,
        endTime: new Date(
          new Date(validated.scheduledStartTime).getTime() + (2 * 60 * 60 * 1000)
        ).toISOString(),
        providerId: booking.providerId
      });
    }

    return validated;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      throw new BookingValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

/**
 * Validate time slot availability
 */
export async function validateTimeSlot(data: any) {
  try {
    const validated = TimeSlotSchema.parse(data);
    const { startTime, endTime, providerId } = validated;

    // Check provider availability rules
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Get day of week (0 = Sunday)
    const dayOfWeek = start.getDay();
    const timeString = start.toTimeString().slice(0, 5); // "HH:MM"

    // Check if provider has availability rules for this day/time
    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        providerId,
        isActive: true,
        OR: [
          // Weekly recurring rules
          {
            ruleType: 'WEEKLY_RECURRING',
            dayOfWeek: dayOfWeek,
            startTime: { lte: timeString },
            endTime: { gte: timeString }
          },
          // Specific date rules
          {
            ruleType: 'SPECIFIC_DATE',
            startDate: { lte: start },
            endDate: { gte: start }
          }
        ]
      }
    });

    // Check for blackout dates
    const blackoutRules = await prisma.availabilityRule.findMany({
      where: {
        providerId,
        isActive: true,
        ruleType: 'BLACKOUT_DATE',
        startDate: { lte: end },
        endDate: { gte: start }
      }
    });

    if (blackoutRules.length > 0) {
      throw new BookingConflictError(
        'Provider is not available during this time period',
        'provider_availability'
      );
    }

    if (availabilityRules.length === 0) {
      throw new BookingConflictError(
        'Provider has no availability during this time',
        'provider_availability'
      );
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: {
          in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS']
        },
        OR: [
          {
            scheduledStartTime: { lt: end },
            scheduledEndTime: { gt: start }
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      throw new BookingConflictError(
        'Time slot conflicts with existing booking',
        'time_slot'
      );
    }

    // Check maximum concurrent bookings
    const availabilityRule = availabilityRules[0];
    if (availabilityRule.maxConcurrent > 1) {
      const concurrentBookings = await prisma.booking.count({
        where: {
          providerId,
          status: {
            in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS']
          },
          scheduledStartTime: { lt: end },
          scheduledEndTime: { gt: start }
        }
      });

      if (concurrentBookings >= availabilityRule.maxConcurrent) {
        throw new BookingConflictError(
          'Maximum concurrent bookings reached for this time slot',
          'time_slot'
        );
      }
    }

    return true;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      throw new BookingValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

/**
 * Validate service area coverage
 */
export async function validateServiceArea(data: any) {
  try {
    const validated = ServiceAreaSchema.parse(data);
    const { latitude, longitude, providerId } = validated;

    // Get provider's service area settings
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: {
        serviceRadius: true,
        baseLatitude: true,
        baseLongitude: true,
        serviceCities: true
      }
    });

    if (!provider) {
      throw new BookingValidationError('Provider not found', 'providerId');
    }

    if (!provider.baseLatitude || !provider.baseLongitude) {
      throw new BookingConflictError(
        'Provider has not set up service area',
        'service_area'
      );
    }

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      provider.baseLatitude,
      provider.baseLongitude,
      latitude,
      longitude
    );

    if (distance > provider.serviceRadius) {
      throw new BookingConflictError(
        `Location is ${distance.toFixed(1)} miles away, but provider only services within ${provider.serviceRadius} miles`,
        'service_area'
      );
    }

    return true;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      throw new BookingValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

/**
 * Calculate distance between two coordinates in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number, 
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate provider capacity for given time period
 */
export async function validateProviderCapacity(
  providerId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const dayOfWeek = startTime.getDay();
  const timeString = startTime.toTimeString().slice(0, 5);

  // Get availability rules
  const availabilityRules = await prisma.availabilityRule.findMany({
    where: {
      providerId,
      isActive: true,
      OR: [
        {
          ruleType: 'WEEKLY_RECURRING',
          dayOfWeek,
          startTime: { lte: timeString },
          endTime: { gte: timeString }
        }
      ]
    }
  });

  if (availabilityRules.length === 0) {
    return false;
  }

  const rule = availabilityRules[0];
  
  // Count concurrent bookings
  const concurrentCount = await prisma.booking.count({
    where: {
      providerId,
      status: {
        in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS']
      },
      scheduledStartTime: { lt: endTime },
      scheduledEndTime: { gt: startTime }
    }
  });

  return concurrentCount < rule.maxConcurrent;
}

/**
 * Get available time slots for a provider on a given date
 */
export async function getAvailableTimeSlots(
  providerId: string,
  date: Date,
  serviceDuration: number = 120 // minutes
): Promise<{ startTime: Date; endTime: Date }[]> {
  const dayOfWeek = date.getDay();
  
  // Get availability rules for this day
  const availabilityRules = await prisma.availabilityRule.findMany({
    where: {
      providerId,
      isActive: true,
      ruleType: 'WEEKLY_RECURRING',
      dayOfWeek
    },
    orderBy: { startTime: 'asc' }
  });

  if (availabilityRules.length === 0) {
    return [];
  }

  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: {
        in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS']
      },
      scheduledStartTime: {
        gte: startOfDay,
        lt: endOfDay
      }
    },
    orderBy: { scheduledStartTime: 'asc' }
  });

  const availableSlots: { startTime: Date; endTime: Date }[] = [];

  for (const rule of availabilityRules) {
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);
    
    const ruleStart = new Date(date);
    ruleStart.setHours(startHour, startMin, 0, 0);
    
    const ruleEnd = new Date(date);
    ruleEnd.setHours(endHour, endMin, 0, 0);

    // Generate slots within this availability window
    let currentTime = new Date(ruleStart);
    
    while (currentTime.getTime() + (serviceDuration * 60 * 1000) <= ruleEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60 * 1000));
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        return (
          currentTime < booking.scheduledEndTime &&
          slotEnd > booking.scheduledStartTime
        );
      });

      if (!hasConflict && currentTime > new Date()) { // Only future slots
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd)
        });
      }

      // Move to next slot (15-minute intervals)
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }
  }

  return availableSlots;
}