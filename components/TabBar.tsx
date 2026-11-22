"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-[22px] w-[22px]",
  "aria-hidden": true,
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Günlük",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="3.5" />
        <path d="M8 3v4M16 3v4M3 10.5h18" />
        <path d="m9 15.5 1.8 1.8 3.4-3.6" />
      </svg>
    ),
  },
  {
    href: "/hedefler",
    label: "Hedefler",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/tamamlananlar",
    label: "Tamamlananlar",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="14.5" r="6.3" />
        <path d="M9 3.2 10.6 8M15 3.2 13.4 8" />
        <path d="m9.7 14.4 1.6 1.6 3.1-3.3" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ana gezinme"
      className="border-bordo-soft bg-bg/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm"
    >
      <ul className="mx-auto flex w-full max-w-content items-stretch">
        {TABS.map((tab) => {
          const active = pathname === tab.href;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pt-2.5 pb-2 transition-colors ${
                  active ? "text-bordo" : "text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-9 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-bordo-soft" : "bg-transparent"
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`text-[11px] leading-none tracking-tight ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="pb-safe" />
    </nav>
  );
}
