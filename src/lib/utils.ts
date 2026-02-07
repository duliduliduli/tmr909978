import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Format address for display
export function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

// Validate US ZIP code
export function isValidZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

// Calculate distance between two coordinates (in miles)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in miles
  return Math.round(d * 10) / 10;
}

// Appointment reliability configuration
export const APPOINTMENT_CONFIG = {
  ARRIVAL_RADIUS_MILES: 0.1,         // ~500 feet for arrival detection
  LOCATION_UPDATE_INTERVAL: 30000,   // 30 seconds
  MISSED_GRACE_MINUTES: 5,           // Grace period after scheduled time
  MISSED_CHECK_INTERVAL: 60000,      // 1 minute
  MAX_RESCHEDULES: 3,                // Hard limit per appointment
};

// Check if detailer is within arrival radius of appointment location
export function isWithinArrivalRadius(
  detailerLat: number,
  detailerLng: number,
  appointmentLat: number,
  appointmentLng: number
): boolean {
  const distance = calculateDistance(detailerLat, detailerLng, appointmentLat, appointmentLng);
  return distance <= APPOINTMENT_CONFIG.ARRIVAL_RADIUS_MILES;
}

// Parse appointment date and time into a Date object
export function parseAppointmentDateTime(scheduledDate: string, scheduledTime: string): Date {
  // scheduledTime format: "10:00 AM" or "2:30 PM"
  const [time, meridiem] = scheduledTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let hour24 = hours;
  if (meridiem === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hour24 = 0;
  }

  const [year, month, day] = scheduledDate.split('-').map(Number);
  return new Date(year, month - 1, day, hour24, minutes);
}

// Check if an appointment time has passed (with grace period)
export function isAppointmentOverdue(
  scheduledDate: string,
  scheduledTime: string,
  graceMinutes: number = APPOINTMENT_CONFIG.MISSED_GRACE_MINUTES
): boolean {
  const appointmentTime = parseAppointmentDateTime(scheduledDate, scheduledTime);
  const graceEndTime = new Date(appointmentTime.getTime() + graceMinutes * 60 * 1000);
  return new Date() > graceEndTime;
}