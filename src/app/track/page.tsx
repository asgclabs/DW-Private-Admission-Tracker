import type { Metadata } from "next";
import { TrackClient } from "./track-client";

export const metadata: Metadata = {
  title: "Track Application",
  description:
    "Check the status of your CBSE private candidate application with your reference number.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <TrackClient initialRef={ref} />;
}
