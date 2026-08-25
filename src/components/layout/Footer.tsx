import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import type { IconType } from "react-icons";
import { APP_NAME } from "@/lib/constants";

const socials: Array<[IconType, string]> = [
  [FaFacebookF, "Facebook"],
  [FaInstagram, "Instagram"],
  [FaTwitter, "Twitter"],
  [FaLinkedinIn, "LinkedIn"],
];

const columns = [
  {
    title: "Shop",
    links: [
      ["All products", "/products"],
      ["AI Advisor", "/ai-advisor"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"],
    ],
  },
  {
    title: "Sell",
    links: [
      ["Seller Hub", "/seller/dashboard"],
      ["Products", "/seller/products"],
      ["Orders", "/seller/orders"],
      ["Trust score", "/seller/trust-score"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About ShopNest", "/about"],
      ["Support", "/support"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export const Footer: React.FC = () => (
  <footer className="mt-16 border-t border-border bg-slate-950 text-slate-300 dark:bg-[#070b16]">
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
              S
            </span>
            {APP_NAME}
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            An intelligent multi-vendor marketplace built for better discovery, trusted sellers and
            safer shopping decisions.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map(([Icon, label]) => (
              <div
                key={label}
                aria-label={label}
                title={label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-white"
              >
                <Icon size={13} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-white">{column.title}</h3>
              <div className="mt-4 grid gap-3">
                {column.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <p>Built for modern commerce · Secure · Intelligent · Seller-friendly</p>
      </div>
    </div>
  </footer>
);
