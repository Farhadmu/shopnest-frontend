"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaChevronDown } from "react-icons/fa";
import type { IconType } from "react-icons";
import { APP_NAME } from "@/lib/constants";

const socials: Array<[IconType, string]> = [
  [FaFacebookF, "Facebook"],
  [FaInstagram, "Instagram"],
  [FaTwitter, "Twitter"],
  [FaLinkedinIn, "LinkedIn"],
];

const footerColumns: Array<{ title: string; links: [string, string][] }> = [
  {
    title: "Shop",
    links: [
      ["Products", "/products"],
      ["Categories", "/products"],
      ["Stores", "/stores"],
      ["Flash Sale", "/flash-sale"],
      ["Compare", "/compare"],
      ["AI Advisor", "/ai-advisor"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"],
      ["Orders", "/dashboard/user/orders"],
    ],
  },
  {
    title: "Sell with ShopNest",
    links: [
      ["Become a Seller", "/become-seller"],
      ["Seller Dashboard", "/dashboard/seller"],
      ["Seller Products", "/dashboard/seller/products"],
      ["Seller Orders", "/dashboard/seller/orders"],
      ["Seller AI Tools", "/dashboard/seller/ai-tools"],
      ["Seller Help", "/support"],
    ],
  },
  {
    title: "Delivery",
    links: [
      ["Become a Partner", "/delivery/register"],
      ["Delivery Login", "/delivery/login"],
      ["Available Deliveries", "/dashboard/delivery/available"],
      ["My Deliveries", "/dashboard/delivery/my-deliveries"],
      ["Delivery Help", "/support"],
    ],
  },
  {
    title: "Customer Support",
    links: [
      ["Help Center", "/support"],
      ["FAQ", "/faq"],
      ["Contact Us", "/contact"],
      ["Complaints", "/dashboard/user/complaints"],
      ["Returns & Refunds", "/returns-refunds"],
      ["Order Support", "/dashboard/user/orders"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About ShopNest", "/about"],
      ["How It Works", "/how-it-works"],
      ["Support", "/support"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
      ["Cookie Policy", "/cookie-policy"],
      ["Delivery Policy", "/delivery-policy"],
    ],
  },
];

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 pb-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-bold text-text"
        aria-expanded={open}
      >
        {title}
        <FaChevronDown className={`text-muted transition ${open ? "rotate-180" : ""}`} size={12} />
      </button>
      <div className={`${open ? "mt-2 block" : "hidden"} space-y-2`}>
        {links.map(([label, href]) => (
          <Link
            key={href + label}
            href={href}
            className="block text-xs text-muted transition hover:text-text"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Footer: React.FC = () => {
  const pathName = usePathname();

  if (pathName?.includes("dashboard")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-border bg-surface text-muted">
      <div className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1.6fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black text-text">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-white">
                S
              </span>
              {APP_NAME}
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted">
              ShopNest is an AI-powered multi-vendor commerce platform where customers discover
              products, sellers grow their stores, and delivery partners complete real-world
              deliveries.
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} title={column.title} links={column.links} />
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Built for modern commerce · Secure · Intelligent · Seller-friendly</p>
        </div>
      </div>
    </footer>
  );
};
