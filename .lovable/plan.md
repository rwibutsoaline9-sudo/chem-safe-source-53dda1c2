
## Stripe Payment System - Implementation Plan

This is a large system. I'll build it in phases:

### Phase 1: Enable Stripe & Database Schema
- Enable Lovable's Stripe integration (collects your secret key securely)
- Create new tables: `subscriptions`, `audit_logs`
- Extend existing `payment_settings` table with webhook secret & mode toggle
- Add `fraud_flag` and `ip_address` columns to existing `orders`/`transactions` tables

### Phase 2: Admin Panel - Stripe Settings Page
- Build Settings tab with: Publishable Key, Webhook Secret, Test/Live mode toggle
- Enable/disable payment methods, one-time vs subscription toggles
- All configurable from UI without code changes

### Phase 3: Edge Functions (Backend)
- `create-payment-intent` - generates Stripe PaymentIntent server-side with metadata
- `stripe-webhook` - verifies Stripe signature, updates payment status, logs events
- `process-refund` - admin-triggered refunds via Stripe API
- `fraud-check` - internal fraud scoring (IP frequency, failed attempts)

### Phase 4: Admin Dashboard - Payments & Analytics
- Real-time transaction feed with status filters
- Revenue charts (daily/weekly/monthly) using Recharts
- Fraud alerts panel
- Refund management UI
- Audit log viewer

### Phase 5: Frontend Checkout
- Stripe Elements checkout flow
- Payment verification page ("Verifying..." → "Confirmed")
- Subscription plan selection UI

### Phase 6: Security Hardening
- Rate limiting in edge functions
- JWT auth validation on all endpoints
- Audit logging for every admin action
- Stripe signature verification on webhooks

### Important Notes
- Stripe secret key will be stored as a Supabase secret (NOT in the database)
- The publishable key can be stored in `payment_settings` since it's public
- Webhook secret stored as a Supabase secret
- All payment verification happens server-side only

### Order of execution
1. Enable Stripe integration → 2. DB migration → 3. Edge functions → 4. Admin UI → 5. Frontend checkout → 6. Polish
