import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { OnboardingProgress } from "./_components/OnboardingProgress";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0D1B3E 0%, #0f2347 50%, #0D1B3E 100%)",
      }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/assets/full_logo_dark.png"
            alt="TrackFlow"
            width={120}
            height={30}
            priority
          />
        </Link>
        <Suspense fallback={<div className="h-4 w-32 skeleton rounded-full" />}>
          <OnboardingProgress />
        </Suspense>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
