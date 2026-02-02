import { z } from 'zod';

// ===== ENUMS =====
export const BookingStatus = {
  DRAFT: 'DRAFT',
  QUOTE_REQUESTED: 'QUOTE_REQUESTED', 
  QUOTE_PROVIDED: 'QUOTE_PROVIDED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CONFIRMED: 'CONFIRMED',
  PROVIDER_ASSIGNED: 'PROVIDER_ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW_CUSTOMER: 'NO_SHOW_CUSTOMER',
  NO_SHOW_PROVIDER: 'NO_SHOW_PROVIDER',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const CancelledBy = {
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER', 
  PLATFORM: 'PLATFORM'
} as const;

export type CancelledBy = typeof CancelledBy[keyof typeof CancelledBy];

export const DisputeStatus = {
  NONE: 'NONE',
  CUSTOMER_DISPUTE: 'CUSTOMER_DISPUTE',
  PROVIDER_DISPUTE: 'PROVIDER_DISPUTE',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED_CUSTOMER: 'RESOLVED_CUSTOMER',
  RESOLVED_PROVIDER: 'RESOLVED_PROVIDER',
  RESOLVED_PARTIAL: 'RESOLVED_PARTIAL'
} as const;

export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];

// ===== STATE MACHINE DEFINITIONS =====
export interface BookingEvent {
  type: string;
  data?: any;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface BookingStateContext {
  booking: {
    id: string;
    status: BookingStatus;
    customerId: string;
    providerId: string;
    serviceId: string;
    scheduledStartTime: Date;
    totalAmount: number;
    stripePaymentIntentId?: string;
  };
  user: {
    id: string;
    role: 'customer' | 'provider' | 'platform';
  };
}

// ===== VALIDATION SCHEMAS =====

// Address validation
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

// Vehicle info validation
export const VehicleInfoSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  size: z.enum(['compact', 'midsize', 'large', 'suv', 'truck']),
  licensePlate: z.string().optional(),
  specialNotes: z.string().max(500).optional()
});

// Create booking validation
export const CreateBookingSchema = z.object({
  serviceId: z.string().cuid(),
  scheduledStartTime: z.string().datetime(),
  serviceAddress: AddressSchema,
  vehicleInfo: VehicleInfoSchema,
  specialInstructions: z.string().max(1000).optional(),
  addOnServices: z.array(z.string()).optional(),
  promotionCode: z.string().optional()
});

// Update booking validation
export const UpdateBookingSchema = z.object({
  scheduledStartTime: z.string().datetime().optional(),
  vehicleInfo: VehicleInfoSchema.partial().optional(),
  specialInstructions: z.string().max(1000).optional(),
  addOnServices: z.array(z.string()).optional()
});

// Provider quote validation
export const ProviderQuoteSchema = z.object({
  baseAmount: z.number().positive(),
  addOnsAmount: z.number().nonnegative().optional(),
  totalAmount: z.number().positive(),
  estimatedDuration: z.number().positive(), // in minutes
  quote_notes: z.string().max(1000).optional(),
  expiresAt: z.string().datetime()
});

// Payment validation
export const ProcessPaymentSchema = z.object({
  paymentMethodId: z.string(),
  savePaymentMethod: z.boolean().default(false),
  tipAmount: z.number().nonnegative().optional()
});

// Cancellation validation  
export const CancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  notes: z.string().max(500).optional()
});

// Completion validation
export const CompleteBookingSchema = z.object({
  actualEndTime: z.string().datetime(),
  completionPhotos: z.array(z.string().url()).max(10),
  providerNotes: z.string().max(1000).optional(),
  customerSignature: z.string().url().optional()
});

// Review validation
export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
  qualityRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  professionalismRating: z.number().int().min(1).max(5).optional(),
  photos: z.array(z.string().url()).max(5).optional()
});

// ===== BUSINESS RULES =====

// Time slot validation
export const TimeSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  providerId: z.string().cuid()
}).refine(data => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time"
}).refine(data => {
  const start = new Date(data.startTime);
  const now = new Date();
  const minAdvanceHours = 2; // Minimum 2 hours advance booking
  const minAdvanceTime = new Date(now.getTime() + (minAdvanceHours * 60 * 60 * 1000));
  return start >= minAdvanceTime;
}, {
  message: "Booking must be at least 2 hours in advance"
});

// Service area validation
export const ServiceAreaSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  providerId: z.string().cuid()
});

// Pricing calculation
export interface PricingCalculation {
  baseAmount: number;
  addOnsAmount: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  providerAmount: number;
}

export const PricingCalculationSchema = z.object({
  baseAmount: z.number().positive(),
  addOnsAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  platformFee: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  providerAmount: z.number().positive()
});

// ===== ERROR TYPES =====
export class BookingValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'BookingValidationError';
  }
}

export class BookingStateError extends Error {
  constructor(
    message: string,
    public currentState: BookingStatus,
    public attemptedAction: string
  ) {
    super(message);
    this.name = 'BookingStateError';
  }
}

export class BookingConflictError extends Error {
  constructor(
    message: string,
    public conflictType: 'time_slot' | 'provider_availability' | 'service_area'
  ) {
    super(message);
    this.name = 'BookingConflictError';
  }
}