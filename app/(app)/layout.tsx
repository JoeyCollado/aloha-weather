// app/(app)/layout.tsx
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // No auth check here. 
  // If they aren't logged in, Clerk's middleware.ts redirects them to sign-in.
  return <AppShell>{children}</AppShell>;
}