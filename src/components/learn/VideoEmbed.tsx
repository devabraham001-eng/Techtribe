"use client";

import { Film } from "lucide-react";

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

export function VideoEmbed({ url }: { url: string }) {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title="Vimeo video player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  const loomId = getLoomId(url);
  if (loomId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
        <iframe
          src={`https://www.loom.com/embed/${loomId}`}
          title="Loom video"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (isDirectVideoUrl(url)) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
        <video controls className="h-full w-full">
          <source src={url} />
        </video>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
    >
      <Film className="h-4 w-4" />
      <span>Watch video reference</span>
    </a>
  );
}
