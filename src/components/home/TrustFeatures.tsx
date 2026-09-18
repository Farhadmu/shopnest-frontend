"use client";
import { motion } from "motion/react";

import {

  FaShieldAlt,

  FaBrain,

  FaShippingFast,

  FaUserShield,

  FaShoppingCart,

} from "react-icons/fa";



const features = [

  {

    title: "Trusted Sellers",

    desc: "Shop confidently with verified sellers who follow our quality and service standards.",

    icon: <FaShieldAlt />,

    color: "text-amber-500",

    bg: "bg-amber-500/10",

    border: "group-hover:border-amber-500/30",

  },

  {

    title: "AI Discovery",

    desc: "Discover smarter product recommendations tailored to your interests and shopping habits.",

    icon: <FaBrain />,

    color: "text-pink-500",

    bg: "bg-pink-500/10",

    border: "group-hover:border-pink-500/30",

  },

  {

    title: "Order Tracking",

    desc: "Stay updated with real-time order progress from the warehouse all the way to your doorstep.",

    icon: <FaShippingFast />,

    color: "text-cyan-500",

    bg: "bg-cyan-500/10",

    border: "group-hover:border-cyan-500/30",

  },

  {

    title: "Buyer Protection",

    desc: "Enjoy secure payments, simple returns, and reliable support throughout your shopping journey.",

    icon: <FaUserShield />,

    color: "text-emerald-500",

    bg: "bg-emerald-500/10",

    border: "group-hover:border-emerald-500/30",

  },

  {

    title: "Easy Shopping",

    desc: "Experience a fast, simple, and user-friendly marketplace designed to make shopping effortless.",

    icon: <FaShoppingCart />,

    color: "text-purple-500",

    bg: "bg-purple-500/10",

    border: "group-hover:border-purple-500/30",

  },

];



export default function TrustFeatures() {

  return (

    <section className="py-10">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {features.map((item, index) => (

          <motion.div

            key={item.title}

            initial={{ opacity: 0, y: 18 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true, margin: "-50px" }}

            transition={{

              duration: 0.45,

              delay: index * 0.08,

              ease: "easeOut",

            }}

            className="h-full"

          >

            <div

              className={`

                group relative h-full min-h-[205px]

                overflow-hidden rounded-2xl

                border border-border/50

                bg-surface

                p-5

                shadow-sm

                transition-all duration-300

                hover:-translate-y-1

                hover:shadow-xl

                dark:bg-surface/80

                ${item.border}

              `}

            >

              {/* Subtle background glow */}

              <div

                className={`

                  pointer-events-none absolute

                  -right-10 -top-10

                  h-24 w-24

                  rounded-full

                  opacity-0 blur-2xl

                  transition-opacity duration-500

                  group-hover:opacity-20

                  ${item.bg}

                `}

              />



              <div className="relative z-10 flex h-full flex-col">

                {/* Icon */}

                <motion.div

                  whileHover={{ scale: 1.08, rotate: 3 }}

                  className={`

                    mb-4 flex h-10 w-10

                    items-center justify-center

                    rounded-xl

                    text-lg

                    ${item.bg}

                    ${item.color}

                    transition-all duration-300

                  `}

                >

                  {item.icon}

                </motion.div>



                {/* Content */}

                <h3

                  className={`

                    text-sm font-bold

                    tracking-wide

                    text-text

                    transition-colors duration-300

                    ${item.color}

                  `}

                >

                  {item.title}

                </h3>



                <p className="mt-2 text-[11px] font-medium leading-[1.7] text-muted">

                  {item.desc}

                </p>



                {/* Small bottom indicator */}

                <div className="mt-auto pt-4">

                  <div className="h-px w-8 bg-border transition-all duration-300 group-hover:w-14" />

                </div>

              </div>

            </div>

          </motion.div>

        ))}

      </div>

    </section>

  );

} 

