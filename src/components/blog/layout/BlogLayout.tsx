import * as React from "react";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="container-custom mx-auto py-8 px-4">
      {children}
    </div>
  );
}