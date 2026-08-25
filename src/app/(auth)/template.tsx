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
      initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
