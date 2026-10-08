/**
 * Session 2027 course copy. Offers and the comparison table come from
 * "CBSE Track Application (Need Changes).pdf"; descriptions, eligibility, the
 * "why choose us" points come from the three Razorpay payment pages, with 2026
 * changed to 2027 as the PDF requires.
 * Shared by the seed (fresh databases) and update-2027-content (databases that
 * already hold the three starter courses), so both always agree.
 */
import type { ComparisonRow } from "../src/lib/types";

/** "What We Offer in Focus Batch" — applies to both Focus 4.0 courses. */
export const FOCUS_OFFERS = [
  "CBSE Form Filling Support",
  "Regular Meetings",
  "Study Materials",
  "Personal Mentorship",
  "Subject-wise Notes",
  "Updated Syllabus",
  "Board Exam Preparation Guide",
  "Personal Counselling for Higher Studies",
  "Regular Practice Papers",
  "College Admission Guidance",
  "Application & Exam Updates",
  "Admit card information and timely updates",
  "And Much More!",
];

/** The payment pages' "Program Description" / lead paragraph, year moved to 2027. */
export const TAGLINES = {
  "focus-improvement":
    "Want to improve CBSE Board exam marks in 2027? We've got you covered! Our comprehensive program ensures your success.",
  // The ER page reads "Want to Pass CBSE Board exam marks" — fixed to read properly.
  "focus-er":
    "Want to pass the CBSE Board exam in 2027? We've got you covered! Our comprehensive program ensures your success.",
  circle:
    "Are you a CBSE Private student aiming for success in the 2027 exams? We're here to make the process smooth and hassle-free for you.",
} as const;

/**
 * "Who can enroll". Focus ER is not listed: its payment page repeats the
 * Improvement wording ("Those who want to improve their marks"), which is a
 * copy-paste slip, so the existing ER wording stays.
 */
export const WHO_CAN_ENROLL = {
  "focus-improvement": ["Those who want to improve their marks"],
  circle: [
    "Compartment students",
    "Improvement students",
    "Essential Repeat students",
    "Any CBSE private candidate for 2027",
  ],
} as const;

/** Closing lines of both Focus payment pages. */
const FOCUS_PAGE_LINES = [
  "Plus, we're just a call away for any assistance!",
  "Doon Winner — your trusted guide for exam completion and results!",
];

export const HIGHLIGHTS = {
  "focus-improvement": [...FOCUS_PAGE_LINES],
  // The subject-combination line is the "Personalized Subject Combination
  // Support" row of the comparison table, which the ER form is built around.
  "focus-er": [
    ...FOCUS_PAGE_LINES,
    "Personalized subject combination support (PCM, PCB, Commerce, Humanities)",
  ],
  // Circle's "Why Choose Us" section, in the page's own words.
  circle: [
    "Simplified Process — we break it down into simple steps, so you don't feel overwhelmed.",
    "Timely Updates — never miss a deadline with our timely notifications.",
    "Community Support — connect with a community of like-minded students for guidance and motivation.",
    "Strict Confidentiality — we understand the importance of your privacy. Rest assured, your personal information is safe with us.",
  ],
} as const;

/**
 * What every program's application form asks for, on top of the fixed name,
 * mobile number and email. Kept deliberately short — the team collects the
 * CBSE details itself when filling the form. All of them are required.
 */
export const APPLICATION_FORM_FIELDS = ["fatherName", "motherName", "state", "district"];

const DASH = "—";

/**
 * Rows of the comparison table, in display order. Each entry is
 * [label, Focus Improvement, Focus ER / Failure, Circle]. "Fee" is not here —
 * it is always taken live from each course's fee so it can never go stale.
 */
const ROWS: { label: string; plain?: boolean; values: [string, string, string] }[] = [
  {
    label: "Who it is for",
    plain: true,
    values: [
      "Students who want to improve their CBSE Board exam marks",
      "ER / Failed students preparing for the next Board exam",
      "CBSE Private students who need form-filling & exam support",
    ],
  },
  { label: "CBSE Form Filling Support", values: ["Yes", "Yes", "Yes"] },
  { label: "Regular Meetings", values: ["Yes", "Yes", "Monthly"] },
  { label: "Study Materials", values: ["Yes", "Yes", DASH] },
  { label: "Personal Mentorship", values: ["Yes", "Yes", DASH] },
  { label: "Subject-wise Notes", values: ["Yes", "Yes", "Group Notes"] },
  { label: "Updated Syllabus", values: ["Yes", "Yes", DASH] },
  { label: "Board Exam Preparation Guide", values: ["Yes", "Yes", "Exam Guidance"] },
  { label: "Personal Counselling for Higher Studies", values: ["Yes", "Yes", DASH] },
  { label: "Regular Practice Papers", values: ["Yes", "Yes", DASH] },
  { label: "College Admission Guidance", values: ["Yes", "Yes", DASH] },
  { label: "Application & Exam Updates", values: ["Yes", "Yes", "Yes"] },
  { label: "Admit Card Information & Timely Updates", values: ["Yes", "Yes", "Yes"] },
  { label: "Exclusive Online Community", values: ["Yes", "Yes", "Yes"] },
  {
    label: "Form Filling Assistance — We Fill the Form for You",
    values: [DASH, DASH, "Yes"],
  },
  { label: "Personalized Subject Combination Support", values: ["Yes", "Yes", DASH] },
  { label: "And Much More!", values: ["Yes", "Yes", DASH] },
];

function column(index: 0 | 1 | 2): ComparisonRow[] {
  return ROWS.map((row) => ({
    label: row.label,
    value: row.values[index],
    ...(row.plain ? { plain: true } : {}),
  }));
}

export const COMPARISON = {
  "focus-improvement": column(0),
  "focus-er": column(1),
  circle: column(2),
} as const;
