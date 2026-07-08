import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-8xl font-heading font-bold text-primary/20 mb-4">404</div>
      <h1 className="font-heading text-3xl font-bold mb-2">Article not found</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The article you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/blog">Back to blog</Link>
      </Button>
    </div>
  );
}