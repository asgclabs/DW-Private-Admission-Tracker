"use client";

import type { ReactNode } from "react";

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  help?: string;
  required?: boolean;
};

function FieldWrapper({
  name,
  label,
  error,
  help,
  required,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {help && !error && <p className="help">{help}</p>}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  type = "text",
  placeholder,
  defaultValue,
  maxLength,
  inputMode,
  ...props
}: BaseProps & {
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "tel" | "email";
}) {
  return (
    <FieldWrapper {...props}>
      <input
        id={props.name}
        name={props.name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={props.error ? true : undefined}
        className={`input ${props.error ? "input-error" : ""}`}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  options,
  placeholder = "-- Select --",
  defaultValue,
  ...props
}: BaseProps & {
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <FieldWrapper {...props}>
      <select
        id={props.name}
        name={props.name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={props.error ? true : undefined}
        className={`input ${props.error ? "input-error" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function TextareaField({
  placeholder,
  rows = 3,
  ...props
}: BaseProps & { placeholder?: string; rows?: number }) {
  return (
    <FieldWrapper {...props}>
      <textarea
        id={props.name}
        name={props.name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={props.error ? true : undefined}
        className={`input ${props.error ? "input-error" : ""}`}
      />
    </FieldWrapper>
  );
}

export function SubjectPicker({
  name,
  label,
  options,
  selected,
  onToggle,
  error,
  help,
  required,
  max = 6,
}: {
  name: string;
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (subject: string) => void;
  error?: string;
  help?: string;
  required?: boolean;
  max?: number;
}) {
  return (
    <div>
      <span className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <div
        role="group"
        aria-label={label}
        className={`flex flex-wrap gap-2 rounded-lg border p-3 ${
          error ? "border-rose-400" : "border-slate-300"
        }`}
      >
        {options.map((subject) => {
          const isSelected = selected.includes(subject);
          const isDisabled = !isSelected && selected.length >= max;
          return (
            <button
              key={subject}
              type="button"
              onClick={() => onToggle(subject)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>
      {selected.map((subject) => (
        <input key={subject} type="hidden" name={name} value={subject} />
      ))}
      {help && !error && (
        <p className="help">
          {help} ({selected.length}/{max} selected)
        </p>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ConsentField({ error }: { error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer gap-3 rounded-lg bg-slate-50 p-4">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          value="true"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-xs leading-relaxed text-slate-600">
          I confirm that the details above are correct and I accept the{" "}
          <a href="/terms" target="_blank" className="font-medium text-brand-600 underline">
            Terms of Use
          </a>
          ,{" "}
          <a href="/privacy" target="_blank" className="font-medium text-brand-600 underline">
            Privacy Policy
          </a>{" "}
          and the{" "}
          <a href="/refund" target="_blank" className="font-medium text-brand-600 underline">
            non-refundable fee policy
          </a>
          .
        </span>
      </label>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSection({
  id,
  title,
  description,
  children,
}: {
  /** Anchor for the progress bar's jump links (rendered as section-<id>). */
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id ? `section-${id}` : undefined}
      // Clears the sticky site header plus the form's sticky progress bar.
      className="scroll-mt-48 border-t border-slate-100 pt-8 first:border-0 first:pt-0"
    >
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
