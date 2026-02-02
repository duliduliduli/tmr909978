# 🚀 Tumaro - Deployment Guide

## Production Deployment to Vercel

This guide walks you through deploying the Tumaro enterprise booking system to production.

### 🔧 Prerequisites

1. **GitHub Repository**: https://github.com/dulimedia/tumaro.git
2. **Vercel Account**: Connected to GitHub
3. **Database**: PostgreSQL (Neon, Supabase, or Railway)
4. **Stripe Account**: Live keys for production payments

### 🗄️ Database Setup

#### Option 1: Neon (Recommended)
```bash
1. Sign up at https://neon.tech
2. Create a new project: "tumaro-production"
3. Copy the connection string
4. Add to Vercel environment variables
```

#### Option 2: Supabase
```bash
1. Sign up at https://supabase.com
2. Create new project: "tumaro"
3. Go to Settings > Database
4. Copy PostgreSQL connection string
```

### 💳 Stripe Configuration

#### Live Keys Setup
```bash
1. Go to https://dashboard.stripe.com
2. Switch to Live mode
3. Get your live keys:
   - STRIPE_SECRET_KEY (sk_live_...)
   - STRIPE_PUBLISHABLE_KEY (pk_live_...)
4. Set up webhook endpoint:
   - URL: https://your-domain.vercel.app/api/webhooks/stripe
   - Events: payment_intent.*, account.updated, transfer.*
```

### 📱 Vercel Deployment

#### Step 1: Connect Repository
```bash
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub: dulimedia/tumaro
4. Framework: Next.js (auto-detected)
```

#### Step 2: Environment Variables
Add these to Vercel dashboard:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mapbox (already configured)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoidHVtYXJvODE4IiwiYSI6ImNta3l6d3l1cTBjbW0zZW4zZnAxbzd2MWQifQ.yyaiO5WYydgM5fjn6sNoSA"
NEXT_PUBLIC_MAPBOX_STYLE="mapbox://styles/mapbox/navigation-night-v1"

# App Configuration  
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Optional: Email/SMS
SENDGRID_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
```

#### Step 3: Deploy
```bash
1. Click "Deploy"
2. Wait for build to complete
3. Visit your live site!
```

### 🗃️ Database Migration

After deployment, initialize the database:

```bash
# In Vercel Functions or local with production DB
npx prisma db push
```

### 🔗 Custom Domain (Optional)

#### Add Custom Domain
```bash
1. In Vercel dashboard > Settings > Domains
2. Add your domain: tumaro.app
3. Configure DNS records as shown
4. Update NEXT_PUBLIC_APP_URL and NEXTAUTH_URL
```

### 🧪 Production Testing

#### Health Check Endpoints
```bash
✅ Homepage: https://your-domain.vercel.app
✅ API Health: https://your-domain.vercel.app/api/map/detailers
✅ Booking Test: https://your-domain.vercel.app/test-booking
```

#### Test Booking Flow
```bash
1. Complete customer booking journey
2. Test Stripe payment (use test cards first)
3. Verify provider dashboard
4. Check webhook delivery
```

### 📊 Post-Deployment Setup

#### 1. Stripe Webhook Verification
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/stripe \
  -H "Stripe-Signature: test" \
  -d "{}"
```

#### 2. Database Seeding (Optional)
```bash
# Add sample data for testing
npx prisma db seed
```

#### 3. Analytics Setup
```bash
# Add Google Analytics, Mixpanel, etc.
# Configure in environment variables
```

### 🚨 Security Checklist

- ✅ **Environment Variables**: All secrets in Vercel environment
- ✅ **Stripe Live Keys**: Only in production environment
- ✅ **Database**: Connection string secure and encrypted
- ✅ **CORS**: API endpoints properly configured
- ✅ **Authentication**: NEXTAUTH_SECRET set securely

### 📞 Support & Monitoring

#### Error Monitoring
- **Vercel**: Built-in error tracking
- **Sentry**: Add for comprehensive error monitoring
- **Logs**: View in Vercel Functions tab

#### Performance Monitoring
- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: Monitored automatically

### 🔄 Continuous Deployment

Every push to `main` branch automatically deploys to production:

```bash
git push origin main
# → Automatic deployment to Vercel
# → Database migrations run automatically
# → New version live in 2-3 minutes
```

### 🎯 Success Metrics

After deployment, monitor these KPIs:

- **Booking Conversion Rate**: Draft → Completed
- **Payment Success Rate**: Stripe payment completion
- **User Engagement**: Session duration and pages/session
- **Performance**: Page load times and Core Web Vitals

---

**🎉 Your enterprise booking system is now live in production!**

Visit your live site and start processing real bookings with the full Uber-like experience.