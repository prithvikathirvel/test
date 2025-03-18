"use client"

import WelcomeMessage from "@/components/WelcomeMessage";
import ReduxProvider from "@/components/providers/ReduxProvider";

export default function Home() {
  return (
    <ReduxProvider>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <WelcomeMessage />
        </main>
      </div>
    </ReduxProvider>
  );
}
