# Tumaro Booking System Documentation

## 🚀 Overview

The Tumaro booking system is an enterprise-grade, Uber-like booking platform for mobile vehicle detailing services. It provides a complete end-to-end solution for customers to book services, providers to manage appointments, and the platform to process payments and handle disputes.

## ✨ Features

### Core Features
- **Real-time booking management** with state machine-driven workflows
- **Stripe Connect marketplace payments** with automatic splitting
- **GPS-powered service area validation** and routing
- **Conflict-free scheduling** with provider availability management
- **Real-time notifications** via email, SMS, and push
- **Comprehensive analytics** and reporting
- **Review and rating system** for quality assurance
- **Dispute resolution** with automated refund processing

### Technical Highlights
- **Type-safe** with TypeScript throughout
- **Event-driven architecture** with webhooks and notifications
- **Scalable database design** with Prisma ORM
- **Comprehensive validation** and error handling
- **Automated testing suite** for reliability
- **Mobile-responsive UI** with modern React components

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer UI   │    │   Provider UI   │    │   Admin Panel   │
│                 │    │                 │    │                 │
│ • Booking Flow  │    │ • Dashboard     │    │ • Analytics     │
│ • Schedule      │    │ • Availability  │    │ • Disputes      │
│ • Payment       │    │ • Earnings      │    │ • Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              API Layer                        │
         │                                               │
         │ • Booking Routes      • Payment Routes        │
         │ • Availability API    • Webhook Handlers      │
         │ • Notification API    • Analytics API         │
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │           Business Logic Layer                │
         │                                               │
         │ • State Machine      • Event Bus              │
         │ • Validators        • Notification Service    │
         │ • Pricing Engine    • Analytics Engine        │
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │            Data Layer                         │
         │                                               │
         │ • PostgreSQL        • Stripe Connect          │
         │ • Prisma ORM        • External APIs           │
         │ • Redis Cache       • File Storage            │
         └───────────────────────────────────────────────┘
```

## 📊 Database Schema

### Core Models

**Users & Profiles**
- `User` - Base user account (customers and providers)
- `CustomerProfile` - Customer-specific data and preferences
- `ProviderProfile` - Business details, service areas, Stripe info

**Services & Availability**  
- `Service` - Service offerings with pricing and duration
- `AvailabilityRule` - Provider schedule and capacity rules
- `ServiceArea` - Geographic service boundaries

**Bookings & Events**
- `Booking` - Core booking entity with status tracking
- `BookingEvent` - Append-only audit log for all state changes
- `Review` - Customer feedback and ratings

**Payments & Analytics**
- `PromotionCode` - Discount codes and campaigns
- `BookingAnalytics` - Daily aggregated metrics

## 🔄 Booking State Machine

The booking system uses a strict state machine to ensure data consistency and proper workflows:

```
DRAFT ──────────────── PENDING_PAYMENT ──────────── CONFIRMED
  │                           │                         │
  │                     PAYMENT_FAILED                  │
  │                           │                         │
  └── QUOTE_REQUESTED ── QUOTE_PROVIDED ────────────────┘
              │               │
              └─── CANCELLED ─┘
                      ▲
                      │
            PROVIDER_ASSIGNED ──── IN_PROGRESS ──── COMPLETED
                      │                  │              │
                      └── NO_SHOW_* ─────┴──── DISPUTED─┘
                                              │
                                         REFUNDED
```

## 💳 Payment Processing

### Stripe Connect Integration
- **Express accounts** for quick provider onboarding
- **Automatic fee collection** (8.5% platform fee)
- **Split payments** with instant provider payouts
- **Marketplace compliance** with proper tax handling

### Payment Flow
1. Customer creates booking → `DRAFT`
2. Payment intent created → `PENDING_PAYMENT`  
3. Payment processed → `CONFIRMED`
4. Funds held until service completion
5. Automatic transfer to provider → `COMPLETED`

## 📧 Notification System

### Channels
- **Email** - Confirmations, receipts, important updates
- **SMS** - Time-sensitive notifications and reminders  
- **Push** - Real-time status updates
- **In-app** - Dashboard notifications and alerts

### Event Triggers
- Booking confirmed/cancelled
- Payment succeeded/failed
- Service started/completed
- Reviews received
- Reminders and follow-ups

## 🔧 Setup Instructions

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
Redis (optional, for caching)
```

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tumaro_db"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed test data (optional)
npx prisma db seed

# Run development server
npm run dev
```

### Stripe Setup
1. Create Stripe account and get API keys
2. Enable Stripe Connect with Express accounts
3. Configure webhook endpoints:
   - `POST /api/webhooks/stripe`
4. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## 🧪 Testing

### Run Test Suite
```bash
# Full booking system test
npm run test:booking-system

# Individual test categories
npm run test:validation
npm run test:payments
npm run test:state-machine
```

### Test Coverage
- ✅ Booking creation and validation
- ✅ State machine transitions
- ✅ Payment processing with Stripe
- ✅ Availability conflict detection
- ✅ Event system and notifications
- ✅ Webhook signature verification
- ✅ Analytics and reporting

## 📱 API Reference

### Booking Endpoints

**Create Booking**
```
POST /api/bookings
{
  "serviceId": "string",
  "scheduledStartTime": "2024-01-01T10:00:00Z",
  "serviceAddress": {...},
  "vehicleInfo": {...}
}
```

**Get Bookings**
```
GET /api/bookings?customerId=xxx&status=CONFIRMED&limit=10
```

**Update Booking**
```
PUT /api/bookings/{id}
{
  "scheduledStartTime": "2024-01-01T11:00:00Z"
}
```

**Booking Actions**
```
POST /api/bookings/{id}/actions
{
  "action": "provider_accept",
  "userId": "provider-id",
  "userRole": "provider"
}
```

### Availability Endpoints

**Get Available Slots**
```
GET /api/availability?providerId=xxx&date=2024-01-01&serviceDuration=120
```

**Check Time Slot**
```
POST /api/availability
{
  "providerId": "string",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z"
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Configure production Stripe keys
- [ ] Set up PostgreSQL with connection pooling
- [ ] Configure email/SMS providers
- [ ] Set up monitoring and logging
- [ ] Configure webhook endpoints
- [ ] Test payment flows end-to-end
- [ ] Set up backup and disaster recovery

### Environment Variables (Production)
```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📈 Monitoring & Analytics

### Key Metrics
- **Booking conversion rate** - Draft to confirmed bookings
- **Payment success rate** - Payment processing reliability  
- **Provider response time** - Average acceptance time
- **Customer satisfaction** - Review ratings and completion rate
- **Revenue metrics** - GMV, platform fees, provider earnings

### Monitoring Tools
- Database performance monitoring
- Stripe payment analytics
- Error tracking and logging
- Uptime monitoring
- Webhook delivery monitoring

## 🤝 Support

### Provider Onboarding
1. Create provider account
2. Complete Stripe Connect onboarding
3. Set availability rules
4. Add service offerings
5. Start receiving bookings

### Customer Support
- In-app messaging system
- Automated refund processing
- Dispute resolution workflows
- 24/7 phone/email support

## 🔮 Future Enhancements

### Planned Features
- **Multi-language support** for international expansion
- **Advanced scheduling** with recurring bookings
- **Fleet management** for enterprise providers
- **AI-powered pricing** optimization
- **Voice assistant integration** for hands-free booking
- **Augmented reality** for service visualization

### Technical Roadmap
- **Microservices architecture** for scale
- **Real-time tracking** with WebSocket connections
- **Advanced caching** with Redis clusters
- **ML-based fraud detection** and prevention
- **GraphQL API** for flexible data fetching

---

**Built with ❤️ by the Tumaro Team**

For questions or support, contact: [support@tumaro.app](mailto:support@tumaro.app)