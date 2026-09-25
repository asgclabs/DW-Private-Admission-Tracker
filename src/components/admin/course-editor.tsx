"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ACCENTS, type CourseView } from "@/lib/course-view";
import {
  CATALOG_FIELD_KEYS,
  CUSTOM_FIELD_TYPES,
  FIELD_CATALOG,
  GROUP_LABELS,
  toFieldKey,
  type CatalogFieldKey,
  type CustomField,
  type CustomFieldType,
} from "@/lib/field-catalog";
import { ListBuilder } from "./list-builder";
import { ComparisonBuilder } from "./comparison-builder";
import type { ComparisonRow } from "@/lib/types";

const GROUPS: (typeof FIELD_CATALOG)[CatalogFieldKey]["group"][] = ["student", "address", "cbse"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function CourseEditor({ course }: { course?: CourseView }) {
  const router = useRouter();
  const isEdit = Boolean(course);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(course));

  const [whoCanEnroll, setWhoCanEnroll] = useState<string[]>(course?.whoCanEnroll ?? []);
  const [offers, setOffers] = useState<string[]>(course?.offers ?? []);
  const [highlights, setHighlights] = useState<string[]>(course?.highlights ?? []);

  const [enabled, setEnabled] = useState<string[]>(course?.catalogFields ?? []);
  const [required, setRequired] = useState<string[]>(course?.requiredFields ?? []);
  const [customFields, setCustomFields] = useState<CustomField[]>(course?.customFields ?? []);
  const [comparison, setComparison] = useState<ComparisonRow[]>(course?.comparison ?? []);

  function toggleField(key: string) {
    setEnabled((current) => {
      if (current.includes(key)) {
        setRequired((r) => r.filter((k) => k !== key));
        return current.filter((k) => k !== key);
      }
      return [...current, key];
    });
  }

  function toggleRequired(key: string) {
    setRequired((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  }

  function addCustomField() {
    setCustomFields((current) => [
      ...current,
      { key: "", label: "", type: "text", required: false, options: [] },
    ]);
  }

  function updateCustomField(index: number, patch: Partial<CustomField>) {
    setCustomFields((current) =>
      current.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    );
  }

  function removeCustomField(index: number) {
    setCustomFields((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setLoading(true);
    setFormError(null);
    setErrors({});

    const payload = {
      slug: slug || slugify(String(data.get("shortName") ?? "")),
      name: data.get("name"),
      shortName: data.get("shortName"),
      tagline: data.get("tagline"),
      fee: data.get("fee"),
      audience: data.get("audience"),
      whoCanEnroll,
      offers,
      highlights,
      paymentPageUrl: data.get("paymentPageUrl"),
      accent: data.get("accent"),
      isActive: data.get("isActive") === "on",
      isFeatured: data.get("isFeatured") === "on",
      sortOrder: data.get("sortOrder") || 0,
      catalogFields: enabled,
      requiredFields: required,
      // Rows left without a label are dropped rather than failing the whole save.
      comparison: comparison.filter((row) => row.label.trim() !== ""),
      customFields: customFields.map((field) => ({
        ...field,
        key: field.key || toFieldKey(field.label),
      })),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/courses/${course!.id}` : "/api/admin/courses",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await res.json();

      if (!res.ok) {
        setFormError(result.message ?? "Could not save the course.");
        setErrors(result.errors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      router.push("/admin/courses");
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      {/* Basics */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Course details</h2>
        <p className="mt-1 text-xs text-slate-500">
          This is what students see on the home page and the course page.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="label">
              Full name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              defaultValue={course?.name}
              placeholder="Focus 5.0 — Compartment Students"
              className={`input ${errors.name ? "input-error" : ""}`}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="shortName" className="label">
              Short name <span className="text-rose-500">*</span>
            </label>
            <input
              id="shortName"
              name="shortName"
              defaultValue={course?.shortName}
              placeholder="Focus 5.0"
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={`input ${errors.shortName ? "input-error" : ""}`}
            />
            {errors.shortName && <p className="error-text">{errors.shortName}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="label">
              URL slug <span className="text-rose-500">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="focus-5"
              className={`input ${errors.slug ? "input-error" : ""}`}
            />
            <p className="help">/apply/{slug || "your-slug"}</p>
            {errors.slug && <p className="error-text">{errors.slug}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tagline" className="label">
              One-line description <span className="text-rose-500">*</span>
            </label>
            <input
              id="tagline"
              name="tagline"
              defaultValue={course?.tagline}
              placeholder="Clear your compartment exam in 2027 with full support."
              className={`input ${errors.tagline ? "input-error" : ""}`}
            />
            {errors.tagline && <p className="error-text">{errors.tagline}</p>}
          </div>

          <div>
            <label htmlFor="fee" className="label">
              Fee in &#8377; <span className="text-rose-500">*</span>
            </label>
            <input
              id="fee"
              name="fee"
              type="number"
              min={1}
              defaultValue={course?.fee ?? 999}
              className={`input ${errors.fee ? "input-error" : ""}`}
            />
            <p className="help">Charged through Razorpay. Students cannot change this.</p>
            {errors.fee && <p className="error-text">{errors.fee}</p>}
          </div>

          <div>
            <label htmlFor="audience" className="label">
              Who it is for <span className="text-rose-500">*</span>
            </label>
            <input
              id="audience"
              name="audience"
              defaultValue={course?.audience}
              placeholder="Compartment students appearing in 2027"
              className={`input ${errors.audience ? "input-error" : ""}`}
            />
            {errors.audience && <p className="error-text">{errors.audience}</p>}
          </div>

          <div>
            <label htmlFor="accent" className="label">
              Card colour
            </label>
            <select
              id="accent"
              name="accent"
              defaultValue={course?.accent ?? "sky"}
              className="input"
            >
              {ACCENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="label">
              Display order
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={course?.sortOrder ?? 0}
              className="input"
            />
            <p className="help">Lower numbers appear first.</p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="paymentPageUrl" className="label">
              Razorpay payment page link (optional)
            </label>
            <input
              id="paymentPageUrl"
              name="paymentPageUrl"
              defaultValue={course?.paymentPageUrl ?? ""}
              placeholder="https://rzp.io/rzp/..."
              className={`input ${errors.paymentPageUrl ? "input-error" : ""}`}
            />
            <p className="help">
              Kept for reference only — payments go through Razorpay Checkout.
            </p>
            {errors.paymentPageUrl && <p className="error-text">{errors.paymentPageUrl}</p>}
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="card space-y-6 p-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">What students get</h2>
          <p className="mt-1 text-xs text-slate-500">
            Shown as the tick list on the course card.
          </p>
          <div className="mt-4">
            <ListBuilder
              items={offers}
              onChange={setOffers}
              placeholder="CBSE form filling support"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold text-slate-900">Who can enroll</h2>
          <div className="mt-4">
            <ListBuilder
              items={whoCanEnroll}
              onChange={setWhoCanEnroll}
              placeholder="Students who failed in one subject"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold text-slate-900">Why students pick this</h2>
          <div className="mt-4">
            <ListBuilder
              items={highlights}
              onChange={setHighlights}
              placeholder="Deadline reminders so nothing is missed"
            />
          </div>
        </div>
      </section>

      {/* Form fields */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Application form fields</h2>
        <p className="mt-1 text-xs text-slate-500">
          Name, email and mobile number are always collected. Tick anything else this course
          needs, then mark which of those are compulsory.
        </p>

        <div className="mt-5 space-y-6">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {GROUP_LABELS[group]}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {CATALOG_FIELD_KEYS.filter((key) => FIELD_CATALOG[key].group === group).map(
                  (key) => {
                    const isOn = enabled.includes(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                          isOn ? "border-brand-200 bg-brand-50" : "border-slate-200"
                        }`}
                      >
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggleField(key)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          {FIELD_CATALOG[key].label}
                        </label>

                        {isOn && (
                          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
                            <input
                              type="checkbox"
                              checked={required.includes(key)}
                              onChange={() => toggleRequired(key)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            Required
                          </label>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom fields */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Extra questions</h2>
            <p className="mt-1 text-xs text-slate-500">
              Anything not in the list above. Answers appear in the admin record and the CSV
              export.
            </p>
          </div>
          <button type="button" onClick={addCustomField} className="btn-ghost px-3 py-2 text-xs">
            Add question
          </button>
        </div>

        {errors.customFields && <p className="error-text">{errors.customFields}</p>}

        <div className="mt-5 space-y-4">
          {customFields.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
              No extra questions. Most courses do not need any.
            </p>
          )}

          {customFields.map((field, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <label className="label text-xs">Question</label>
                  <input
                    value={field.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      updateCustomField(index, {
                        label,
                        key: field.key || toFieldKey(label),
                      });
                    }}
                    placeholder="Guardian's occupation"
                    className="input"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="label text-xs">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateCustomField(index, { type: e.target.value as CustomFieldType })
                    }
                    className="input"
                  >
                    {CUSTOM_FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="label text-xs">Storage key</label>
                  <input
                    value={field.key}
                    onChange={(e) =>
                      updateCustomField(index, { key: toFieldKey(e.target.value) })
                    }
                    className="input font-mono text-xs"
                  />
                </div>

                <div className="flex items-end justify-between gap-2 sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    aria-label="Remove question"
                    className="mb-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    ✕
                  </button>
                </div>

                {field.type === "select" && (
                  <div className="sm:col-span-12">
                    <label className="label text-xs">Dropdown options</label>
                    <ListBuilder
                      items={field.options}
                      onChange={(options) => updateCustomField(index, { options })}
                      placeholder="Option text"
                    />
                  </div>
                )}

                <div className="sm:col-span-12">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    Required
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Comparison table</h2>
        <p className="mt-1 text-xs text-slate-500">
          This course&apos;s column in the table on the home page. Type <strong>Yes</strong>, or
          a note such as <strong>Monthly</strong>, to show a tick; use &mdash; for &ldquo;not
          included&rdquo;. Tick <strong>Text</strong> for free text without a tick, like
          &ldquo;Who it is for&rdquo;. The fee row is added automatically. Use the same row label
          on every course so they line up.
        </p>
        <div className="mt-5">
          <ComparisonBuilder rows={comparison} onChange={setComparison} />
        </div>
      </section>

      {/* Publish */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Publishing</h2>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-4">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={course?.isActive ?? false}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">
              Live on the website
              <span className="mt-0.5 block text-xs text-slate-500">
                When on, this course appears on the home page and starts accepting applications
                and payments immediately.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-4">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={course?.isFeatured ?? false}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">
              Mark as &ldquo;Most popular&rdquo;
              <span className="mt-0.5 block text-xs text-slate-500">
                Highlights this card on the home page.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  );
}
