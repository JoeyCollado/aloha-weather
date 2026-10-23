import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <SignIn 
        routing="hash"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border border-[var(--border)] bg-[var(--card)]",
          },
        }}
      />
    </div>
  );
}