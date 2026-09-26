const PRODUCTION_URL = "https://private.doonwinner.in";

/**
 * The public address used in shared links (e.g. the tracking link students send
 * themselves on WhatsApp) and page metadata. A production build never falls back
 * to localhost: if NEXT_PUBLIC_SITE_URL is missing, or a local value was copied
 * into the host settings, it uses the live domain instead.
 */
function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return fromEnv || "http://localhost:3000";
  return fromEnv && !/localhost|127\.0\.0\.1/.test(fromEnv) ? fromEnv : PRODUCTION_URL;
}

export const SITE = {
  name: "Doon Winner",
  title: "CBSE Private Students Guide for Compartment, Improvement & Failure",
  shortTitle: "CBSE Private Students Guide",
  description:
    "Complete guidance and form filling support for CBSE private students appearing in Compartment, Improvement and Essential Repeat exams. Choose Focus 4.0 or Circle 4.0 and track your application.",
  email: "support@doonwinner.in",
  phone: "+91 88740 42453",
  phoneHref: "tel:+918874042453",
  whatsapp: "https://wa.me/918874042453",
  url: siteUrl(),
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#programs", label: "Programs" },
  { href: "/#process", label: "How it works" },
  { href: "/track", label: "Track Application" },
  { href: "/notifications", label: "Notifications" },
] as const;

export const LEGAL_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/shipping", label: "Shipping and Delivery" },
  { href: "/refund", label: "Cancellation and Refund Policy" },
] as const;
