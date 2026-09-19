"use client";

import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiMonitor,
  FiBatteryCharging,
  FiCamera,
  FiWifi,
  FiBox,
  FiSettings,
  FiMinus,
} from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import {
  groupProductSpecifications,
  NormalizedSpecGroup,
} from "@/lib/utils/compare-normalization";

interface CompareSpecGroupsProps {
  products: CompareProductData[];
  differencesOnly: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Performance: <FiCpu className="w-4 h-4 text-primary" />,
  Display: <FiMonitor className="w-4 h-4 text-blue-500" />,
  "Battery & Power": <FiBatteryCharging className="w-4 h-4 text-emerald-500" />,
  "Camera & Audio": <FiCamera className="w-4 h-4 text-purple-500" />,
  "Connectivity & Ports": <FiWifi className="w-4 h-4 text-sky-500" />,
  "Physical & Build": <FiBox className="w-4 h-4 text-amber-500" />,
  "General & System": <FiSettings className="w-4 h-4 text-indigo-500" />,
};

export function CompareSpecGroups({
  products,
  differencesOnly,
}: CompareSpecGroupsProps) {
  const groups: NormalizedSpecGroup[] = groupProductSpecifications(products);

  // Default all groups to expanded
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const expandAll = () => setCollapsedGroups({});
  const collapseAll = () => {
    const allCollapsed = groups.reduce((acc, g) => ({ ...acc, [g.groupName]: true }), {});
    setCollapsedGroups(allCollapsed);
  };

  if (!products || products.length < 2) return null;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2">
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-primary" />
          Technical Specifications Breakdown
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="text-primary hover:underline font-bold"
          >
            Expand All
          </button>
          <span className="text-border">|</span>
          <button
            onClick={collapseAll}
            className="text-muted hover:text-foreground font-semibold"
          >
            Collapse All
          </button>
        </div>
      </div>

      {groups.map((group) => {
        const isCollapsed = collapsedGroups[group.groupName];

        // Filter specs if differencesOnly is active
        const displayedSpecs = differencesOnly
          ? group.specs.filter((s) => s.isDifferent)
          : group.specs;

        if (displayedSpecs.length === 0) return null;

        const icon = CATEGORY_ICONS[group.groupName] || <FiSettings className="w-4 h-4 text-primary" />;

        return (
          <div
            key={group.groupName}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all"
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleGroup(group.groupName)}
              className="w-full px-6 py-4 bg-muted-bg/50 hover:bg-muted-bg/70 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shadow-xs">
                  {icon}
                </div>
                <h4 className="font-extrabold text-sm text-foreground">
                  {group.groupName}
                </h4>
                <span className="text-xs text-muted font-medium">
                  ({displayedSpecs.length} attributes)
                </span>
              </div>

              <div className="p-1 rounded-lg text-muted">
                {isCollapsed ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
              </div>
            </button>

            {/* Accordion Body */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-border/60">
                    {displayedSpecs.map((spec) => (
                      <tr
                        key={spec.key}
                        className={`hover:bg-muted-bg/30 transition-colors ${
                          spec.isDifferent ? "bg-primary/[0.02]" : ""
                        }`}
                      >
                        <td className="p-4 font-bold text-foreground w-52 bg-muted-bg/15">
                          <div className="flex items-center gap-1.5">
                            <span>{spec.label}</span>
                            {spec.isDifferent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Different between products" />
                            )}
                          </div>
                        </td>

                        {products.map((p) => {
                          const val = spec.values[p.id] || "Not specified";
                          const isMissing = val === "Not specified";
                          return (
                            <td key={p.id} className="p-4 font-medium text-foreground">
                              {isMissing ? (
                                <span className="text-muted italic text-[11px] flex items-center gap-1">
                                  <FiMinus className="w-3 h-3 opacity-40" /> Not specified
                                </span>
                              ) : (
                                <span className={spec.isDifferent ? "font-bold text-foreground" : ""}>
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
