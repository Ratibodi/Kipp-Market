import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

/**
 * Execute a callback within an isolated tenant context.
 * In PostgreSQL, this sets `app.tenant_id` for RLS compatibility (Design Doc 4.2).
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await db.$transaction(async (tx) => {
    try {
      // Set PostgreSQL session setting for Row Level Security (RLS)
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.tenant_id', $1, true)`,
        tenantId
      );
    } catch {
      // Non-critical fallback if database driver/environment doesn't support set_config
    }
    return await callback(tx);
  });
}
