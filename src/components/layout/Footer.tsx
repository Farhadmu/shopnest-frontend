"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import type { IconType } from "react-icons";
import { APP_NAME } from "@/lib/constants";
import { usePathname } from "next/navigation";

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

export const Footer: React.FC = () => {
  const pathName = usePathname();

  if (pathName?.includes("dashboard")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-border bg-surface text-muted">
      <div className="mx-auto max-w-360 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black text-text">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-white">
                S
              </span>
              {APP_NAME}
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted">
              An intelligent multi-vendor marketplace built for better discovery, trusted sellers and
              safer shopping decisions.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(([Icon, label]) => (
                <div
                  key={label}
                  aria-label={label}
                  title={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-muted-bg text-muted transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon size={13} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-text">{column.title}</h3>
                <div className="mt-4 grid gap-3">
                  {column.links.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm text-muted transition hover:text-text"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p>Built for modern commerce · Secure · Intelligent · Seller-friendly</p>
        </div>
      </div>
    </footer>
  );
};