export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex-1 min-h-screen" role="main">
      {children}
    </main>
  );
}
