/**
 * The fixed set of fields a super-admin can switch on for a course.
 *
 * Every entry maps to a real column on Application, so these answers stay
 * queryable, filterable and exportable — unlike custom fields, which land in a
 * JSON blob. Prefer adding a field here over a custom field when it is something
 * more than one course will ever ask for.
 */

export type CatalogFieldKey =
  | "dateOfBirth"
  | "gender"
  | "fatherName"
  | "motherName"
  | "address"
  | "city"
  | "state"
  | "pincode"
  | "rollNo"
  | "previousSchool"
  | "schoolCode"
  | "passingYear"
  | "examYear"
  | "studentCategory"
  | "studentClass"
  | "subjectCombination"
  | "subjects"
  | "improvementSubjects"
  | "failedSubjects";

export type CatalogFieldKind = "text" | "textarea" | "date" | "select" | "subjects";

export type CatalogField = {
  key: CatalogFieldKey;
  label: string;
  group: "student" | "address" | "cbse";
  kind: CatalogFieldKind;
  placeholder?: string;
  help?: string;
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  options?: readonly { value: string; label: string }[];
  /** Full-width in the two-column form grid. */
  wide?: boolean;
};

export const SUBJECT_COMBINATIONS = [
  { value: "PCM", label: "PCM (Physics, Chemistry, Maths)" },
  { value: "PCB", label: "PCB (Physics, Chemistry, Biology)" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "HUMANITIES", label: "Humanities" },
] as const;

export const STUDENT_CATEGORIES = [
  { value: "COMPARTMENT", label: "Compartment" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "ESSENTIAL_REPEAT", label: "Failure / Essential Repeat (ER)" },
] as const;

export const STUDENT_CLASSES = [
  { value: "Class 12th", label: "Class 12th" },
  { value: "Class 10th", label: "Class 10th" },
] as const;

export const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
] as const;

export const CBSE_SUBJECTS = [
  "English",
  "Hindi",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Accountancy",
  "Business Studies",
  "Economics",
  "History",
  "Political Science",
  "Geography",
  "Psychology",
  "Sociology",
  "Computer Science",
  "Informatics Practices",
  "Physical Education",
  "Painting",
] as const;

export const FIELD_CATALOG: Record<CatalogFieldKey, CatalogField> = {
  dateOfBirth: {
    key: "dateOfBirth",
    label: "Date of birth",
    group: "student",
    kind: "date",
  },
  gender: {
    key: "gender",
    label: "Gender",
    group: "student",
    kind: "select",
    options: GENDERS,
  },
  fatherName: {
    key: "fatherName",
    label: "Father's name",
    group: "student",
    kind: "text",
  },
  motherName: {
    key: "motherName",
    label: "Mother's name",
    group: "student",
    kind: "text",
  },

  address: {
    key: "address",
    label: "Address",
    group: "address",
    kind: "textarea",
    placeholder: "House / street / locality",
    wide: true,
  },
  city: { key: "city", label: "City", group: "address", kind: "text" },
  state: { key: "state", label: "State", group: "address", kind: "text" },
  pincode: {
    key: "pincode",
    label: "PIN code",
    group: "address",
    kind: "text",
    inputMode: "numeric",
    maxLength: 6,
  },

  rollNo: {
    key: "rollNo",
    label: "CBSE roll number",
    group: "cbse",
    kind: "text",
    placeholder: "Roll number of the last attempt",
  },
  previousSchool: {
    key: "previousSchool",
    label: "School name",
    group: "cbse",
    kind: "text",
  },
  schoolCode: {
    key: "schoolCode",
    label: "School code",
    group: "cbse",
    kind: "text",
    placeholder: "If you know it",
  },
  passingYear: {
    key: "passingYear",
    label: "Year of passing / last attempt",
    group: "cbse",
    kind: "text",
    inputMode: "numeric",
    maxLength: 4,
    placeholder: "e.g. 2025",
  },
  examYear: {
    key: "examYear",
    label: "Exam year",
    group: "cbse",
    kind: "text",
    inputMode: "numeric",
    maxLength: 4,
    placeholder: "e.g. 2027",
  },
  studentCategory: {
    key: "studentCategory",
    label: "I am applying as",
    group: "cbse",
    kind: "select",
    options: STUDENT_CATEGORIES,
  },
  studentClass: {
    key: "studentClass",
    label: "Class",
    group: "cbse",
    kind: "select",
    options: STUDENT_CLASSES,
  },
  subjectCombination: {
    key: "subjectCombination",
    label: "Subject combination",
    group: "cbse",
    kind: "select",
    options: SUBJECT_COMBINATIONS,
  },
  subjects: {
    key: "subjects",
    label: "Subjects you are appearing in",
    group: "cbse",
    kind: "subjects",
    help: "Select the subjects to be entered in the form",
    wide: true,
  },
  improvementSubjects: {
    key: "improvementSubjects",
    label: "Subjects you want to improve",
    group: "cbse",
    kind: "subjects",
    help: "Pick every subject you plan to re-appear in",
    wide: true,
  },
  failedSubjects: {
    key: "failedSubjects",
    label: "Subjects you could not clear",
    group: "cbse",
    kind: "subjects",
    help: "Helps us plan where to focus first",
    wide: true,
  },
};

export const CATALOG_FIELD_KEYS = Object.keys(FIELD_CATALOG) as CatalogFieldKey[];

export const GROUP_LABELS: Record<CatalogField["group"], string> = {
  student: "Student details",
  address: "Address",
  cbse: "CBSE record",
};

export const GROUP_DESCRIPTIONS: Record<CatalogField["group"], string> = {
  student: "As printed on your CBSE documents.",
  address: "Where we should send any physical material.",
  cbse: "Needed to fill the form exactly as CBSE expects.",
};

export function isCatalogFieldKey(value: string): value is CatalogFieldKey {
  return value in FIELD_CATALOG;
}

/* ------------------------------------------------------------------ */
/* Custom fields                                                       */
/* ------------------------------------------------------------------ */

export const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "checkbox", label: "Yes / no checkbox" },
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]["value"];

export type CustomField = {
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options: string[];
  help?: string;
};

/** Parses the Json column defensively — a malformed entry must not break the form. */
export function parseCustomFields(value: unknown): CustomField[] {
  if (!Array.isArray(value)) return [];

  const out: CustomField[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;

    const key = typeof record.key === "string" ? record.key : "";
    const label = typeof record.label === "string" ? record.label : "";
    const type = record.type as CustomFieldType;

    if (!key || !label) continue;
    if (!CUSTOM_FIELD_TYPES.some((t) => t.value === type)) continue;

    out.push({
      key,
      label,
      type,
      required: record.required === true,
      options: Array.isArray(record.options)
        ? record.options.filter((o): o is string => typeof o === "string")
        : [],
      help: typeof record.help === "string" ? record.help : undefined,
    });
  }
  return out;
}

/** Turns a label into a stable storage key, e.g. "Guardian occupation" -> "guardian_occupation". */
export function toFieldKey(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "field"
  );
}
