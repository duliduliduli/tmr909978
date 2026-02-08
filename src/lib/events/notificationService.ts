import { prisma } from '@/lib/prisma';

// ===== NOTIFICATION TYPES =====

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_refunded'
  | 'provider_assigned'
  | 'service_started'
  | 'service_completed'
  | 'service_awaiting_confirmation'
  | 'auto_confirmed'
  | 'payout_released'
  | 'dispute_opened'
  | 'review_received'
  | 'quote_requested'
  | 'quote_provided'
  | 'reminder_upcoming'
  | 'reminder_overdue';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationRecipient = 'customer' | 'provider' | 'admin';

// ===== NOTIFICATION TEMPLATES =====

interface NotificationTemplate {
  subject: string;
  body: string;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  booking_confirmed: {
    subject: 'Booking Confirmed - {{serviceName}}',
    body: 'Your booking for {{serviceName}} on {{date}} at {{time}} has been confirmed.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer']
  },
  
  booking_cancelled: {
    subject: 'Booking Cancelled - {{serviceName}}',
    body: 'Your booking for {{serviceName}} scheduled for {{date}} has been cancelled.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer', 'provider']
  },

  payment_succeeded: {
    subject: 'Payment Confirmed - {{amount}}',
    body: 'Your payment of {{amount}} for {{serviceName}} has been processed successfully.',
    channels: ['email', 'push'],
    recipients: ['customer']
  },

  payment_failed: {
    subject: 'Payment Failed - Action Required',
    body: 'We couldn\'t process your payment for {{serviceName}}. Please update your payment method.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer']
  },

  payment_refunded: {
    subject: 'Refund Processed - {{amount}}',
    body: 'Your refund of {{amount}} for {{serviceName}} (Booking #{{bookingNumber}}) has been processed. It may take 5-10 business days to appear on your statement.',
    channels: ['email', 'push'],
    recipients: ['customer']
  },

  provider_assigned: {
    subject: 'New Booking Assignment',
    body: 'You have a new booking request for {{serviceName}} on {{date}} at {{time}}.',
    channels: ['email', 'sms', 'push'],
    recipients: ['provider']
  },

  service_started: {
    subject: 'Service Started',
    body: 'Your {{serviceName}} service has started. The provider is now on-site.',
    channels: ['sms', 'push'],
    recipients: ['customer']
  },

  service_completed: {
    subject: 'Service Completed',
    body: 'Your {{serviceName}} has been completed. Please review your service experience.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer']
  },

  service_awaiting_confirmation: {
    subject: 'Please Confirm Your Service - {{serviceName}}',
    body: 'Your {{serviceName}} has been marked as completed. Please confirm you are satisfied within 48 hours, or the service will be automatically confirmed.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer']
  },

  auto_confirmed: {
    subject: 'Service Auto-Confirmed - {{serviceName}}',
    body: 'Your {{serviceName}} (Booking #{{bookingNumber}}) has been automatically confirmed after 48 hours. Payment has been released to the provider.',
    channels: ['email', 'push'],
    recipients: ['customer']
  },

  payout_released: {
    subject: 'Payment Released - {{amount}}',
    body: 'Your payout of {{amount}} for {{serviceName}} (Booking #{{bookingNumber}}) has been released to your account.',
    channels: ['email', 'push'],
    recipients: ['provider']
  },

  dispute_opened: {
    subject: 'Dispute Opened - Booking #{{bookingNumber}}',
    body: 'A dispute has been opened for {{serviceName}} (Booking #{{bookingNumber}}). Payout has been held pending resolution.',
    channels: ['email', 'sms', 'push'],
    recipients: ['provider', 'admin']
  },

  review_received: {
    subject: 'New Review Received',
    body: 'You received a {{rating}}-star review: "{{comment}}"',
    channels: ['email', 'push'],
    recipients: ['provider']
  },

  quote_requested: {
    subject: 'Quote Request - {{serviceName}}',
    body: 'A customer has requested a quote for {{serviceName}} on {{date}}.',
    channels: ['email', 'sms', 'push'],
    recipients: ['provider']
  },

  quote_provided: {
    subject: 'Quote Ready - {{serviceName}}',
    body: 'Your quote for {{serviceName}} is ready. Total: {{amount}}',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer']
  },

  reminder_upcoming: {
    subject: 'Upcoming Service Reminder',
    body: 'Reminder: Your {{serviceName}} is scheduled for tomorrow at {{time}}.',
    channels: ['email', 'sms', 'push'],
    recipients: ['customer', 'provider']
  },

  reminder_overdue: {
    subject: 'Overdue Service Alert',
    body: 'Your scheduled service for {{serviceName}} appears to be overdue. Please contact support.',
    channels: ['email', 'push'],
    recipients: ['customer']
  }
};

// ===== NOTIFICATION SERVICE =====

export class NotificationService {
  /**
   * Send notification for a booking event
   */
  static async sendBookingNotification(
    type: NotificationType,
    bookingId: string,
    customData: Record<string, any> = {}
  ) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          provider: { include: { user: true } },
          service: true
        }
      });

      if (!booking) {
        console.error(`Booking ${bookingId} not found for notification`);
        return;
      }

      const template = NOTIFICATION_TEMPLATES[type];
      if (!template) {
        console.error(`Unknown notification type: ${type}`);
        return;
      }

      // Prepare notification data
      const notificationData = {
        serviceName: booking.service.name,
        date: booking.scheduledStartTime.toLocaleDateString(),
        time: booking.scheduledStartTime.toLocaleTimeString(),
        amount: new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(booking.totalAmount / 100),
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        providerName: booking.provider.businessName,
        bookingNumber: booking.bookingNumber,
        ...customData
      };

      // Send to each recipient type
      for (const recipient of template.recipients) {
        const recipientData = this.getRecipientData(booking, recipient);
        if (!recipientData) continue;

        // Send on each channel
        for (const channel of template.channels) {
          await this.sendNotification(
            channel,
            recipient,
            recipientData,
            this.renderTemplate(template, notificationData),
            bookingId
          );
        }
      }

    } catch (error: any) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Get recipient contact information
   */
  private static getRecipientData(booking: any, recipient: NotificationRecipient) {
    switch (recipient) {
      case 'customer':
        return {
          id: booking.customer.id,
          email: booking.customer.email,
          phone: booking.customer.phone,
          name: `${booking.customer.firstName} ${booking.customer.lastName}`
        };
      case 'provider':
        return {
          id: booking.provider.user.id,
          email: booking.provider.user.email,
          phone: booking.provider.user.phone,
          name: booking.provider.businessName
        };
      case 'admin':
        return {
          id: 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@tumaro.app',
          phone: process.env.ADMIN_PHONE,
          name: 'Tumaro Admin'
        };
      default:
        return null;
    }
  }

  /**
   * Render notification template with data
   */
  private static renderTemplate(
    template: NotificationTemplate,
    data: Record<string, any>
  ) {
    let subject = template.subject;
    let body = template.body;

    // Simple template replacement
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), data[key]);
      body = body.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    return { subject, body };
  }

  /**
   * Send notification via specific channel
   */
  private static async sendNotification(
    channel: NotificationChannel,
    recipientType: NotificationRecipient,
    recipientData: any,
    content: { subject: string; body: string },
    bookingId: string
  ) {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmail(recipientData.email, content.subject, content.body);
          break;
        case 'sms':
          if (recipientData.phone) {
            await this.sendSMS(recipientData.phone, content.body);
          }
          break;
        case 'push':
          await this.sendPushNotification(recipientData.id, content.subject, content.body);
          break;
        case 'in_app':
          await this.createInAppNotification(recipientData.id, content.subject, content.body, bookingId);
          break;
      }

      console.log(`${channel} notification sent to ${recipientType}: ${recipientData.email || recipientData.phone}`);
    } catch (error: any) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmail(to: string, subject: string, body: string) {
    // Mock email sending - integrate with SendGrid, AWS SES, etc.
    console.log(`📧 EMAIL TO: ${to}`);
    console.log(`📧 SUBJECT: ${subject}`);
    console.log(`📧 BODY: ${body}`);
    
    // Example integration:
    // await emailProvider.send({
    //   to,
    //   subject,
    //   html: body,
    //   from: process.env.FROM_EMAIL
    // });
  }

  /**
   * Send SMS notification
   */
  private static async sendSMS(to: string, message: string) {
    // Mock SMS sending - integrate with Twilio, AWS SNS, etc.
    console.log(`📱 SMS TO: ${to}`);
    console.log(`📱 MESSAGE: ${message}`);
    
    // Example integration:
    // await smsProvider.send({
    //   to,
    //   body: message,
    //   from: process.env.TWILIO_PHONE
    // });
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(userId: string, title: string, body: string) {
    // Mock push notification - integrate with FCM, APNS, etc.
    console.log(`🔔 PUSH TO: ${userId}`);
    console.log(`🔔 TITLE: ${title}`);
    console.log(`🔔 BODY: ${body}`);
    
    // Example integration:
    // await pushProvider.send({
    //   userId,
    //   title,
    //   body,
    //   data: { type: 'booking_update' }
    // });
  }

  /**
   * Create in-app notification
   */
  private static async createInAppNotification(
    userId: string,
    title: string,
    body: string,
    bookingId: string
  ) {
    // Store in database for in-app notification system
    console.log(`🔔 IN-APP TO: ${userId}`);
    console.log(`🔔 TITLE: ${title}`);
    console.log(`🔔 BODY: ${body}`);
    
    // Example storage:
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     title,
    //     body,
    //     bookingId,
    //     read: false,
    //     createdAt: new Date()
    //   }
    // });
  }

  /**
   * Send reminder notifications
   */
  static async sendReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get bookings scheduled for tomorrow
      const upcomingBookings = await prisma.booking.findMany({
        where: {
          scheduledStartTime: {
            gte: tomorrow,
            lt: nextDay
          },
          status: {
            in: ['CONFIRMED', 'PROVIDER_ASSIGNED']
          }
        },
        include: {
          customer: true,
          provider: { include: { user: true } },
          service: true
        }
      });

      // Send upcoming reminders
      for (const booking of upcomingBookings) {
        await this.sendBookingNotification('reminder_upcoming', booking.id);
      }

      // Check for overdue bookings
      const now = new Date();
      const overdueBookings = await prisma.booking.findMany({
        where: {
          scheduledStartTime: { lt: now },
          status: {
            in: ['CONFIRMED', 'PROVIDER_ASSIGNED']
          }
        }
      });

      for (const booking of overdueBookings) {
        await this.sendBookingNotification('reminder_overdue', booking.id);
      }

      console.log(`Sent ${upcomingBookings.length} upcoming reminders and ${overdueBookings.length} overdue alerts`);
    } catch (error: any) {
      console.error('Error sending reminders:', error);
    }
  }
}