// Mock database for build time when Prisma is not available

export const mockPrisma = {
  user: {
    findUnique: () => null,
    create: () => null,
    update: () => null,
  },
  booking: {
    findUnique: () => null,
    findMany: () => [],
    create: () => null,
    update: () => null,
  },
  providerProfile: {
    findUnique: () => null,
    findFirst: () => null,
  },
  service: {
    findUnique: () => null,
  },
  availabilityRule: {
    findMany: () => [],
  },
  bookingEvent: {
    create: () => null,
  },
  bookingAnalytics: {
    findUnique: () => null,
    create: () => null,
    update: () => null,
  }
};

// Use mock in build environment
export const prisma = typeof window === 'undefined' && process.env.NODE_ENV === 'production' 
  ? mockPrisma 
  : mockPrisma;