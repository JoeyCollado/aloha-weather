// app/(app)/layout.tsx
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { FiAlertTriangle } from "react-icons/fi";
import { UserButton } from "@clerk/nextjs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
            <FiAlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You do not have the &quot;owner&quot; role.</p>
            <div className="mt-6 flex justify-center">
              <UserButton />
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  // If authorized, render the client UI shell with the page content
  return <AppShell>{children}</AppShell>;
}