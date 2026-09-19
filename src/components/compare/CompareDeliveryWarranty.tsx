"use client";

import React, { useState } from "react";
import { FiTruck, FiShield, FiMapPin, FiCheckCircle, FiRotateCcw, FiDollarSign } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

interface CompareDeliveryWarrantyProps {
  products: CompareProductData[];
}

const BANGLADESH_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

export function CompareDeliveryWarranty({ products }: CompareDeliveryWarrantyProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("Dhaka");

  if (!products || products.length < 2) return null;

  const isInsideDhaka = selectedDivision === "Dhaka";
  const standardFee = isInsideDhaka ? 60 : 120;
  const estimatedDays = isInsideDhaka ? "1-2 Business Days" : "3-5 Business Days";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm space-y-4">
      <div className="px-6 py-4 bg-muted-bg/50 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiTruck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
              Logistics, Delivery & Warranty
            </h3>
            <p className="text-xs text-muted">Localized delivery speed, shipping cost, and buyer protection</p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2">
          <FiMapPin className="text-primary w-3.5 h-3.5" />
          <span className="text-xs font-bold text-foreground">Destination:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs font-bold bg-card border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          >
            {BANGLADESH_DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div} Division
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-border/60">
            {/* Delivery Fee */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground w-52 bg-muted-bg/20">
                Delivery Charge ({selectedDivision})
              </td>
              {products.map((p) => {
                const isFree = Boolean(p.freeDelivery);
                const fee = isFree ? 0 : standardFee;
                return (
                  <td key={p.id} className="p-4">
                    {isFree ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <FiCheckCircle className="w-3 h-3" /> Free Shipping
                      </span>
                    ) : (
                      <span className="font-extrabold text-foreground">
                        {formatCurrency(fee)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Estimated Delivery Time */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Estimated Delivery
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <FiTruck className="text-primary w-3.5 h-3.5" />
                    <span>{estimatedDays}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Cash on Delivery */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiDollarSign className="text-muted" /> Payment Options
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                    <FiCheckCircle className="text-emerald-500 w-3.5 h-3.5" /> Cash on Delivery (COD) Available
                  </span>
                </td>
              ))}
            </tr>

            {/* Warranty Coverage */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiShield className="text-primary" /> Warranty Protection
              </td>
              {products.map((p) => {
                const months = p.warrantyMonths;
                const provider = p.warrantyProvider || "Official Seller";
                return (
                  <td key={p.id} className="p-4 space-y-0.5">
                    <span className="font-extrabold text-foreground block">
                      {months ? `${months} Months Warranty` : "Standard Warranty"}
                    </span>
                    <span className="text-[11px] text-muted block">Provider: {provider}</span>
                  </td>
                );
              })}
            </tr>

            {/* Return Policy */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiRotateCcw className="text-muted" /> Return Policy
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-muted text-xs leading-relaxed">
                  <span className="font-bold text-foreground block">
                    7 Days Return Guarantee
                  </span>
                  <span className="text-[11px] block mt-0.5">
                    Full refund or replacement if damaged or defective on arrival.
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
