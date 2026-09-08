"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
  getAllDivisions,
  getDistrictsOfDivision,
  getUpazilasOfDistrict,
  getThanasOfDistrict,
} from "@/lib/bd-address";

export interface BdAddressSelectFieldsProps {
  division: string;
  district: string;
  upazila: string;
  /** Called with the newly selected division. District & upazila should be reset by the parent. */
  onDivisionChange: (division: string) => void;
  /** Called with the newly selected district. Upazila should be reset by the parent. */
  onDistrictChange: (district: string) => void;
  onUpazilaChange: (upazila: string) => void;
  /** Override the default labels, e.g. for a business address vs a delivery address */
  labels?: {
    division?: string;
    district?: string;
    upazila?: string;
  };
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
}

const defaultSelectClass =
  "w-full appearance-none pl-3 pr-7 py-2 text-xs rounded-sm bg-slate-50 dark:bg-[#0D0A1E] border border-slate-200 dark:border-[#2D2250] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 dark:focus:border-violet-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

const defaultLabelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1";

/**
 * Reusable Division → District → Upazila cascading select fields for Bangladesh addresses.
 * Used by both the checkout delivery address form and the become-a-seller business address form,
 * so the two flows stay in sync and share a single source of truth for address selection.
 */
export function BdAddressSelectFields({
  division,
  district,
  upazila,
  onDivisionChange,
  onDistrictChange,
  onUpazilaChange,
  labels,
  className,
  selectClassName,
  labelClassName,
}: BdAddressSelectFieldsProps) {
  const divisions = getAllDivisions();
  const districts = division ? getDistrictsOfDivision(division) : [];
  const upazilaList = district ? getUpazilasOfDistrict(district) : [];
  const thanaList = district ? getThanasOfDistrict(district) : [];

  const selectClass = selectClassName || defaultSelectClass;
  const labelClass = labelClassName || defaultLabelClass;

  return (
    <div className={className || "grid grid-cols-3 gap-2"}>
      <div>
        <label className={labelClass}>{labels?.division || "Province / Region"}</label>
        <div className="relative">
          <select
            value={division}
            onChange={(e) => onDivisionChange(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>
              {labels?.division || "Province / Region"}
            </option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={labelClass}>{labels?.district || "City"}</label>
        <div className="relative">
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!division || districts.length === 0}
            className={selectClass}
          >
            <option value="" disabled>
              {labels?.district || "City"}
            </option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={labelClass}>{labels?.upazila || "Zone"}</label>
        <div className="relative">
          <select
            value={upazila}
            onChange={(e) => onUpazilaChange(e.target.value)}
            disabled={!district || (upazilaList.length === 0 && thanaList.length === 0)}
            className={selectClass}
          >
            <option value="" disabled>
              {labels?.upazila || "Zone"}
            </option>
            {upazilaList.length > 0 &&
              upazilaList.map((u) => (
                <option key={`upz-${u.upazila}`} value={u.upazila}>
                  {u.upazila}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
