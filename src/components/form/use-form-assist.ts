"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type FocusEvent,
  type RefObject,
  type SetStateAction,
} from "react";

export type FieldKind =
  | "text"
  | "email"
  | "phone"
  | "pincode"
  | "number"
  | "select"
  | "date"
  | "textarea"
  | "subjects"
  | "checkbox"
  | "consent";

export type FieldMeta = {
  name: string;
  label: string;
  required: boolean;
  kind: FieldKind;
  /** Id of the form section the field sits in, for the progress chips. */
  section: string;
};

type FieldValue = string | boolean | string[];

/** Every application draft lives under this prefix, so the success page can clear them all. */
export const DRAFT_PREFIX = "dw-application-draft:";

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PIN = /^\d{6}$/;

/** Fields where only digits make sense — anything else is stripped as it is typed. */
const DIGITS_ONLY = new Set(["phone", "altPhone", "pincode", "passingYear", "examYear"]);

/**
 * Client-side mirror of the server rules in src/lib/validation.ts, with the
 * same messages. The server still validates everything; this only saves the
 * student a round trip and shows problems while they are still on the field.
 */
export function validateValue(meta: FieldMeta, value: FieldValue): string | undefined {
  if (meta.kind === "consent") {
    return value === true ? undefined : "Please accept the terms to continue";
  }
  if (meta.kind === "checkbox") {
    return meta.required && value !== true ? `${meta.label} is required` : undefined;
  }
  if (meta.kind === "subjects") {
    return meta.required && (value as string[]).length === 0
      ? "Select at least one option"
      : undefined;
  }

  const v = String(value ?? "").trim();

  if (v === "") {
    if (!meta.required) return undefined;
    if (meta.name === "fullName") return "Enter your full name";
    if (meta.kind === "email") return "Enter a valid email address";
    if (meta.name === "phone") return "Enter a valid 10-digit Indian mobile number";
    if (meta.kind === "select") return `Select your ${meta.label.toLowerCase()}`;
    return `${meta.label} is required`;
  }

  if (meta.name === "fullName" && v.length < 3) return "Enter your full name";
  if (meta.kind === "email" && !EMAIL.test(v)) return "Enter a valid email address";
  if (meta.kind === "phone" && !PHONE.test(v)) {
    return meta.name === "phone"
      ? "Enter a valid 10-digit Indian mobile number"
      : "Enter a valid 10-digit mobile number";
  }
  if (meta.kind === "pincode" && !PIN.test(v)) return "Enter a valid 6-digit PIN code";
  if (meta.kind === "number" && Number.isNaN(Number(v))) return "Enter a number";
  return undefined;
}

type Draft = {
  values: Record<string, string | boolean>;
  subjects: Record<string, string[]>;
};

export function useFormAssist({
  formRef,
  fields,
  subjectState,
  setSubjectState,
  serverErrors,
  storageKey,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  fields: FieldMeta[];
  subjectState: Record<string, string[]>;
  setSubjectState: Dispatch<SetStateAction<Record<string, string[]>>>;
  serverErrors: Record<string, string>;
  storageKey: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const [restored, setRestored] = useState(false);

  const byName = useRef(new Map<string, FieldMeta>());
  byName.current = new Map(fields.map((field) => [field.name, field]));

  // Always-current copies for the debounced save and DOM readers.
  const subjectsRef = useRef(subjectState);
  subjectsRef.current = subjectState;
  const readyRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A fresh submit's server errors replace whatever was shown before.
  useEffect(() => {
    setErrors(serverErrors);
  }, [serverErrors]);

  const readValue = useCallback(
    (meta: FieldMeta): FieldValue => {
      if (meta.kind === "subjects") return subjectsRef.current[meta.name] ?? [];
      const el = formRef.current?.elements.namedItem(meta.name);
      if (!el || !(el instanceof HTMLElement)) return "";
      if (el instanceof HTMLInputElement && el.type === "checkbox") return el.checked;
      return (el as HTMLInputElement).value ?? "";
    },
    [formRef],
  );

  const recomputeFilled = useCallback(() => {
    const next = new Set<string>();
    for (const meta of byName.current.values()) {
      if (!meta.required) continue;
      if (validateValue(meta, readValue(meta)) === undefined) next.add(meta.name);
    }
    setFilled(next);
  }, [readValue]);

  const setFieldError = useCallback((name: string, message: string | undefined) => {
    setErrors((prev) => {
      if ((prev[name] ?? undefined) === message) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }, []);

  // ---- draft (sessionStorage: survives a refresh, gone when the tab closes) ----

  const saveDraft = useCallback(() => {
    const form = formRef.current;
    if (!form || !readyRef.current) return;
    const values: Draft["values"] = {};
    for (const meta of byName.current.values()) {
      // Consent must be given fresh each time, never restored.
      if (meta.kind === "subjects" || meta.kind === "consent") continue;
      const value = readValue(meta);
      if (value !== "" && value !== false) values[meta.name] = value as string | boolean;
    }
    const draft: Draft = { values, subjects: subjectsRef.current };
    const empty =
      Object.keys(values).length === 0 &&
      Object.values(draft.subjects).every((list) => list.length === 0);
    try {
      if (empty) sessionStorage.removeItem(storageKey);
      else sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Storage can be unavailable (private mode, quota) — the form still works.
    }
  }, [formRef, readValue, storageKey]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveDraft, 400);
  }, [saveDraft]);

  // Restore once on mount.
  useEffect(() => {
    const form = formRef.current;
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      draft = raw ? (JSON.parse(raw) as Draft) : null;
    } catch {
      draft = null;
    }

    if (form && draft) {
      let applied = false;
      for (const [name, value] of Object.entries(draft.values ?? {})) {
        if (!byName.current.has(name)) continue;
        const el = form.elements.namedItem(name);
        if (el instanceof HTMLInputElement && el.type === "checkbox") {
          el.checked = value === true;
          applied = true;
        } else if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        ) {
          el.value = String(value);
          applied = true;
        }
      }
      const subjects: Record<string, string[]> = {};
      for (const [name, list] of Object.entries(draft.subjects ?? {})) {
        if (byName.current.get(name)?.kind === "subjects" && Array.isArray(list) && list.length) {
          subjects[name] = list.slice(0, 6);
          applied = true;
        }
      }
      if (Object.keys(subjects).length) setSubjectState(subjects);
      if (applied) setRestored(true);
    }

    readyRef.current = true;
    recomputeFilled();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // Mount-only by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subject picks are state, not DOM input events, so watch them directly.
  useEffect(() => {
    if (!readyRef.current) return;
    recomputeFilled();
    scheduleSave();
    for (const [name, list] of Object.entries(subjectState)) {
      if (list.length > 0) setFieldError(name, undefined);
    }
  }, [subjectState, recomputeFilled, scheduleSave, setFieldError]);

  // ---- event handlers, attached once to the <form> ----

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLFormElement>) => {
      const target = event.target as unknown as HTMLInputElement;
      const meta = target.name ? byName.current.get(target.name) : undefined;
      if (!meta || meta.kind === "subjects") return;
      setFieldError(meta.name, validateValue(meta, readValue(meta)));
    },
    [readValue, setFieldError],
  );

  const handleChange = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      // The event bubbles up from the field that changed, not the form itself.
      const target = event.target as unknown as HTMLInputElement;
      const meta = target.name ? byName.current.get(target.name) : undefined;
      if (!meta) return;

      if (DIGITS_ONLY.has(meta.name) && /\D/.test(target.value)) {
        target.value = target.value.replace(/\D/g, "");
      }

      const message = validateValue(meta, readValue(meta));
      // Clear an error the moment it is fixed, and judge selects/checkboxes
      // straight away — but don't nag about a text field mid-typing.
      const immediate =
        meta.kind === "select" || meta.kind === "checkbox" || meta.kind === "consent";
      setErrors((prev) => {
        if (!(meta.name in prev) && !immediate) return prev;
        const next = { ...prev };
        if (message) next[meta.name] = message;
        else delete next[meta.name];
        return next;
      });

      recomputeFilled();
      scheduleSave();
    },
    [readValue, recomputeFilled, scheduleSave],
  );

  /** Validates every field; returns the name of the first invalid one, if any. */
  const validateAll = useCallback((): string | null => {
    const next: Record<string, string> = {};
    let first: string | null = null;
    for (const meta of byName.current.values()) {
      const message = validateValue(meta, readValue(meta));
      if (message) {
        next[meta.name] = message;
        first ??= meta.name;
      }
    }
    setErrors(next);
    return first;
  }, [readValue]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    formRef.current?.reset();
    setSubjectState({});
    setErrors({});
    setRestored(false);
    // Let the reset settle before re-reading the fields.
    setTimeout(recomputeFilled, 0);
  }, [formRef, recomputeFilled, setSubjectState, storageKey]);

  return {
    errors,
    filled,
    restored,
    dismissRestored: () => setRestored(false),
    handleBlur,
    handleChange,
    validateAll,
    clearDraft,
  };
}
