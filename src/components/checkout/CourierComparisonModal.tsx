"use client";

import React, { useState, useEffect } from "react";
import { FiTruck, FiClock, FiShield, FiCheckCircle } from "react-icons/fi";
import { getCourierComparison, CourierOption } from "@/lib/api/customer-intelligence-features";
import { formatCurrency } from "@/lib/utils";

export function CourierComparisonModal({
  division,
  district,
  selectedCourierId,
  onSelectCourier,
}: {
  division: string;
  district: string;
  selectedCourierId: string;
  onSelectCourier: (courier: CourierOption) => void;
}) {
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCourierComparison(division, district, 1)
      .then((res) => {
        if (res && res.options) {
          setCouriers(res.options);
          // auto-select first if none selected
          if (!selectedCourierId && res.options.length > 0) {
            onSelectCourier(res.options[0]);
          }
        }
      })
      .catch(() => setCouriers([]))
      .finally(() => setLoading(false));
  }, [division, district]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted-bg rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <FiTruck className="text-primary" /> Select Preferred Courier & Delivery Speed
        </label>
        <span className="text-[11px] text-muted">
          Delivering to: <strong>{district || division}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {couriers.map((courier) => {
          const isSelected = selectedCourierId === courier.id;
          return (
            <button
              key={courier.id}
              type="button"
              onClick={() => onSelectCourier(courier)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{courier.logoUrl}</span>
                    <div>
                      <span className="text-xs font-black text-foreground block">{courier.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-bold">
                        {courier.badge}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-foreground">
                    {formatCurrency(courier.rate)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <FiClock className="text-primary" /> ETA: <strong>{courier.estimatedDates}</strong>
                </span>
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                  <FiShield /> {courier.reliabilityScore}% On-time
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
