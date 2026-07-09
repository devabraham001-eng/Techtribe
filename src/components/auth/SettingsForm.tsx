"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthorProfile {
  id?: string;
  name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

interface SettingsFormProps {
  author: AuthorProfile | null;
}

export function SettingsForm({ author }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/author/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          bio: formData.get("bio"),
          avatar_url: formData.get("avatar_url"),
          twitter: formData.get("twitter"),
          github: formData.get("github"),
          linkedin: formData.get("linkedin"),
          website: formData.get("website"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setMessage("Settings saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal direction="up" duration={0.4}>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" name="name" defaultValue={author?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={author?.bio ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell readers about yourself..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" name="avatar_url" type="url" defaultValue={author?.avatar_url ?? ""} placeholder="https://..." />
      </div>

      <fieldset className="rounded-lg border border-border p-5 space-y-4">
        <legend className="text-sm font-medium px-1">Social links</legend>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input id="twitter" name="twitter" defaultValue={author?.twitter ?? ""} placeholder="@username" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input id="github" name="github" defaultValue={author?.github ?? ""} placeholder="username" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" name="linkedin" defaultValue={author?.linkedin ?? ""} placeholder="url or username" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" defaultValue={author?.website ?? ""} placeholder="https://..." />
        </div>
      </fieldset>

      {message && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <Button type="submit" loading={loading}>
        <Save className="mr-2 h-4 w-4" />
        Save settings
      </Button>
    </form>
    </Reveal>
  );
}
