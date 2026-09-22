"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseView } from "@/lib/course-view";
import { SITE } from "@/lib/site";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.Razorpay) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Checkout failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Checkout failed to load"));
    document.body.appendChild(script);
  });
}

type SubmitState = {
  loading: boolean;
  formError: string | null;
  errors: Record<string, string>;
};

export function useApplicationSubmit(course: CourseView) {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({
    loading: false,
    formError: null,
    errors: {},
  });
  // Keeps a half-finished application recoverable if checkout is dismissed.
  const pendingRef = useRef<{ referenceNo: string } | null>(null);

  const submit = useCallback(
    async (payload: Record<string, unknown>) => {
      setState({ loading: true, formError: null, errors: {} });

      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, courseSlug: course.slug }),
        });

        const data = await res.json();

        if (!res.ok) {
          setState({
            loading: false,
            formError: data.message ?? "Could not submit the application. Please try again.",
            errors: data.errors ?? {},
          });
          // Move focus to the first field that failed so the error is not missed.
          const firstField = data.errors ? Object.keys(data.errors)[0] : null;
          if (firstField) {
            document.getElementById(firstField)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          return;
        }

        pendingRef.current = { referenceNo: data.referenceNo };

        await loadCheckout();

        if (!window.Razorpay) {
          throw new Error("Payment window could not be opened.");
        }

        const checkout = new window.Razorpay({
          key: data.razorpayKeyId,
          order_id: data.order.id,
          amount: data.order.amount,
          currency: data.order.currency,
          name: SITE.name,
          description: course.shortName,
          prefill: {
            name: payload.fullName,
            email: payload.email,
            contact: payload.phone,
          },
          notes: { referenceNo: data.referenceNo, course: course.slug },
          theme: { color: "#1d44e4" },
          modal: {
            ondismiss: () => {
              setState({
                loading: false,
                formError: `Payment was cancelled. Your application is saved as ${data.referenceNo} — you can complete the payment from the tracking page.`,
                errors: {},
              });
            },
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();

              if (!verifyRes.ok) {
                setState({
                  loading: false,
                  formError:
                    verifyData.message ??
                    `We could not confirm the payment automatically. Please contact support with reference ${data.referenceNo}.`,
                  errors: {},
                });
                return;
              }

              router.push(`/success?ref=${encodeURIComponent(verifyData.referenceNo)}`);
            } catch {
              setState({
                loading: false,
                formError: `Payment went through but confirmation failed. Please contact support with reference ${data.referenceNo}.`,
                errors: {},
              });
            }
          },
        });

        checkout.open();
      } catch (error) {
        setState({
          loading: false,
          formError:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          errors: {},
        });
      }
    },
    [course, router],
  );

  return { ...state, submit, pendingRef };
}
