import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-secondary/10 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
