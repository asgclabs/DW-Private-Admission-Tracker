import type { Document } from "mongodb";

export function paymentMonthStarts(now: Date) {
  const [year, month] = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).split("-").map(Number);
  const indiaOffset = 330 * 60 * 1000;
  return {
    thisMonth: new Date(Date.UTC(year, month - 1, 1) - indiaOffset),
    previousMonth: new Date(Date.UTC(year, month - 2, 1) - indiaOffset),
  };
}

/** Only received payments contribute to collections; legacy records are online. */
export function receivedPaymentsPipeline(source?: "ONLINE" | "OFFLINE", since?: Date): Document[] {
  return [
    { $match: {
      paymentStatus: "PAID",
      ...(source === "OFFLINE" ? { paymentSource: "OFFLINE" } : {}),
      ...(source === "ONLINE" ? { paymentSource: { $ne: "OFFLINE" } } : {}),
      ...(since ? { paidAt: { $gte: since } } : {}),
    } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ];
}
