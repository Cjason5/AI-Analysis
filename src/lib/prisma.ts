import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured, database features will be disabled');
    return null;
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return prisma !== null;
}
