/**
 * Brings the three starter courses that already exist in the database up to
 * the Session 2027 copy and the details on their Razorpay payment pages:
 * descriptions (2026 -> 2027), eligibility, highlights, the 13-item Focus offer
 * list and the comparison table.
 *
 * Only touches those specific fields on those three slugs — fees, colours,
 * publish state and every other course are left alone.
 * Safe to re-run.
 *
 *   npm run db:update-2027
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import {
  COMPARISON,
  FOCUS_OFFERS,
  HIGHLIGHTS,
  TAGLINES,
  WHO_CAN_ENROLL,
} from "./course-content-2027";

config({ path: ".env" });

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB ?? "dw_private";

if (!uri) {
  throw new Error("DATABASE_URL is not set. Add your MongoDB connection string to .env.");
}

const UPDATES: Record<string, Record<string, unknown>> = {
  "focus-improvement": {
    tagline: TAGLINES["focus-improvement"],
    whoCanEnroll: [...WHO_CAN_ENROLL["focus-improvement"]],
    offers: [...FOCUS_OFFERS],
    highlights: [...HIGHLIGHTS["focus-improvement"]],
    comparison: [...COMPARISON["focus-improvement"]],
  },
  "focus-er": {
    tagline: TAGLINES["focus-er"],
    offers: [...FOCUS_OFFERS],
    highlights: [...HIGHLIGHTS["focus-er"]],
    comparison: [...COMPARISON["focus-er"]],
  },
  circle: {
    tagline: TAGLINES.circle,
    whoCanEnroll: [...WHO_CAN_ENROLL.circle],
    highlights: [...HIGHLIGHTS.circle],
    comparison: [...COMPARISON.circle],
  },
};

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const courses = client.db(dbName).collection("courses");

  for (const [slug, fields] of Object.entries(UPDATES)) {
    const result = await courses.updateOne(
      { slug },
      { $set: { ...fields, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      console.log(`${slug}: not found (run npm run db:seed to create it)`);
    } else {
      console.log(`${slug}: updated ${Object.keys(fields).join(", ")}`);
    }
  }

  // Form fields are no longer set here; scripts/simplify-form.ts owns them.

  // Anything else still mentioning 2026 was written by hand in the dashboard,
  // so report it rather than silently rewriting someone's copy.
  const stale = await courses
    .find({
      $or: [
        { tagline: /2026/ },
        { name: /2026/ },
        { audience: /2026/ },
        { whoCanEnroll: /2026/ },
        { offers: /2026/ },
        { highlights: /2026/ },
      ],
    })
    .project({ slug: 1 })
    .toArray();

  if (stale.length > 0) {
    console.log(
      `\nStill mention 2026 (edit in the dashboard): ${stale.map((c) => c.slug).join(", ")}`,
    );
  }

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
