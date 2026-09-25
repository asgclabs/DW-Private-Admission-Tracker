/** Guide content for the landing page — the "what is my category" explainer. */
export const CATEGORIES = [
  {
    key: "compartment",
    title: "Compartment",
    subtitle: "Failed in one subject (up to two in Class 10)",
    body:
      "CBSE places you in the compartment category when you fail only one subject (up to two in Class 10). You appear only in those subjects in the compartment exam and your original pass year is retained.",
    points: [
      "Only the failed subject(s) are re-attempted",
      "Form is filled through the school or as a private candidate",
      "Result is declared as PASS once you clear it",
    ],
    program: "circle" as const,
  },
  {
    key: "improvement",
    title: "Improvement",
    subtitle: "Passed, but want better marks",
    body:
      "Already passed but unhappy with your percentage? The improvement category lets you re-appear in one or more subjects the following year as a private candidate, keeping the better of the two scores.",
    points: [
      "Available in the year immediately after passing",
      "You may appear in one or more subjects",
      "The higher score is the one you carry forward",
    ],
    program: "focus-improvement" as const,
  },
  {
    key: "essential-repeat",
    title: "Essential Repeat (ER)",
    subtitle: "Failed in two or more subjects (three or more in Class 10)",
    body:
      "If you could not clear two or more subjects (three or more in Class 10), CBSE marks the result as Essential Repeat. The whole year is repeated and all subjects are attempted again in the next board exam.",
    points: [
      "All subjects are attempted again",
      "You appear in the next annual board examination",
      "Private candidate registration is allowed",
    ],
    program: "focus-er" as const,
  },
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Choose your program",
    body: "Pick Focus 4.0 or Circle 4.0 depending on whether you need full mentorship or only form filling support.",
  },
  {
    step: "02",
    title: "Fill the application",
    body: "Share your personal details, CBSE roll number and the subjects you are appearing in. It takes about three minutes.",
  },
  {
    step: "03",
    title: "Pay securely",
    body: "Pay the one-time fee through Razorpay. UPI, cards, net banking and wallets are all accepted.",
  },
  {
    step: "04",
    title: "Get your reference number",
    body: "A unique reference number is issued instantly. Keep it safe — it is how you track everything.",
  },
  {
    step: "05",
    title: "We fill your CBSE form",
    body: "Our team completes the private candidate form for your category and confirms the submission with you.",
  },
  {
    step: "06",
    title: "Track till admit card",
    body: "Follow the status on the tracking page right up to the admit card and exam day guidance.",
  },
];

export const FAQS = [
  {
    q: "Who is a CBSE private candidate?",
    a: "A private candidate appears for the board examination without being enrolled in a regular school for that year. Compartment, improvement and essential repeat students all apply in this category, along with those who have discontinued studies and wish to complete their board exam.",
  },
  {
    q: "Which program should I choose?",
    a: "Choose Circle 4.0 (₹499) if you only need the CBSE form filled correctly along with admit card and exam updates. Choose Focus 4.0 (₹999) if you also want study material, regular meetings and personal mentorship through the year.",
  },
  {
    q: "Can I apply for improvement in more than one subject?",
    a: "Yes. CBSE permits improvement in one or more subjects in the year immediately following the year you passed. Mention every subject in the application form so we fill the form accordingly.",
  },
  {
    q: "What documents do I need to keep ready?",
    a: "Keep your previous mark sheet, admit card of the last attempt, Aadhaar, a passport-size photograph and your signature scan ready. We will tell you exactly what to send after your application is reviewed.",
  },
  {
    q: "How will I know my form has been submitted?",
    a: "Your application status moves to “CBSE form submitted” on the tracking page and our team confirms it with you directly. You can check the status anytime with your reference number and mobile number.",
  },
  {
    q: "Is the fee refundable?",
    a: "No. As stated on our payment pages, the services are non-refundable once the program has started. Please read the cancellation and refund policy before paying.",
  },
  {
    q: "Are you affiliated with CBSE?",
    a: "No. Doon Winner Academy is an independent guidance service. We help you with the application process, preparation and updates. All official decisions, dates and results come from CBSE.",
  },
];
