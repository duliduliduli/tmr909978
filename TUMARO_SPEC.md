# Tumaro Spec (Source of Truth)

## Product
Tumaro is a privacy-first, map-based booking platform for mobile services.
We start with mobile detailers but architecture supports other mobile services later.

## Roles

### Customer
- Can browse providers on map
- Can view provider profile + portfolio + ratings
- Can book appointments
- Has Appointments tab:
  - Upcoming appointments
  - Past appointments (historical)
- Can message provider for a booking
- Can leave reviews ONLY after completion
- Has wallet/coins, account settings

### Detailer (Business)
- Has more functions than customer:
  - Services + pricing + durations
  - Availability rules + time off
  - Booking operations (start/complete/cancel/no-show)
  - Portfolio photos + profile visibility
  - Coins program (create/configure coin, earning/redemption, promotions)
  - "Day plan": schedule + route for the day from confirmed appointments
  - Earnings/finances dashboard
  - Messaging to clients (1:1 now, mass messaging later)

## App Routes (WebApp)

### Customer:
- /customer/home
- /customer/map
- /customer/appointments
- /customer/wallet
- /customer/account
- /customer/help

### Detailer:
- /detailer/dashboard
- /detailer/map
- /detailer/appointments
- /detailer/wallet (coins + payouts)
- /detailer/account (business settings)
- /detailer/help

## Map Requirements
- Mapbox (not MapLibre)
- Must snap/center to customer location (high accuracy)
- Custom styled map (no "Google maps feel")
- Custom zoom controls + "center on me" button
- Show detailers as GPU-rendered layers (not DOM markers)
- Provider location privacy: optional obfuscation bubble
- Later: route ETA + route line between appointments

## Booking Requirements (MVP)
- Upfront pay to confirm booking (Stripe)
- Booking states + audit trail
- Prevent double-booking
- Customer can cancel within policy windows
- Provider no-show/cancel creates strikes

## Tech Stack Locked
- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Prisma + PostgreSQL
- Stripe + Stripe Connect
- Mapbox GL / react-map-gl

## No-Gos
- No random package installs
- No "rewrite entire architecture"
- No mixing map providers

## Current Implementation Status

### ✅ Completed Features
- Landing page with dual portal navigation
- App routing structure (/customer/* and /detailer/*)
- Global state management (Zustand with persistence)
- Appointments management system
- Business coin loyalty program
- Comprehensive database schema (Prisma)
- SF Pro font system implementation
- Responsive navigation (mobile/desktop)

### 🔶 Partially Implemented
- Map integration (basic implementation, needs GPU layers)
- Booking wizard (frontend complete, needs backend integration)
- Payment processing (Stripe setup, needs live integration)
- Mock data system (development ready, needs real data)

### ⏳ Next Priorities
1. Mapbox map reliability with GPU layers
2. Authentication system
3. Real-time booking notifications
4. Provider portfolio management
5. Day plan routing system

## Design System

### Typography
- Font Family: SF Pro Display/Text (-apple-system fallback)
- Scale: Responsive typography with consistent hierarchy
- Mobile-optimized line heights

### Color Palette
```
brand: {
  950: '#020617', // Very dark background
  900: '#0f172a', // Main background
  800: '#1e293b', // Cards / Secondary
  700: '#334155', // Borders
  600: '#475569', // Muted text
  500: '#64748b', // Secondary text
  400: '#94a3b8', // Placeholder text
  300: '#cbd5e1', // Light borders
  200: '#e2e8f0', // Very light borders
  100: '#f1f5f9', // Light background
  50: '#f8fafc'   // Lightest background
}

accent: {
  DEFAULT: '#38bdf8', // Sky 400 - Primary Action
  hover: '#0ea5e9',   // Sky 500
  light: '#7dd3fc',   // Sky 300
  dark: '#0284c7'     // Sky 600
}
```

### Component Patterns
- Glassmorphism cards with backdrop-blur
- Consistent border radius (rounded-xl, rounded-2xl)
- Hover animations with Framer Motion
- Touch-optimized interaction areas (44px minimum)

## Business Logic Rules

### Booking State Machine
```
DRAFT → PENDING_PAYMENT → CONFIRMED → IN_PROGRESS → COMPLETED
  ↓           ↓              ↓            ↓
CANCELLED   CANCELLED    CANCELLED   CANCELLED
```

### Coin System Rules
- Business-specific coin branding
- Configurable earning rates (per dollar spent)
- Minimum redemption thresholds
- Expiration policies (configurable)
- Transaction audit trail

### Location Privacy
- Customer precise location visible only after confirmed booking
- Provider location obfuscation with configurable radius
- GPS tracking only during active appointments

## API Structure

### Customer Endpoints
- `GET /api/customer/profile` - Customer profile data
- `GET /api/customer/appointments` - Upcoming and past bookings
- `GET /api/customer/coins/balance` - Coin balances across businesses
- `POST /api/customer/bookings` - Create new booking

### Detailer Endpoints  
- `GET /api/detailer/dashboard` - Business metrics and today's schedule
- `GET /api/detailer/bookings` - Manage incoming booking requests
- `POST /api/detailer/coins/configure` - Configure business coin program
- `GET /api/detailer/route` - Generate optimized daily route

### Map Endpoints
- `GET /api/map/detailers` - GeoJSON of available providers
- `GET /api/map/areas` - Service area boundaries

## Security Requirements
- No credentials in client-side code
- Rate limiting on booking endpoints
- Input validation with Zod schemas
- Audit logging for financial transactions
- Encrypted storage for sensitive data

## Performance Requirements
- Map loads within 3 seconds
- Location snap within 2 seconds (or fallback)
- Smooth 60fps animations on mobile
- Offline capability for appointment viewing
- Progressive loading for large provider datasets