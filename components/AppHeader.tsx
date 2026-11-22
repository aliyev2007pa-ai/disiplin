"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const onSettings = pathname === "/ayarlar";

  return (
    <header className="bg-bg/95 sticky top-0 z-30 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-content items-center justify-between px-5 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Disiplin ana sayfa">
          <Image
            src="/ikon-192.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-xl"
          />
          <span className="font-serif text-ink text-[19px] leading-none font-semibold tracking-tight">
            Disiplin
          </span>
        </Link>

        <Link
          href="/ayarlar"
          aria-label="Ayarlar"
          aria-current={onSettings ? "page" : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            onSettings ? "bg-bordo-soft text-bordo" : "text-muted hover:bg-surface hover:text-ink"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[19px] w-[19px]"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3.1" />
            <path d="M19.4 14.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
