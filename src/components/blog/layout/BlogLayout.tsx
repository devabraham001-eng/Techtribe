import * as React from "react";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="w-full py-8">
      {children}
    </div>
  );
}
