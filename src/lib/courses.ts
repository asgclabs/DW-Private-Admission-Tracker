import "server-only";

import { ObjectId } from "mongodb";
import { courses } from "./mongodb";
import { toCourseView, type CourseView } from "./course-view";

export type { CourseView };
export { toCourseView };

/** Courses visible on the public site, in the order the super-admin set. */
export async function getLiveCourses(): Promise<CourseView[]> {
  const col = await courses();
  const docs = await col
    .find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .toArray();
  return docs.map(toCourseView);
}

/** Public lookup — a draft course must 404 rather than quietly accept applications. */
export async function getLiveCourseBySlug(slug: string): Promise<CourseView | null> {
  const col = await courses();
  const doc = await col.findOne({ slug, isActive: true });
  return doc ? toCourseView(doc) : null;
}

export async function getAllCourses(): Promise<CourseView[]> {
  const col = await courses();
  const docs = await col.find({}).sort({ sortOrder: 1, createdAt: 1 }).toArray();
  return docs.map(toCourseView);
}

export async function getCourseById(id: string): Promise<CourseView | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await courses();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? toCourseView(doc) : null;
}
