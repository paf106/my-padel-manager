import { BottomNav } from "@/components/bottom-nav";
import { Navbar } from "@/components/navbar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
