"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block text-transparent bg-clip-text bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_30%,rgba(245,158,11,0.8)_50%,rgba(255,255,255,0.15)_70%)] bg-[length:200%_100%] ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        animationDuration,
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
