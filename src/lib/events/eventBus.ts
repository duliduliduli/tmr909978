import { EventEmitter } from 'events';
import { NotificationService } from './notificationService';
import { prisma } from '@/lib/prisma';

// ===== EVENT TYPES =====

export type BookingEvent =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.provider_assigned'
  | 'booking.started'
  | 'booking.completed'
  | 'booking.disputed'
  | 'booking.customer_confirmed'
  | 'booking.auto_confirmed'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payout.released'
  | 'payout.blocked'
  | 'payout.failed'
  | 'quote.requested'
  | 'quote.provided'
  | 'review.created';

export interface EventPayload {
  bookingId?: string;
  userId?: string;
  providerId?: string;
  customerId?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

// ===== EVENT BUS SINGLETON =====

class BookingEventBus extends EventEmitter {
  private static instance: BookingEventBus;

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  static getInstance(): BookingEventBus {
    if (!BookingEventBus.instance) {
      BookingEventBus.instance = new BookingEventBus();
    }
    return BookingEventBus.instance;
  }

  /**
   * Emit a booking-related event
   */
  emitBookingEvent(event: BookingEvent, payload: EventPayload) {
    this.emit(event, payload);
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers() {
    // Booking lifecycle events
    this.on('booking.created', this.handleBookingCreated.bind(this));
    this.on('booking.confirmed', this.handleBookingConfirmed.bind(this));
    this.on('booking.cancelled', this.handleBookingCancelled.bind(this));
    this.on('booking.provider_assigned', this.handleProviderAssigned.bind(this));
    this.on('booking.started', this.handleServiceStarted.bind(this));
    this.on('booking.completed', this.handleServiceCompleted.bind(this));
    this.on('booking.disputed', this.handleBookingDisputed.bind(this));

    // Confirmation events
    this.on('booking.customer_confirmed', this.handleCustomerConfirmed.bind(this));
    this.on('booking.auto_confirmed', this.handleAutoConfirmed.bind(this));

    // Payment events
    this.on('payment.succeeded', this.handlePaymentSucceeded.bind(this));
    this.on('payment.failed', this.handlePaymentFailed.bind(this));
    this.on('payment.refunded', this.handlePaymentRefunded.bind(this));

    // Payout events
    this.on('payout.released', this.handlePayoutReleased.bind(this));
    this.on('payout.blocked', this.handlePayoutBlocked.bind(this));
    this.on('payout.failed', this.handlePayoutFailed.bind(this));

    // Quote events
    this.on('quote.requested', this.handleQuoteRequested.bind(this));
    this.on('quote.provided', this.handleQuoteProvided.bind(this));

    // Review events
    this.on('review.created', this.handleReviewCreated.bind(this));
  }

  // ===== EVENT HANDLERS =====

  private async handleBookingCreated(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`📅 Booking created: ${payload.bookingId}`);

      // Log analytics
      await this.logBookingAnalytics('booking_created', payload);

      // Update provider metrics
      if (payload.providerId) {
        await this.updateProviderMetrics(payload.providerId, 'booking_received');
      }

    } catch (error) {
      console.error('Error handling booking created event:', error);
    }
  }

  private async handleBookingConfirmed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`✅ Booking confirmed: ${payload.bookingId}`);

      // Send confirmation notifications
      await NotificationService.sendBookingNotification('booking_confirmed', payload.bookingId);

      // Update analytics
      await this.logBookingAnalytics('booking_confirmed', payload);

      // Update provider metrics
      if (payload.providerId) {
        await this.updateProviderMetrics(payload.providerId, 'booking_confirmed');
      }

    } catch (error) {
      console.error('Error handling booking confirmed event:', error);
    }
  }

  private async handleBookingCancelled(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`❌ Booking cancelled: ${payload.bookingId}`);

      // Send cancellation notifications
      await NotificationService.sendBookingNotification('booking_cancelled', payload.bookingId, payload.data);

      // Update analytics
      await this.logBookingAnalytics('booking_cancelled', payload);

      // Update provider metrics
      if (payload.providerId) {
        await this.updateProviderMetrics(payload.providerId, 'booking_cancelled');
      }

    } catch (error) {
      console.error('Error handling booking cancelled event:', error);
    }
  }

  private async handleProviderAssigned(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`👤 Provider assigned: ${payload.bookingId}`);

      // Send assignment notification to provider
      await NotificationService.sendBookingNotification('provider_assigned', payload.bookingId);

      // Update provider response time metrics
      if (payload.providerId) {
        await this.updateProviderResponseTime(payload.providerId, payload.bookingId);
      }

    } catch (error) {
      console.error('Error handling provider assigned event:', error);
    }
  }

  private async handleServiceStarted(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`🚀 Service started: ${payload.bookingId}`);

      // Send service started notification
      await NotificationService.sendBookingNotification('service_started', payload.bookingId);

      // Update booking analytics
      await this.logBookingAnalytics('service_started', payload);

    } catch (error) {
      console.error('Error handling service started event:', error);
    }
  }

  private async handleServiceCompleted(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`✨ Service completed: ${payload.bookingId}`);

      // Send completion notification with review request
      await NotificationService.sendBookingNotification('service_completed', payload.bookingId);

      // Update analytics and metrics
      await this.logBookingAnalytics('service_completed', payload);
      
      if (payload.providerId) {
        await this.updateProviderMetrics(payload.providerId, 'booking_completed');
      }

      // Schedule follow-up actions
      await this.scheduleFollowUpActions(payload.bookingId!);

    } catch (error) {
      console.error('Error handling service completed event:', error);
    }
  }

  private async handleBookingDisputed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`⚠️ Booking disputed: ${payload.bookingId}`);

      // Alert admins about dispute
      // TODO: Send admin notification
      
      // Update analytics
      await this.logBookingAnalytics('booking_disputed', payload);

    } catch (error) {
      console.error('Error handling booking disputed event:', error);
    }
  }

  private async handleCustomerConfirmed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Customer confirmed: ${payload.bookingId}`);
      await NotificationService.sendBookingNotification('service_awaiting_confirmation', payload.bookingId);
      await this.logBookingAnalytics('customer_confirmed', payload);
    } catch (error) {
      console.error('Error handling customer confirmed event:', error);
    }
  }

  private async handleAutoConfirmed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Auto-confirmed: ${payload.bookingId}`);
      await NotificationService.sendBookingNotification('auto_confirmed', payload.bookingId);
      await this.logBookingAnalytics('auto_confirmed', payload);
    } catch (error) {
      console.error('Error handling auto confirmed event:', error);
    }
  }

  private async handlePaymentSucceeded(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`💳 Payment succeeded: ${payload.bookingId}`);

      // Send payment confirmation
      await NotificationService.sendBookingNotification('payment_succeeded', payload.bookingId, payload.data);

      // Update financial analytics
      await this.logPaymentAnalytics('payment_succeeded', payload);

    } catch (error) {
      console.error('Error handling payment succeeded event:', error);
    }
  }

  private async handlePaymentFailed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`💳❌ Payment failed: ${payload.bookingId}`);

      // Send payment failure notification
      await NotificationService.sendBookingNotification('payment_failed', payload.bookingId, payload.data);

      // Update analytics
      await this.logPaymentAnalytics('payment_failed', payload);

    } catch (error) {
      console.error('Error handling payment failed event:', error);
    }
  }

  private async handlePaymentRefunded(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Payment refunded: ${payload.bookingId}`);
      await NotificationService.sendBookingNotification('payment_refunded', payload.bookingId, payload.data);
      await this.logPaymentAnalytics('payment_refunded', payload);
    } catch (error) {
      console.error('Error handling payment refunded event:', error);
    }
  }

  private async handlePayoutReleased(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Payout released: ${payload.bookingId}`);
      await NotificationService.sendBookingNotification('payout_released', payload.bookingId, payload.data);
      await this.logPaymentAnalytics('payout_released', payload);
    } catch (error) {
      console.error('Error handling payout released event:', error);
    }
  }

  private async handlePayoutBlocked(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Payout blocked: ${payload.bookingId}`);
      await NotificationService.sendBookingNotification('dispute_opened', payload.bookingId, payload.data);
      await this.logPaymentAnalytics('payout_blocked', payload);
    } catch (error) {
      console.error('Error handling payout blocked event:', error);
    }
  }

  private async handlePayoutFailed(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;
      console.log(`Payout failed: ${payload.bookingId}`);
      // Notify admin about payout failure
      await this.logPaymentAnalytics('payout_failed', payload);
    } catch (error) {
      console.error('Error handling payout failed event:', error);
    }
  }

  private async handleQuoteRequested(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`💬 Quote requested: ${payload.bookingId}`);

      // Notify provider about quote request
      await NotificationService.sendBookingNotification('quote_requested', payload.bookingId);

      // Update provider metrics
      if (payload.providerId) {
        await this.updateProviderMetrics(payload.providerId, 'quote_requested');
      }

    } catch (error) {
      console.error('Error handling quote requested event:', error);
    }
  }

  private async handleQuoteProvided(payload: EventPayload) {
    try {
      if (!payload.bookingId) return;

      console.log(`💬✅ Quote provided: ${payload.bookingId}`);

      // Notify customer about quote
      await NotificationService.sendBookingNotification('quote_provided', payload.bookingId, payload.data);

      // Update provider response metrics
      if (payload.providerId) {
        await this.updateProviderResponseTime(payload.providerId, payload.bookingId);
      }

    } catch (error) {
      console.error('Error handling quote provided event:', error);
    }
  }

  private async handleReviewCreated(payload: EventPayload) {
    try {
      console.log(`⭐ Review created for booking: ${payload.bookingId}`);

      // Notify provider about review
      await NotificationService.sendBookingNotification('review_received', payload.bookingId!, payload.data);

      // Update provider rating
      if (payload.providerId && payload.data?.rating) {
        await this.updateProviderRating(payload.providerId, payload.data.rating);
      }

    } catch (error) {
      console.error('Error handling review created event:', error);
    }
  }

  // ===== ANALYTICS & METRICS HELPERS =====

  private async logBookingAnalytics(eventType: string, payload: EventPayload) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update or create analytics record for today
      const existing = await prisma.bookingAnalytics.findUnique({
        where: { date: today }
      });

      if (existing) {
        const updates: any = {};
        
        switch (eventType) {
          case 'booking_created':
            updates.totalBookings = { increment: 1 };
            break;
          case 'booking_confirmed':
            updates.confirmedBookings = { increment: 1 };
            break;
          case 'booking_cancelled':
            updates.cancelledBookings = { increment: 1 };
            break;
          case 'service_completed':
            updates.completedBookings = { increment: 1 };
            if (payload.data?.revenue) {
              updates.totalRevenue = { increment: payload.data.revenue };
            }
            break;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.bookingAnalytics.update({
            where: { date: today },
            data: updates
          });
        }
      } else {
        // Create new analytics record
        const data: any = {
          date: today,
          totalBookings: eventType === 'booking_created' ? 1 : 0,
          confirmedBookings: eventType === 'booking_confirmed' ? 1 : 0,
          cancelledBookings: eventType === 'booking_cancelled' ? 1 : 0,
          completedBookings: eventType === 'service_completed' ? 1 : 0,
          totalRevenue: eventType === 'service_completed' && payload.data?.revenue ? payload.data.revenue : 0
        };

        await prisma.bookingAnalytics.create({ data });
      }
    } catch (error) {
      console.error('Error logging booking analytics:', error);
    }
  }

  private async logPaymentAnalytics(eventType: string, payload: EventPayload) {
    // Similar to booking analytics but focused on payments
    console.log(`📊 Logging payment analytics: ${eventType}`);
  }

  private async updateProviderMetrics(providerId: string, metricType: string) {
    try {
      const updates: any = {};

      switch (metricType) {
        case 'booking_confirmed':
          updates.totalBookings = { increment: 1 };
          break;
        case 'booking_completed':
          updates.completedBookings = { increment: 1 };
          break;
        case 'booking_cancelled':
          updates.cancelledBookings = { increment: 1 };
          break;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.providerProfile.update({
          where: { id: providerId },
          data: updates
        });
      }
    } catch (error) {
      console.error('Error updating provider metrics:', error);
    }
  }

  private async updateProviderResponseTime(providerId: string, bookingId: string) {
    try {
      // Calculate response time from booking creation to acceptance
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { createdAt: true }
      });

      if (booking) {
        const responseTimeMinutes = Math.floor((Date.now() - booking.createdAt.getTime()) / (1000 * 60));
        
        // Update average response time (simplified calculation)
        const provider = await prisma.providerProfile.findUnique({
          where: { id: providerId },
          select: { responseTime: true, totalBookings: true }
        });

        if (provider) {
          const currentAvg = provider.responseTime || 0;
          const bookingCount = provider.totalBookings || 1;
          const newAvg = Math.round(((currentAvg * (bookingCount - 1)) + responseTimeMinutes) / bookingCount);

          await prisma.providerProfile.update({
            where: { id: providerId },
            data: { responseTime: newAvg }
          });
        }
      }
    } catch (error) {
      console.error('Error updating provider response time:', error);
    }
  }

  private async updateProviderRating(providerId: string, newRating: number) {
    try {
      // Recalculate average rating
      const reviews = await prisma.review.findMany({
        where: { 
          revieweeId: providerId,
          isPublic: true 
        },
        select: { rating: true }
      });

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await prisma.providerProfile.update({
          where: { id: providerId },
          data: { avgRating: Math.round(avgRating * 10) / 10 } // Round to 1 decimal
        });
      }
    } catch (error) {
      console.error('Error updating provider rating:', error);
    }
  }

  private async scheduleFollowUpActions(bookingId: string) {
    // Schedule review reminder, satisfaction survey, etc.
    console.log(`📋 Scheduling follow-up actions for booking ${bookingId}`);
    
    // TODO: Integrate with job queue (Bull, Agenda, etc.)
    // - Send review reminder after 24 hours
    // - Send satisfaction survey after 3 days
    // - Archive booking after 30 days
  }
}

// Export singleton instance
export const eventBus = BookingEventBus.getInstance();