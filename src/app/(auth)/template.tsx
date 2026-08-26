"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * Auth page transition template.
 *
 * Next.js `template.tsx` re-mounts on every route change within the group,
 * which makes it the perfect place for page-enter animations without
 * needing external animation libraries.
 *
 * Each time the user navigates between /login ↔ /register the whole
 * child tree fades + slides in from a subtle direction.
 */
export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex-1 min-h-0 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
