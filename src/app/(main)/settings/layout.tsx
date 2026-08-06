"use client";

import * as React from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevBodyH = body.style.height;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.height = prevBodyH;
    };
  }, []);

  return <>{children}</>;
}
