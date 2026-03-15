"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ScrollMarqueeProps {
  children: React.ReactNode;
  /** Duration for one full scroll cycle in seconds */
  duration?: number;
  /** Direction: left (default) or right */
  direction?: "left" | "right";
  /** Pause animation on hover */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Infinite horizontal scroll marquee. Duplicates content for seamless loop.
 * Inspired by Sandy Paws style continuous scroll sections.
 */
export function ScrollMarquee({
  children,
  duration = 30,
  direction = "left",
  pauseOnHover = true,
  className = "",
}: ScrollMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const effectiveDuration = isPaused ? 99999 : duration;

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        className="flex w-max"
        animate={{
          x: [0, direction === "left" ? "-50%" : "50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: effectiveDuration,
            ease: "linear",
          },
        }}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center gap-8 shrink-0">{children}</div>
        <div className="flex items-center gap-8 shrink-0" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
