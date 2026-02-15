import type { Metadata } from "next";
import VideosContent from "./videos-content";

export const metadata: Metadata = {
  title: "Video Walkthroughs | Dispatch",
  description:
    "Watch Dispatch's pitch and technical demo. Cheap compute for AI agents, passive income for workers, every result verified with a cryptographic receipt.",
  alternates: { canonical: "https://www.dispatch.computer/videos" },
};

export default function VideosPage() {
  return <VideosContent />;
}
