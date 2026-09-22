import { z } from "zod";
import { isCatalogFieldKey } from "./field-catalog";
import { courseSchema } from "./validation";

export type CoursePayload = z.infer<typeof courseSchema>;

/**
 * Validates a course submitted from the dashboard and normalises the parts the
 * form cannot enforce on its own: unknown catalog keys, required fields that
 * were never enabled, and duplicate custom field keys.
 */
export function parseCoursePayload(
  body: unknown,
): { ok: true; data: CoursePayload } | { ok: false; errors: Record<string, string> } {
  const parsed = courseSchema.safeParse(body);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  const errors: Record<string, string> = {};

  const catalogFields = data.catalogFields.filter(isCatalogFieldKey);
  // A required field that is not enabled would block every submission with an
  // error the student can never see or fix.
  const requiredFields = data.requiredFields.filter(
    (key) => isCatalogFieldKey(key) && catalogFields.includes(key),
  );

  const seen = new Set<string>();
  for (const field of data.customFields) {
    if (seen.has(field.key)) {
      errors.customFields = `Two custom fields share the key "${field.key}". Keys must be unique.`;
      break;
    }
    seen.add(field.key);

    if (field.type === "select" && field.options.length === 0) {
      errors.customFields = `The dropdown "${field.label}" needs at least one option.`;
      break;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      ...data,
      catalogFields,
      requiredFields,
      whoCanEnroll: data.whoCanEnroll.filter(Boolean),
      offers: data.offers.filter(Boolean),
      highlights: data.highlights.filter(Boolean),
    },
  };
}
