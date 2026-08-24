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
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <motion.div
              animate={{
                opacity: [0.9, 1, 0.9],
                scale: [1, 1.01, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
              className="
                group relative flex flex-col justify-between
                overflow-hidden rounded-2xl
                p-6
                shadow-lg dark:shadow-xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                h-full
              "
            >
              {/* Rotating Border Light */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none p-[2px]">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background: `conic-gradient(
                      from 0deg at 50% 50%,
                      transparent 0%,
                      transparent 65%,
                      ${item.glowColor} 88%,
                      ${item.glowColor} 100%
                    )`,
                  }}
                  className="
                    absolute
                    -inset-[50%]
                    opacity-70
                    group-hover:opacity-100
                    transition-opacity duration-300
                  "
                />
              </div>

              {/* Card Background */}
              <div
                className="
                  absolute inset-[1.5px]
                  rounded-[14px]
                  bg-surface/90 dark:bg-surface
                  z-0
                "
              />

              {/* ================================= */}
              {/* Light Mode Main Glow */}
              {/* ================================= */}

              <motion.div
                animate={{
                  opacity: [0.45, 0.65, 0.45],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
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

                  transition-all duration-500

                  group-hover:opacity-100
                  group-hover:scale-105

                  dark:opacity-30
                  dark:group-hover:opacity-30
                "
              />

              {/* ================================= */}
              {/* Light Mode Hover Glow */}
              {/* ================================= */}

              <div
                className="
                  absolute inset-0
                  rounded-2xl
                  pointer-events-none
                  z-[1]
                  opacity-0
                  transition-opacity duration-500

                  group-hover:opacity-100

                  dark:group-hover:opacity-0
                "
                style={{
                  background: `radial-gradient(
                    circle at 50% 15%,
                    ${item.glowColor}35,
                    ${item.glowColor}15 38%,
                    transparent 70%
                  )`,
                }}
              />

              {/* ================================= */}
              {/* Bottom Soft Glow */}
              {/* ================================= */}

              <motion.div
                animate={{
                  opacity: [0.18, 0.3, 0.18],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
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

                  transition-all duration-500

                  group-hover:opacity-70

                  dark:opacity-20
                  dark:group-hover:opacity-20
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
              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
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
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
