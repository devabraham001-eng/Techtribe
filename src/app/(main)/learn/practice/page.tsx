import type { Metadata } from "next";
import { PracticePageContent } from "./PracticePageContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practice",
  description: "Real-world workloads for JavaScript, Python, Linux, SQL, and more. Solve them in-browser, earn XP, build your proof of work.",
};

export default function PracticePage() {
  return <PracticePageContent />;
}
