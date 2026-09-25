import { z } from "zod";
import {
  FIELD_CATALOG,
  isCatalogFieldKey,
  parseCustomFields,
  type CatalogFieldKey,
  type CustomField,
} from "./field-catalog";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

const phoneRule = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Always collected, whatever the course is configured to ask for. */
const baseShape = {
  fullName: z.string().trim().min(3, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: phoneRule,
  altPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  remarks: optionalText,
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms to continue" }),
  }),
};

/* ------------------------------------------------------------------ */
/* Course-driven application schema                                    */
/* ------------------------------------------------------------------ */

export type CourseFormConfig = {
  catalogFields: string[];
  requiredFields: string[];
  customFields: unknown;
};

function catalogRule(key: CatalogFieldKey, required: boolean): z.ZodTypeAny {
  const field = FIELD_CATALOG[key];
  const requiredMessage = `${field.label} is required`;

  switch (field.kind) {
    case "subjects": {
      const rule = z.array(z.string().trim().min(1)).max(6);
      return required ? rule.min(1, `Select at least one option`) : rule.default([]);
    }

    case "select": {
      const values = (field.options ?? []).map((o) => o.value);
      // required_error covers a field missing from the payload altogether; an
      // empty choice from the form itself is caught by the refine below.
      const rule = z
        .string({ required_error: `Select your ${field.label.toLowerCase()}` })
        .trim()
        .refine((v) => values.includes(v), {
          message: `Select a valid option`,
        });
      return required
        ? rule
        : z
            .string()
            .trim()
            .optional()
            .or(z.literal(""))
            .transform((v) => (v ? v : undefined))
            .refine((v) => v === undefined || values.includes(v), {
              message: `Select a valid option`,
            });
    }

    case "date": {
      const rule = z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");
      return required ? rule : rule.optional().or(z.literal("").transform(() => undefined));
    }

    default: {
      if (key === "pincode") {
        const rule = z
          .string()
          .trim()
          .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code");
        return required ? rule : rule.optional().or(z.literal("").transform(() => undefined));
      }
      return required
        ? z.string().trim().min(1, requiredMessage).max(300)
        : optionalText;
    }
  }
}

function customRule(field: CustomField): z.ZodTypeAny {
  switch (field.type) {
    case "checkbox":
      return field.required
        ? z.literal(true, { errorMap: () => ({ message: `${field.label} is required` }) })
        : z.boolean().optional().default(false);

    case "number": {
      // An empty input arrives as "", which z.coerce.number would silently turn
      // into 0 — so blank it out first and let `required` do its job.
      const rule = z.preprocess(
        (v) => (v === "" || v === null ? undefined : v),
        z.coerce.number({
          invalid_type_error: "Enter a number",
          required_error: `${field.label} is required`,
        }),
      );
      return field.required ? rule : rule.optional();
    }

    case "select": {
      const rule = z
        .string()
        .trim()
        .refine((v) => field.options.includes(v), { message: "Select a valid option" });
      return field.required
        ? rule
        : z
            .string()
            .trim()
            .optional()
            .or(z.literal(""))
            .transform((v) => (v ? v : undefined))
            .refine((v) => v === undefined || field.options.includes(v), {
              message: "Select a valid option",
            });
    }

    case "date": {
      const rule = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");
      return field.required
        ? rule
        : rule.optional().or(z.literal("").transform(() => undefined));
    }

    default:
      return field.required
        ? z.string().trim().min(1, `${field.label} is required`).max(2000)
        : z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined));
  }
}

/**
 * Builds the validation schema for one course from its stored configuration.
 * The client sends whatever it likes; only fields this course actually enables
 * are accepted, so a tampered payload cannot write to a disabled column.
 */
export function buildApplicationSchema(course: CourseFormConfig) {
  const shape: Record<string, z.ZodTypeAny> = { ...baseShape };

  const required = new Set(course.requiredFields);
  for (const key of course.catalogFields) {
    if (!isCatalogFieldKey(key)) continue;
    shape[key] = catalogRule(key, required.has(key));
  }

  const customFields = parseCustomFields(course.customFields);
  if (customFields.length > 0) {
    const customShape: Record<string, z.ZodTypeAny> = {};
    for (const field of customFields) {
      customShape[field.key] = customRule(field);
    }
    shape.custom = z.object(customShape);
  }

  return z.object(shape);
}

export type ApplicationInput = Record<string, unknown> & {
  fullName: string;
  email: string;
  phone: string;
};

/* ------------------------------------------------------------------ */
/* Other schemas                                                       */
/* ------------------------------------------------------------------ */

export const trackSchema = z.object({
  referenceNo: z.string().trim().min(6, "Enter your reference number").max(32),
  phone: phoneRule,
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(3),
  razorpay_payment_id: z.string().trim().min(3),
  razorpay_signature: z.string().trim().min(3),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const adminUpdateSchema = z.object({
  status: z
    .enum([
      "PENDING_PAYMENT",
      "PAID",
      "UNDER_REVIEW",
      "DOCUMENTS_REQUIRED",
      "FORM_SUBMITTED",
      "ADMIT_CARD_ISSUED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  adminNotes: z.string().trim().max(2000).optional(),
  message: z.string().trim().max(500).optional(),
});

export const notificationSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(3).max(4000),
  isPinned: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const customFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Field key may only use lowercase letters, numbers and _"),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "textarea", "select", "date", "number", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  help: z.string().trim().max(240).optional(),
});

const comparisonRowSchema = z.object({
  label: z.string().trim().min(1, "Every comparison row needs a label").max(120),
  value: z.string().trim().max(120).default(""),
  plain: z.boolean().default(false),
});

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(3, "Enter the full course name").max(160),
  shortName: z.string().trim().min(2, "Enter a short name").max(80),
  tagline: z.string().trim().min(5, "Enter a one-line description").max(300),
  fee: z.coerce
    .number({ invalid_type_error: "Enter the fee in rupees" })
    .int("Fee must be a whole number of rupees")
    .min(1, "Fee must be at least ₹1")
    .max(500000, "Fee looks too high"),
  audience: z.string().trim().min(3, "Describe who this is for").max(200),
  whoCanEnroll: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  offers: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  highlights: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  paymentPageUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  accent: z.enum(["amber", "rose", "sky", "emerald", "violet"]).default("sky"),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  catalogFields: z.array(z.string().trim()).max(40).default([]),
  requiredFields: z.array(z.string().trim()).max(40).default([]),
  customFields: z.array(customFieldSchema).max(20).default([]),
  comparison: z.array(comparisonRowSchema).max(40).default([]),
});

export const adminUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(160),
  name: z.string().trim().min(2, "Enter a name").max(120),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).default("ADMIN"),
  isActive: z.boolean().default(true),
});

/** Flattens a ZodError into { field: message } for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
