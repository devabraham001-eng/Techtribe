"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Upload } from "lucide-react";
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
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !formRef.current) return;

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("bucket", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      const avatarInput = formRef.current.elements.namedItem("avatar_url") as HTMLInputElement | null;
      if (avatarInput) {
        avatarInput.value = data.url;
      }
      setMessage("Avatar uploaded. Save settings to keep it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
        <Label htmlFor="avatar_url">Profile Picture</Label>
        <div className="flex items-center gap-4 mb-2">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-border">
              <span className="text-xl font-bold text-primary">
                {author?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Input id="avatar_url" name="avatar_url" type="url" defaultValue={author?.avatar_url ?? ""} placeholder="https://..." />
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
          {uploadingAvatar ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploadingAvatar ? "Uploading avatar..." : "Upload new avatar"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploadingAvatar}
            onChange={(event) => void handleAvatarUpload(event)}
          />
        </label>
        <p className="text-xs text-muted-foreground">Recommended: 400x400px, max 5MB. JPG, PNG, WebP, or GIF.</p>
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

      <Button type="submit" loading={loading} disabled={uploadingAvatar}>
        <Save className="mr-2 h-4 w-4" />
        Save settings
      </Button>
    </form>
    </Reveal>
  );
}
