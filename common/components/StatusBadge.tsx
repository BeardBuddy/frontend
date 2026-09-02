"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const CONFIG: Record<string, { label: string; classes: string }> = {
  NEW:         { label: "New",         classes: "bg-zinc-900 border-zinc-700 text-zinc-300" },
  CONFIRMED:   { label: "Confirmed",   classes: "bg-emerald-950/60 border-emerald-800 text-emerald-400" },
  IN_PROGRESS: { label: "In Progress", classes: "bg-blue-950/60 border-blue-800 text-blue-400" },
  COMPLETED:   { label: "Completed",   classes: "bg-zinc-900 border-zinc-800 text-zinc-400" },
  CANCELLED:   { label: "Cancelled",   classes: "bg-red-950/40 border-red-900 text-red-400" },
};

const FALLBACK = { label: "Unknown", classes: "bg-zinc-900 border-zinc-800 text-zinc-400" };

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const { label, classes } = CONFIG[status] ?? FALLBACK;
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`rounded-full border font-semibold tracking-wide ${sizeClasses} ${classes}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
