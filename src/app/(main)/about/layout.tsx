import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about TechTribe — the social platform for tech talent to learn, build, and collaborate. Discover our mission and community.",
  openGraph: {
    title: "About TechTribe — Learn, Build, and Collaborate",
    description: "The social platform for tech talent. Master skills, publish articles, build real projects, and collaborate with a thriving community.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
