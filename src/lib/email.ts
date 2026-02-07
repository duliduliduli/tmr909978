import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@tumaro.com";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      text: text || "",
      html: html || text || "",
    });
    return { success: true };
  } catch (error) {
    console.error("SendGrid email error:", error);
    return { success: false, error };
  }
}

// Pre-built email templates for common events

export async function sendBookingConfirmation(to: string, booking: {
  id: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  return sendEmail({
    to,
    subject: `Booking Confirmed - ${booking.serviceName}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p>We'll send you a reminder before your appointment.</p>
    `,
  });
}

export async function sendBookingCancellation(to: string, booking: {
  id: string;
  serviceName: string;
}) {
  return sendEmail({
    to,
    subject: `Booking Cancelled - ${booking.serviceName}`,
    html: `
      <h2>Your booking has been cancelled</h2>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p>If you didn't request this cancellation, please contact support.</p>
    `,
  });
}

export async function sendPaymentReceipt(to: string, payment: {
  amount: number;
  serviceName: string;
  date: string;
}) {
  return sendEmail({
    to,
    subject: `Payment Receipt - $${payment.amount.toFixed(2)}`,
    html: `
      <h2>Payment Received</h2>
      <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
      <p><strong>Service:</strong> ${payment.serviceName}</p>
      <p><strong>Date:</strong> ${payment.date}</p>
      <p>Thank you for your business!</p>
    `,
  });
}
