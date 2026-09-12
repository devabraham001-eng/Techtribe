export type VideoSourceKind = "youtube" | "vimeo" | "loom" | "file" | "external";

export interface ResolvedVideo {
  kind: VideoSourceKind;
  /** Embed/player URL for iframe or native <video> sources. Null for plain external links. */
  embedUrl: string | null;
  /** Short human label for source badges. */
  label: string;
}

function getYouTubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ?? null;
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if ((parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") && parts[1]) {
      return parts[1];
    }
  }
  return null;
}

function getVimeoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host.endsWith("vimeo.com") && !host.startsWith("player.")) {
    const parts = url.pathname.split("/").filter(Boolean);
    const candidate = parts.find((part) => /^\d+$/.test(part));
    return candidate ?? null;
  }
  if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
    const id = url.pathname.split("/").filter(Boolean)[1];
    return id && /^\d+$/.test(id) ? id : null;
  }
  return null;
}

function getLoomId(url: URL): string | null {
  if (!url.hostname.toLowerCase().endsWith("loom.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.findIndex((part) => part === "share" || part === "embed");
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

const FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];

export function resolveVideoEmbed(rawUrl: string): ResolvedVideo {
  const fallback: ResolvedVideo = { kind: "external", embedUrl: null, label: "Link" };

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return fallback;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;

  const youTubeId = getYouTubeId(url);
  if (youTubeId) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youTubeId}`,
      label: "YouTube",
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      label: "Vimeo",
    };
  }

  const loomId = getLoomId(url);
  if (loomId) {
    return {
      kind: "loom",
      embedUrl: `https://www.loom.com/embed/${loomId}`,
      label: "Loom",
    };
  }

  const path = url.pathname.toLowerCase();
  if (FILE_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    return { kind: "file", embedUrl: url.toString(), label: "Video" };
  }

  return fallback;
}
