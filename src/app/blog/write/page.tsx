import * as React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WritePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Lock className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-3xl font-bold mb-2">Sign in to write</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        You need to be signed in to create and publish articles on TechTribe.
      </p>
      <Button size="lg" asChild>
        <a href="/login">Sign in</a>
      </Button>
    </div>
  );
}