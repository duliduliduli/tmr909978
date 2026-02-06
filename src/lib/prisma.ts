import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client that won't crash the app if DB is unavailable
export const prisma = global.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Note: Prisma will auto-connect on first query. No need to connect eagerly.
