"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Truck } from "lucide-react";

interface AnnouncementBarProps {
  announcement?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("mb_announcement_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  if (!announcement || !announcement.enabled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("mb_announcement_dismissed", "true");
  };

  return (
    <aside className="bg-canvas-strong text-ink border-b border-line text-xs font-normal px-4 transition-colors duration-150">
      <div className="max-w-[1280px] mx-auto flex min-h-[44px] items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center text-center truncate">
          <Truck className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
          <span className="truncate">{announcement.text}</span>
          {announcement.link && (
            <Link
              href={announcement.link}
              className="underline font-medium text-ink hover:text-ink-muted shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
            >
              View details
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="p-2 -mr-2 text-ink-muted hover:text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
