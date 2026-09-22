export const SITE = {
  name: "Doon Winner Academy",
  title: "CBSE Private Students Guide for Compartment, Improvement & Failure",
  shortTitle: "CBSE Private Students Guide",
  description:
    "Complete guidance and form filling support for CBSE private students appearing in Compartment, Improvement and Essential Repeat exams. Choose Focus 4.0 or Circle 4.0 and track your application.",
  email: "support@doonwinner.in",
  phone: "+91 88740 24253",
  phoneHref: "tel:+918874024253",
  whatsapp: "https://wa.me/918874024253",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
