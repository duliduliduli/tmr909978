import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true
});

// Stripe Connect configuration
export const STRIPE_CONNECT_CONFIG = {
  application_fee_percentage: 8.5, // Platform takes 8.5%
  minimum_transfer_amount: 50, // Minimum $0.50 transfer
  payout_schedule: {
    interval: 'weekly',
    weekly_anchor: 'friday'
  },
  capabilities: [
    'card_payments',
    'transfers'
  ]
};

// Webhook endpoint secret
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.');
}

// Platform account configuration
export const PLATFORM_CONFIG = {
  business_name: 'Tumaro',
  support_email: 'support@tumaro.app',
  support_phone: '+1-555-TUMARO-1',
  terms_of_service: 'https://tumaro.app/terms',
  privacy_policy: 'https://tumaro.app/privacy'
};

// Payment configuration
export const PAYMENT_CONFIG = {
  currency: 'usd' as const,
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never' as const
  },
  capture_method: 'automatic' as const,
  confirmation_method: 'automatic' as const,
  setup_future_usage: 'off_session' as const // For repeat customers
};

// Supported countries for Stripe Connect
export const SUPPORTED_COUNTRIES = [
  'US', 'CA', 'GB', 'AU', 'NZ',
  'AT', 'BE', 'DK', 'FI', 'FR',
  'DE', 'IE', 'IT', 'LU', 'NL',
  'NO', 'PT', 'ES', 'SE', 'CH'
];

// Business type requirements
export const BUSINESS_TYPES = {
  individual: {
    required_fields: ['first_name', 'last_name', 'dob', 'ssn_last_4', 'address'],
    verification_requirements: ['identity_document']
  },
  company: {
    required_fields: ['company_name', 'tax_id', 'address', 'representative'],
    verification_requirements: ['business_registration', 'representative_identity']
  }
} as const;

// Error codes mapping
export const STRIPE_ERROR_CODES = {
  'account_already_exists': 'Provider already has a connected account',
  'account_country_invalid_address': 'Invalid address for selected country',
  'authentication_required': 'Additional authentication required',
  'card_declined': 'Payment method was declined',
  'insufficient_funds': 'Insufficient funds in account',
  'invalid_request_error': 'Invalid request parameters',
  'rate_limit_error': 'Too many requests, please try again later',
  'api_connection_error': 'Network error, please try again',
  'api_error': 'Stripe API error occurred',
  'idempotency_error': 'Duplicate request detected'
} as const;