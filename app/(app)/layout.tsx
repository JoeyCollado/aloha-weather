import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside
        className="border-b md:border-b-0 md:border-r p-4 md:min-h-screen"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Aloha RMR</div>
            <div className="muted text-xs">Weather Log</div>
          </div>
          <UserButton />
        </div>
        <Nav />
      </aside>

      {/* Main content */}
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}