"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Home, Briefcase, Plus, ChevronDown } from "lucide-react";
import type { Address } from "@/lib/api/addresses";
import {
  getAllDivisions,
  getDistrictsOfDivision,
  getUpazilasOfDistrict,
  getThanasOfDistrict,
} from "@/lib/bd-address";
import { CheckoutCard } from "./CheckoutCard";

export interface AddressFormData {
  firstName: string;
  lastName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  streetAddress: string;
  orderNotes: string;
}

const INITIAL_ADDRESS: AddressFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  division: "Dhaka",
  district: "",
  upazila: "",
  streetAddress: "",
  orderNotes: "",
};

interface DeliveryAddressFormProps {
  /** Saved addresses pre-fetched server-side */
  initialAddresses: Address[];
  /** Called whenever address form data changes */
  onChange: (data: AddressFormData) => void;
}

const inputClass =
  "w-full px-3 py-2 text-xs rounded-sm bg-slate-50 dark:bg-[#0D0A1E] border border-slate-200 dark:border-[#2D2250] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 dark:focus:border-violet-400 transition-all";

const selectClass =
  "w-full appearance-none pl-3 pr-7 py-2 text-xs rounded-sm bg-slate-50 dark:bg-[#0D0A1E] border border-slate-200 dark:border-[#2D2250] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 dark:focus:border-violet-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1";

export function DeliveryAddressForm({ initialAddresses, onChange }: DeliveryAddressFormProps) {
  const savedAddresses = initialAddresses;
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = initialAddresses.find((a) => a.isDefault) ?? initialAddresses[0];
    return def ? (def.id || (def as { _id?: string })._id || "custom") : "custom";
  });
  const [address, setAddress] = useState<AddressFormData>(() => {
    const def = initialAddresses.find((a) => a.isDefault) ?? initialAddresses[0];
    if (!def) return INITIAL_ADDRESS;
    const [first = "", ...rest] = (def.fullName || "").split(" ");
    return {
      firstName: first,
      lastName: rest.join(" "),
      phone: def.phone || "",
      division: def.division || "Dhaka",
      district: "",
      upazila: "",
      streetAddress: def.streetAddress || "",
      orderNotes: "",
    };
  });

  const divisions = getAllDivisions();
  const districts = address.division ? getDistrictsOfDivision(address.division) : [];
  const upazilaList = address.district ? getUpazilasOfDistrict(address.district) : [];
  const thanaList = address.district ? getThanasOfDistrict(address.district) : [];

  // Notify parent whenever address changes
  useEffect(() => {
    onChange(address);
  }, [address, onChange]);

  // No longer self-fetching — addresses come in via initialAddresses prop
  const applyAddressToForm = useCallback((addr: Address, addrId: string) => {
    setSelectedAddressId(addrId);
    const [first = "", ...rest] = (addr.fullName || "").split(" ");
    setAddress({
      firstName: first,
      lastName: rest.join(" "),
      phone: addr.phone || "",
      division: addr.division || "Dhaka",
      district: "",
      upazila: "",
      streetAddress: addr.streetAddress || "",
      orderNotes: "",
    });
  }, []);

  const updateField = useCallback((field: keyof AddressFormData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddress((prev) => ({ ...prev, division: e.target.value, district: "", upazila: "" }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddress((prev) => ({ ...prev, district: e.target.value, upazila: "" }));
  };

  return (
    <CheckoutCard
      icon={MapPin}
      title="Delivery Address"
      subtitle="Where should we deliver your order?"
    >
      <div className="p-4 space-y-3">
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div>
            <p className={labelClass}>Saved Addresses</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedAddresses.map((addr) => {
                const addrId = addr.id || (addr as { _id?: string })._id || "";
                const isSelected = selectedAddressId === addrId;
                const isOffice = addr.title?.toLowerCase() === "office";

                return (
                  <button
                    key={addrId}
                    type="button"
                    onClick={() => applyAddressToForm(addr, addrId)}
                    className={`text-left p-2.5 rounded-sm border-2 transition-all ${isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                        : "border-slate-200 dark:border-[#2D2250] hover:border-violet-300 dark:hover:border-violet-700 bg-slate-50 dark:bg-[#0D0A1E]"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 rounded-sm ${isSelected ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                          {isOffice ? <Briefcase className="w-2.5 h-2.5" /> : <Home className="w-2.5 h-2.5" />}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 capitalize">
                          {addr.title || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-violet-500 bg-violet-500" : "border-slate-300 dark:border-slate-600"}`}>
                        {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{addr.fullName} · {addr.phone}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{addr.streetAddress}, {addr.city || addr.division}</p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setSelectedAddressId("custom");
                  setAddress(INITIAL_ADDRESS);
                }}
                className={`p-2.5 rounded-sm border-2 border-dashed flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${selectedAddressId === "custom"
                    ? "border-violet-500 text-violet-600 bg-violet-50 dark:bg-violet-950/30"
                    : "border-slate-200 dark:border-[#2D2250] text-slate-400 hover:border-violet-400 hover:text-violet-500 bg-slate-50 dark:bg-[#0D0A1E]"
                  }`}
              >
                <Plus className="w-3.5 h-3.5" /> New Address
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-2.5">
          {/* Row 1: First + Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>First name</label>
              <input
                type="text"
                placeholder="First name"
                value={address.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                type="text"
                placeholder="Last name"
                value={address.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2: Phone */}
          <div>
            <label className={labelClass}>Phone number</label>
            <input
              type="tel"
              placeholder="+880 1X XXXX XXXX"
              value={address.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 3: Division → District → Upazila */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>Province / Region</label>
              <div className="relative">
                <select value={address.division} onChange={handleDivisionChange} className={selectClass}>
                  <option value="" disabled>Province / Region</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>City</label>
              <div className="relative">
                <select
                  value={address.district}
                  onChange={handleDistrictChange}
                  disabled={!address.division || districts.length === 0}
                  className={selectClass}
                >
                  <option value="" disabled>City</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Zone</label>
              <div className="relative">
                <select
                  value={address.upazila}
                  onChange={(e) => updateField("upazila", e.target.value)}
                  disabled={!address.district || (upazilaList.length === 0 && thanaList.length === 0)}
                  className={selectClass}
                >
                  <option value="" disabled>Zone</option>
                  {upazilaList.length > 0 && (
                    upazilaList.map((u) => (
                      <option key={`upz-${u.upazila}`} value={u.upazila}>{u.upazila}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Street Address */}
          <div>
            <label className={labelClass}>Street Address</label>
            <textarea
              placeholder="House no., Road no., Area, Landmark..."
              value={address.streetAddress}
              onChange={(e) => updateField("streetAddress", e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Order Notes */}
          <div>
            <label className={labelClass}>Order notes <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Leave at door, call before delivery..."
              value={address.orderNotes}
              onChange={(e) => updateField("orderNotes", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </CheckoutCard>
  );
}
