/** Read-only integration check: synthetic documents run through the real MongoDB pipelines. */
import "dotenv/config";
import assert from "node:assert/strict";
import { MongoClient } from "mongodb";
import { paymentMonthStarts, receivedPaymentsPipeline } from "../src/lib/payment-query";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the read-only integration check.");
  const client = new MongoClient(process.env.DATABASE_URL, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB ?? "dw_private");
    const since = paymentMonthStarts(new Date("2026-10-15T00:00:00.000Z")).thisMonth;
    const documents = [
      { paymentStatus: "PAID", amount: 499, paidAt: since }, // Legacy online record.
      { paymentStatus: "PAID", paymentSource: "ONLINE", amount: 999, paidAt: since },
      { paymentStatus: "PAID", paymentSource: "OFFLINE", amount: 300, paidAt: since },
      { paymentStatus: "PAID", paymentSource: "OFFLINE", amount: 200, paidAt: new Date("2026-09-01") },
      { paymentStatus: "PENDING", paymentSource: "ONLINE", amount: 10000 },
      { paymentStatus: "PENDING", paymentSource: "OFFLINE", amount: 10000 },
      { paymentStatus: "FAILED", amount: 10000 },
      { paymentStatus: "REFUNDED", paymentSource: "OFFLINE", amount: 10000 },
    ];
    const [result] = await db.aggregate([
      { $documents: documents },
      { $facet: {
        total: receivedPaymentsPipeline(), online: receivedPaymentsPipeline("ONLINE"),
        offline: receivedPaymentsPipeline("OFFLINE"), monthly: receivedPaymentsPipeline(undefined, since),
      } },
    ]).toArray();
    assert.equal(result.total[0].total, 1998);
    assert.equal(result.online[0].total, 1498);
    assert.equal(result.offline[0].total, 500);
    assert.equal(result.monthly[0].total, 1798);
    assert.equal(result.total[0].total, result.online[0].total + result.offline[0].total);
    const empty = await db.aggregate([{ $documents: [{ paymentStatus: "PENDING", amount: 999 }] }, ...receivedPaymentsPipeline()]).toArray();
    assert.deepEqual(empty, []);
    console.log("Payment totals passed: online + offline = total; pending, failed and refunded excluded; legacy and monthly totals correct. No database records written.");
  } finally { await client.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
