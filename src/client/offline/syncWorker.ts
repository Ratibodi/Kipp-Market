import { localDb, OutboxSale, CachedProduct } from "./db";

let isSyncing = false;

/**
 * Queue a completed POS sale into IndexedDB Outbox table,
 * then attempt immediate sync if the browser is online.
 */
export async function queueSaleForSync(sale: OutboxSale): Promise<void> {
  await localDb.outboxSales.put(sale);

  // If online, flush immediately
  if (typeof navigator !== "undefined" && navigator.onLine) {
    flushOutboxSales().catch((err) =>
      console.warn("Background sales sync failed, will retry:", err)
    );
  }
}

/**
 * Flush all pending and failed sales in the Outbox to the backend server.
 */
export async function flushOutboxSales(): Promise<{ syncedCount: number; pendingCount: number }> {
  if (isSyncing) {
    const remaining = await localDb.outboxSales.where("status").equals("pending").count();
    return { syncedCount: 0, pendingCount: remaining };
  }

  isSyncing = true;

  try {
    const pendingSales = await localDb.outboxSales
      .where("status")
      .anyOf(["pending", "failed"])
      .limit(50)
      .toArray();

    if (pendingSales.length === 0) {
      return { syncedCount: 0, pendingCount: 0 };
    }

    // Mark as syncing
    const saleIds = pendingSales.map((s) => s.id);
    await localDb.outboxSales
      .where("id")
      .anyOf(saleIds)
      .modify({ status: "syncing" });

    // Send batch to /api/sync/sales
    const response = await fetch("/api/sync/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales: pendingSales }),
    });

    if (!response.ok) {
      throw new Error(`Sync API responded with status ${response.status}`);
    }

    const data = await response.json();
    const accepted: string[] = data.accepted || [];

    // Delete successfully synced sales from outbox
    if (accepted.length > 0) {
      await localDb.outboxSales.bulkDelete(accepted);
    }

    // Mark unaccepted as failed with incremented retryCount
    const unaccepted = saleIds.filter((id) => !accepted.includes(id));
    if (unaccepted.length > 0) {
      await localDb.outboxSales
        .where("id")
        .anyOf(unaccepted)
        .modify((sale) => {
          sale.status = "failed";
          sale.retryCount = (sale.retryCount || 0) + 1;
        });
    }

    const remainingPending = await localDb.outboxSales
      .where("status")
      .equals("pending")
      .count();

    return { syncedCount: accepted.length, pendingCount: remainingPending };
  } catch (err: unknown) {
    console.error("Outbox Flush Error:", err);
    // Revert syncing sales back to failed
    await localDb.outboxSales
      .where("status")
      .equals("syncing")
      .modify({ status: "failed" });

    return { syncedCount: 0, pendingCount: -1 };
  } finally {
    isSyncing = false;
  }
}

/**
 * Fetch latest active catalog from server and cache into local IndexedDB.
 */
export async function syncCatalogFromServer(
  tenantId: string,
  branchId: string
): Promise<number> {
  try {
    const response = await fetch(
      `/api/sync/catalog?tenantId=${encodeURIComponent(tenantId)}&branchId=${encodeURIComponent(branchId)}`
    );

    if (!response.ok) return 0;

    const data = await response.json();
    const products: CachedProduct[] = data.products || [];

    if (products.length > 0) {
      await localDb.cachedProducts.bulkPut(products);
    }

    return products.length;
  } catch (err) {
    console.warn("Failed to sync catalog from server, using local cache:", err);
    return 0;
  }
}

/**
 * Initialize automatic background sync on online events and periodic intervals.
 */
export function initBackgroundSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    flushOutboxSales().catch(() => {});
  };

  window.addEventListener("online", handleOnline);

  // Poll outbox every 30 seconds
  const intervalId = window.setInterval(() => {
    if (navigator.onLine) {
      flushOutboxSales().catch(() => {});
    }
  }, 30000);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.clearInterval(intervalId);
  };
}
