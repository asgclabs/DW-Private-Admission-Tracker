"use client";

import { useState, type FormEvent } from "react";
import {
  ConsentField,
  FormSection,
  SelectField,
  SubjectPicker,
  TextField,
  TextareaField,
} from "./fields";
import { FormActions } from "./form-actions";
import { useApplicationSubmit } from "./use-application-submit";
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

export function DynamicApplicationForm({ course }: { course: CourseView }) {
  const { loading, formError, errors, submit } = useApplicationSubmit(course);

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
          <div key={field.key} className="sm:col-span-2">
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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      <FormSection title="Contact details" description="How we reach you about your application.">
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
          label="Alternate mobile number"
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
          title={GROUP_LABELS[section.group]}
          description={GROUP_DESCRIPTIONS[section.group]}
        >
          {section.fields.map(renderField)}
        </FormSection>
      ))}

      {course.customFields.length > 0 && (
        <FormSection
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

      <FormSection title="Anything else?" description="Optional, but it helps us prepare.">
        <div className="sm:col-span-2">
          <TextareaField
            name="remarks"
            label="Anything we should know?"
            placeholder="Previous attempts, marks, special requests"
            error={errors.remarks}
          />
        </div>
      </FormSection>

      <div className="border-t border-slate-100 pt-8">
        <ConsentField error={errors.consent} />
        <FormActions loading={loading} fee={course.fee} />
      </div>
    </form>
  );
}
