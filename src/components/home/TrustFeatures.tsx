"use client";

import { motion } from "motion/react";
import { FaShieldAlt, FaBrain, FaShippingFast, FaUserShield } from "react-icons/fa";

const features = [
  {
    title: "Trusted sellers",
    desc: "Transparent trust signals",
    icon: <FaShieldAlt size={22} />,
    glowColor: "#f59e0b",
    barColor: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    badgeGlow: "group-hover:bg-amber-600 group-hover:text-white",
  },
  {
    title: "AI discovery",
    desc: "Smarter recommendations",
    icon: <FaBrain size={22} />,
    glowColor: "#ec4899",
    barColor: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-500/15 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    textHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
    badgeGlow: "group-hover:bg-pink-600 group-hover:text-white",
  },
  {
    title: "Order tracking",
    desc: "Clear delivery milestones",
    icon: <FaShippingFast size={22} />,
    glowColor: "#06b6d4",
    barColor: "from-cyan-500 to-blue-500",
    iconBg: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    textHover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    badgeGlow: "group-hover:bg-cyan-600 group-hover:text-white",
  },
  {
    title: "Buyer protection",
    desc: "Security-first shopping",
    icon: <FaUserShield size={22} />,
    glowColor: "#10b981",
    barColor: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    textHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    badgeGlow: "group-hover:bg-emerald-600 group-hover:text-white",
  },
];

export default function TrustFeatures() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: i * 0.1,
            }}
          >
            <div
              className="
                group relative flex flex-col justify-between
                overflow-hidden rounded-2xl
                p-6
                bg-surface/90 dark:bg-surface
                border border-border/50
                shadow-lg dark:shadow-xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                h-full
              "
            >
              {/* Top Main Glow (Only on Hover) */}
              <div
                style={{
                  background: `radial-gradient(
                    circle at 50% 0%,
                    ${item.glowColor}65,
                    ${item.glowColor}25 35%,
                    transparent 72%
                  )`,
                }}
                className="
                  absolute inset-0
                  rounded-2xl
                  pointer-events-none
                  z-[1]
                  opacity-0
                  group-hover:opacity-100
                  transition-all duration-500
                  group-hover:scale-105
                "
              />

              {/* Bottom Soft Glow (Only on Hover) */}
              <div
                style={{
                  background: `radial-gradient(
                    circle at 50% 100%,
                    ${item.glowColor}45,
                    transparent 65%
                  )`,
                }}
                className="
                  absolute inset-0
                  rounded-2xl
                  pointer-events-none
                  z-[1]
                  opacity-0
                  group-hover:opacity-70
                  transition-all duration-500
                "
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`
                    mb-4
                    inline-flex
                    h-11 w-11
                    items-center justify-center
                    rounded-xl
                    ${item.iconBg}
                    ${item.badgeGlow}
                    transition-all duration-300
                    group-hover:scale-110
                    shadow-sm
                  `}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <div>
                  <h3
                    className={`
                      font-bold
                      text-text
                      tracking-wide
                      text-base
                      transition-colors duration-300
                      ${item.textHover}
                    `}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="
                      mt-1
                      text-xs
                      text-muted
                      font-medium
                    "
                  >
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Dynamic Color Bar */}
              <div
                className={`
                  relative z-10
                  mt-6
                  h-1.5
                  w-full
                  rounded-full
                  bg-gradient-to-r
                  ${item.barColor}
                  transition-all duration-300
                  group-hover:h-2
                  group-hover:brightness-125
                `}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}