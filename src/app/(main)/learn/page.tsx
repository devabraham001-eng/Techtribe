import type { Metadata } from "next";
import { LearnPageContent } from "./LearnPageContent";

export const metadata: Metadata = {
  title: "Choose Your Learning Path — TechTribe",
  description: "Paths are collections of learnings designed to build deep skills in a particular area. Whether you're looking to earn achievements, build a collection of skill badges, or prepare for a certification, there are paths right for you.",
  openGraph: {
    title: "Choose Your Learning Path — TechTribe",
    description: "Build real-world skills with structured learning paths.",
  },
};

export default function LearnPage() {
  return <LearnPageContent />;
}
