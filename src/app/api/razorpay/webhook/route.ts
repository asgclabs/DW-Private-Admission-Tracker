import { NextResponse } from "next/server";
import { applications } from "@/lib/mongodb";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safety net for payments the browser never confirmed — the student closed the
 * tab, lost network, or the verify call failed. Razorpay retries this endpoint,
 * so every write is conditional and therefore idempotent.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };

  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    return NextResponse.json({ received: true, ignored: "no order id" });
  }

  const col = await applications();
  const now = new Date();

  if (event.event === "payment.captured") {
    const result = await col.updateOne(
      { razorpayOrderId: orderId, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PAID",
          razorpayPaymentId: paymentId,
          paidAt: now,
          updatedAt: now,
        },
        $push: {
          events: {
            status: "PAID" as const,
            message: `Payment confirmed by Razorpay webhook (${paymentId}).`,
            actor: "razorpay",
            createdAt: now,
          },
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ received: true, ignored: "already paid or unknown order" });
    }
  }

  if (event.event === "payment.failed") {
    await col.updateOne(
      { razorpayOrderId: orderId, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "FAILED", razorpayPaymentId: paymentId, updatedAt: now } },
    );
  }

  return NextResponse.json({ received: true });
}
