import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER!;

interface SmsOptions {
  to: string;
  body: string;
}

export async function sendSms({ to, body }: SmsOptions) {
  try {
    const message = await client.messages.create({
      body,
      from: FROM_PHONE,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return { success: false, error };
  }
}

// Pre-built SMS templates for common events

export async function sendBookingConfirmationSms(to: string, booking: {
  serviceName: string;
  date: string;
  time: string;
}) {
  return sendSms({
    to,
    body: `Tumaro: Your ${booking.serviceName} is confirmed for ${booking.date} at ${booking.time}. We'll text you a reminder before your appointment.`,
  });
}

export async function sendBookingReminderSms(to: string, booking: {
  serviceName: string;
  time: string;
}) {
  return sendSms({
    to,
    body: `Tumaro Reminder: Your ${booking.serviceName} is coming up today at ${booking.time}. See you soon!`,
  });
}

export async function sendProviderAssignedSms(to: string, provider: {
  name: string;
  eta: string;
}) {
  return sendSms({
    to,
    body: `Tumaro: ${provider.name} has been assigned to your booking. ETA: ${provider.eta}.`,
  });
}

export async function sendServiceCompleteSms(to: string) {
  return sendSms({
    to,
    body: `Tumaro: Your detailing service is complete! We'd love your feedback - rate your experience in the app.`,
  });
}
