import { NextResponse } from "next/server";
import { applications } from "@/lib/mongodb";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payment response." }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const isValid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!isValid) {
    console.warn("[payment] signature mismatch", { orderId, paymentId });
    return NextResponse.json(
      { message: "Payment could not be verified. Please contact support." },
      { status: 400 },
    );
  }

  const col = await applications();
  const now = new Date();

  // Conditional update: only the first writer for this order flips it to PAID,
  // so a racing webhook cannot double-append the event.
  const result = await col.findOneAndUpdate(
    { razorpayOrderId: orderId, paymentStatus: "PENDING" },
    {
      $set: {
        paymentStatus: "PAID",
        status: "PAID",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paidAt: now,
        updatedAt: now,
      },
      $push: {
        events: {
          status: "PAID" as const,
          message: `Payment received (${paymentId}).`,
          actor: "system",
          createdAt: now,
        },
      },
    },
    { returnDocument: "after" },
  );

  if (result) {
    return NextResponse.json({ referenceNo: result.referenceNo });
  }

  // Either the webhook got here first, or the order is unknown.
  const existing = await col.findOne(
    { razorpayOrderId: orderId },
    { projection: { referenceNo: 1, paymentStatus: 1 } },
  );

  if (!existing) {
    return NextResponse.json(
      { message: "No application found for this payment." },
      { status: 404 },
    );
  }

  return NextResponse.json({ referenceNo: existing.referenceNo, alreadyPaid: true });
}
