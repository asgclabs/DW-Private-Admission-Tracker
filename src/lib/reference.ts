/**
 * Reference numbers look like DWFI-26-4F8K2Q — readable over the phone and
 * carrying the course and year, so support can triage without a lookup.
 * The prefix is derived from the slug, so new courses get one automatically.
 */
export function referencePrefix(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  const initials =
    parts.length >= 2 ? parts.map((p) => p[0]).join("") : (parts[0] ?? "x").slice(0, 2);

  const letters = initials.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  return `DW${letters || "X"}`;
}

export function generateReferenceNo(slug: string): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${referencePrefix(slug)}-${year}-${suffix}`;
}
