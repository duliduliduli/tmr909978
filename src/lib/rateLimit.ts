import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General API rate limit: 20 requests per 10 seconds per IP
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Auth rate limit: 5 attempts per minute (login, signup)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Payment rate limit: 3 attempts per minute
export const paymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:payment",
});

/**
 * Check rate limit and return NextResponse if exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
