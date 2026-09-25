"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ConsentField,
  FormSection,
  SelectField,
  SubjectPicker,
  TextField,
  TextareaField,
} from "./fields";
import { FormActions } from "./form-actions";
import { FormProgress, type SectionProgress } from "./form-progress";
import { useApplicationSubmit } from "./use-application-submit";
import { DRAFT_PREFIX, useFormAssist, type FieldKind, type FieldMeta } from "./use-form-assist";
import type { CourseView } from "@/lib/course-view";
import {
  CBSE_SUBJECTS,
  FIELD_CATALOG,
  GROUP_DESCRIPTIONS,
  GROUP_LABELS,
  isCatalogFieldKey,
  type CatalogField,
} from "@/lib/field-catalog";

const GROUP_ORDER: CatalogField["group"][] = ["student", "address", "cbse"];

function catalogKind(field: CatalogField): FieldKind {
  if (field.kind === "text") return field.key === "pincode" ? "pincode" : "text";
  return field.kind;
}

export function DynamicApplicationForm({
  course,
  prefill = {},
}: {
  course: CourseView;
  /** Starting values carried over from the Program Finder, already validated server-side. */
  prefill?: Record<string, string>;
}) {
  const { loading, formError, errors: serverErrors, submit } = useApplicationSubmit(course);
  const formRef = useRef<HTMLFormElement>(null);

  // Subject pickers are the one control that cannot round-trip through FormData.
  const [subjectState, setSubjectState] = useState<Record<string, string[]>>({});

  const enabled = course.catalogFields.filter(isCatalogFieldKey);
  const required = new Set(course.requiredFields);

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    fields: enabled
      .map((key) => FIELD_CATALOG[key])
      .filter((field) => field.group === group),
  })).filter((section) => section.fields.length > 0);

  // One description of every field in this course's form, in display order —
  // drives live validation, the progress bar and the refresh-safe draft.
  const fields = useMemo<FieldMeta[]>(() => {
    const list: FieldMeta[] = [
      { name: "fullName", label: "Full name", required: true, kind: "text", section: "contact" },
      { name: "email", label: "Email address", required: true, kind: "email", section: "contact" },
      { name: "phone", label: "Mobile number", required: true, kind: "phone", section: "contact" },
      { name: "altPhone", label: "WhatsApp number", required: false, kind: "phone", section: "contact" },
    ];
    for (const section of grouped) {
      for (const field of section.fields) {
        list.push({
          name: field.key,
          label: field.label,
          required: required.has(field.key),
          kind: catalogKind(field),
          section: section.group,
        });
      }
    }
    for (const field of course.customFields) {
      list.push({
        name: `custom.${field.key}`,
        label: field.label,
        required: field.required,
        kind: field.type,
        section: "additional",
      });
    }
    list.push(
      { name: "remarks", label: "Remarks", required: false, kind: "textarea", section: "remarks" },
      { name: "consent", label: "Consent", required: true, kind: "consent", section: "confirm" },
    );
    return list;
    // The course configuration is fixed for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const assist = useFormAssist({
    formRef,
    fields,
    subjectState,
    setSubjectState,
    serverErrors,
    storageKey: `${DRAFT_PREFIX}${course.slug}`,
  });
  const errors = assist.errors;

  const sections: SectionProgress[] = [
    { id: "contact", title: "Contact" },
    ...grouped.map((section) => ({ id: section.group, title: GROUP_LABELS[section.group] })),
    ...(course.customFields.length > 0 ? [{ id: "additional", title: "Additional" }] : []),
    { id: "confirm", title: "Confirm" },
  ].map((section) => {
    const inSection = fields.filter((field) => field.section === section.id && field.required);
    return {
      ...section,
      total: inSection.length,
      done: inSection.filter((field) => assist.filled.has(field.name)).length,
    };
  });

  function toggleSubject(key: string, subject: string) {
    setSubjectState((current) => {
      const selected = current[key] ?? [];
      if (selected.includes(subject)) {
        return { ...current, [key]: selected.filter((s) => s !== subject) };
      }
      if (selected.length >= 6) return current;
      return { ...current, [key]: [...selected, subject] };
    });
  }

  function renderField(field: CatalogField) {
    const isRequired = required.has(field.key);
    const error = errors[field.key];

    switch (field.kind) {
      case "subjects":
        return (
          <div key={field.key} id={field.key} className="scroll-mt-48 sm:col-span-2">
            <SubjectPicker
              name={field.key}
              label={field.label}
              options={CBSE_SUBJECTS}
              selected={subjectState[field.key] ?? []}
              onToggle={(subject) => toggleSubject(field.key, subject)}
              required={isRequired}
              help={field.help}
              error={error}
            />
          </div>
        );

      case "select":
        return (
          <SelectField
            key={field.key}
            name={field.key}
            label={field.label}
            options={field.options ?? []}
            defaultValue={prefill[field.key]}
            required={isRequired}
            error={error}
          />
        );

      case "textarea":
        return (
          <div key={field.key} className={field.wide ? "sm:col-span-2" : undefined}>
            <TextareaField
              name={field.key}
              label={field.label}
              placeholder={field.placeholder}
              required={isRequired}
              help={field.help}
              error={error}
            />
          </div>
        );

      case "date":
        return (
          <TextField
            key={field.key}
            name={field.key}
            label={field.label}
            type="date"
            required={isRequired}
            error={error}
          />
        );

      default:
        return (
          <TextField
            key={field.key}
            name={field.key}
            label={field.label}
            placeholder={field.placeholder}
            inputMode={field.inputMode}
            maxLength={field.maxLength}
            required={isRequired}
            help={field.help}
            error={error}
          />
        );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Catch mistakes here first — no round trip, and the student lands on the field.
    const firstInvalid = assist.validateAll();
    if (firstInvalid) {
      const el = document.getElementById(firstInvalid);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        el.focus({ preventScroll: true });
      }
      return;
    }

    const data = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      altPhone: data.get("altPhone"),
      remarks: data.get("remarks"),
      consent: data.get("consent") === "true",
    };

    for (const key of enabled) {
      const field = FIELD_CATALOG[key];
      payload[key] =
        field.kind === "subjects" ? (subjectState[key] ?? []) : (data.get(key) ?? "");
    }

    if (course.customFields.length > 0) {
      const custom: Record<string, unknown> = {};
      for (const field of course.customFields) {
        const name = `custom.${field.key}`;
        custom[field.key] =
          field.type === "checkbox" ? data.get(name) === "on" : (data.get(name) ?? "");
      }
      payload.custom = custom;
    }

    await submit(payload);
  }

  const invalidCount = Object.keys(errors).length;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={assist.handleBlur}
      onChange={assist.handleChange}
      noValidate
      className="space-y-8"
    >
      <FormProgress sections={sections} />

      {assist.restored && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <span>We kept the details you had already entered in this tab.</span>
          <span className="flex gap-3 text-xs font-semibold">
            <button type="button" onClick={assist.dismissRestored} className="hover:underline">
              Keep them
            </button>
            <button type="button" onClick={assist.clearDraft} className="text-sky-600 hover:underline">
              Start fresh
            </button>
          </span>
        </div>
      )}

      {Object.keys(prefill).length > 0 && !assist.restored && (
        <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          We&apos;ve filled in your class and category from the Program Finder &mdash; check
          they&apos;re right.
        </p>
      )}

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      <FormSection
        id="contact"
        title="Contact details"
        description="How we reach you about your application."
      >
        <TextField
          name="fullName"
          label="Full name"
          placeholder="Your name as on the mark sheet"
          required
          error={errors.fullName}
        />
        <TextField
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          error={errors.email}
        />
        <TextField
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
          required
          error={errors.phone}
        />
        <TextField
          name="altPhone"
          label="Preferred WhatsApp number"
          type="tel"
          inputMode="tel"
          maxLength={10}
          placeholder="Optional"
          error={errors.altPhone}
        />
      </FormSection>

      {grouped.map((section) => (
        <FormSection
          key={section.group}
          id={section.group}
          title={GROUP_LABELS[section.group]}
          description={GROUP_DESCRIPTIONS[section.group]}
        >
          {section.fields.map(renderField)}
        </FormSection>
      ))}

      {course.customFields.length > 0 && (
        <FormSection
          id="additional"
          title="Additional information"
          description={`Specific to ${course.shortName}.`}
        >
          {course.customFields.map((field) => {
            const name = `custom.${field.key}`;
            const error = errors[`custom.${field.key}`];

            if (field.type === "checkbox") {
              return (
                <div key={field.key} className="sm:col-span-2">
                  <label className="flex cursor-pointer gap-3 rounded-lg bg-slate-50 p-4">
                    <input
                      id={name}
                      name={name}
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-700">
                      {field.label}
                      {field.required && <span className="ml-0.5 text-rose-500">*</span>}
                      {field.help && (
                        <span className="mt-0.5 block text-xs text-slate-500">{field.help}</span>
                      )}
                    </span>
                  </label>
                  {error && <p className="error-text">{error}</p>}
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <SelectField
                  key={field.key}
                  name={name}
                  label={field.label}
                  options={field.options.map((option) => ({ value: option, label: option }))}
                  required={field.required}
                  help={field.help}
                  error={error}
                />
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.key} className="sm:col-span-2">
                  <TextareaField
                    name={name}
                    label={field.label}
                    required={field.required}
                    help={field.help}
                    error={error}
                  />
                </div>
              );
            }

            return (
              <TextField
                key={field.key}
                name={name}
                label={field.label}
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                inputMode={field.type === "number" ? "numeric" : undefined}
                required={field.required}
                help={field.help}
                error={error}
              />
            );
          })}
        </FormSection>
      )}

      <FormSection
        id="remarks"
        title="Anything else?"
        description="Optional, but it helps us prepare."
      >
        <div className="sm:col-span-2">
          <TextareaField
            name="remarks"
            label="Anything we should know?"
            placeholder="Previous attempts, marks, special requests"
            error={errors.remarks}
          />
        </div>
      </FormSection>

      <div id="section-confirm" className="scroll-mt-48 border-t border-slate-100 pt-8">
        <ConsentField error={errors.consent} />
        {invalidCount > 0 && (
          <p className="mt-4 text-xs font-medium text-rose-600" role="status">
            {invalidCount === 1
              ? "1 field needs attention above."
              : `${invalidCount} fields need attention above.`}
          </p>
        )}
        <FormActions loading={loading} fee={course.fee} />
      </div>
    </form>
  );
}
