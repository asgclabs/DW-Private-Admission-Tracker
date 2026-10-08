/**
 * Sets every course's application form to the short version: name, mobile and
 * email (always asked) plus father's name, mother's name, state and district,
 * all required. Removes the other catalog fields and any custom fields.
 *
 * Prints each course's previous settings first, so they can be restored from
 * the course editor if a field is ever needed again. Safe to re-run.
 *
 *   npm run db:simplify-form
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import { APPLICATION_FORM_FIELDS } from "./course-content-2027";

config({ path: ".env" });

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB ?? "dw_private";

if (!uri) {
  throw new Error("DATABASE_URL is not set. Add your MongoDB connection string to .env.");
}

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const courses = client.db(dbName).collection("courses");

  const all = await courses
    .find({})
    .project({ slug: 1, catalogFields: 1, requiredFields: 1, customFields: 1 })
    .toArray();

  console.log("Previous form settings:");
  console.log(JSON.stringify(all, null, 2));

  const result = await courses.updateMany(
    {},
    {
      $set: {
        catalogFields: [...APPLICATION_FORM_FIELDS],
        requiredFields: [...APPLICATION_FORM_FIELDS],
        customFields: [],
        updatedAt: new Date(),
      },
    },
  );

  console.log(
    `\nUpdated ${result.modifiedCount} of ${result.matchedCount} courses to: ` +
      `name, mobile, email + ${APPLICATION_FORM_FIELDS.join(", ")}`,
  );

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
