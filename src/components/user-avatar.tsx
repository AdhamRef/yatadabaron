"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  ring,
  className,
}: {
  name?: string | null;
  image?: string | null;
  size?: keyof typeof SIZES;
  ring?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name ?? "").trim().charAt(0) || "";

  const base = cn(
    "relative grid place-items-center rounded-full overflow-hidden shrink-0 font-bold text-white",
    "bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700",
    ring && "ring-2 ring-white dark:ring-brand-950 shadow-soft",
    SIZES[size],
    className
  );

  if (image && !failed) {
    return (
      <span className={base} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span className={base} aria-hidden>
      {initial ? initial.toUpperCase() : <UserIcon className="h-1/2 w-1/2 opacity-90" />}
    </span>
  );
}
