"use client";

import { PurchaseOrderProposal } from "@/lib/api/demandiq";
import {
  X,
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Building,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/context/ToastContext";
import { InfoTooltip } from "./InfoTooltip";

interface Props {
  po: PurchaseOrderProposal | null;
  onClose: () => void;
}

export function PurchaseOrderModal({ po, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!po) return null;

  const handleCopy = () => {
    const text = `SHOPNEST DEMANDIQ PURCHASE ORDER
PO Number: ${po.poNumber}
Generated: ${new Date(po.createdAt).toLocaleDateString()}
Target SLA: ${po.targetServiceLevel}
Store: ${po.storeName}
Total Units: ${po.totalUnitsToOrder}
Estimated Investment: $${po.totalEstimatedInvestment.toLocaleString()}
Protected Revenue: $${po.totalProtectedRevenue.toLocaleString()}

ITEMS:
${po.items
  .map(
    (it) =>
      `- [${it.sku}] ${it.title} | Reorder: ${it.suggestedReorderQty} units | Est Cost: $${it.lineTotal.toLocaleString()}`
  )
  .join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Purchase Order copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(po, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${po.poNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("PO downloaded as JSON!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {po.poNumber}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                SLA: {po.targetServiceLevel}
                <InfoTooltip
                  title="Target SLA Fulfillment"
                  description="Ensures statistically that 98% of incoming customer demand can be fulfilled immediately without backorders."
                />
              </span>
            </div>
            <h3 className="mt-1 font-black text-foreground text-base sm:text-lg">
              Official Replenishment Purchase Order
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated EOQ replenishment proposal calculated by DemandIQ Inventory Engine.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* PO Meta Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/30 border border-border/40 rounded-2xl p-3.5">
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Store</span>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1.5 truncate">
                <Building className="h-3 w-3 text-indigo-400 shrink-0" />
                <span className="truncate">{po.storeName}</span>
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Generated Date</span>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-indigo-400 shrink-0" />
                <span>{new Date(po.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                <span>Lead Time SLA</span>
                <InfoTooltip
                  title="Lead Time Assumption"
                  description="Estimated number of days from PO issuance to vendor delivery at warehouse."
                />
              </span>
              <p className="font-bold text-foreground mt-0.5">{po.leadTimeAssumptionDays} Days Cycle</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Valid Until</span>
              <p className="font-bold text-foreground mt-0.5">{po.validUntil}</p>
            </div>
          </div>

          {/* Items: Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-muted/40 text-[10px] uppercase text-muted-foreground text-left">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Title</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-center">Velocity</th>
                  <th className="p-3 text-center text-indigo-400 font-bold">Suggested Qty</th>
                  <th className="p-3 text-right">Unit Cost</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {po.items.map((it) => (
                  <tr key={it.productId} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-bold text-indigo-400">{it.sku}</td>
                    <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{it.title}</td>
                    <td className="p-3 text-center font-mono">{it.currentStock}</td>
                    <td className="p-3 text-center font-mono text-muted-foreground">{it.dailyVelocity}u/d</td>
                    <td className="p-3 text-center font-mono font-black text-indigo-400 bg-indigo-500/10">
                      +{it.suggestedReorderQty}
                    </td>
                    <td className="p-3 text-right font-mono">${it.estimatedUnitCost}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ${it.lineTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Items: Mobile Card View */}
          <div className="block sm:hidden space-y-2.5">
            {po.items.map((it) => (
              <div
                key={it.productId}
                className="rounded-xl border border-border/40 bg-card/70 p-3 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 font-bold text-[11px]">{it.sku}</span>
                  <span className="font-mono font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[11px]">
                    Reorder: +{it.suggestedReorderQty} units
                  </span>
                </div>
                <p className="font-medium text-foreground text-xs truncate">{it.title}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  <span>Stock: {it.currentStock} ({it.dailyVelocity}u/d)</span>
                  <span className="font-bold text-foreground font-mono">
                    Total: ${it.lineTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-foreground">Protected Revenue:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +${po.totalProtectedRevenue.toLocaleString()}
                </span>
                <InfoTooltip
                  title="Protected Revenue"
                  description="Estimated future revenue secured by executing this reorder before stock depletion."
                />
              </div>
              <p className="text-[11px] text-muted-foreground">{po.notes}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold block">
                Total Estimated Investment
              </span>
              <p className="text-xl sm:text-2xl font-black text-foreground font-mono">
                ${po.totalEstimatedInvestment.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">
                Total {po.totalUnitsToOrder} Units
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-border/40 pt-4 text-xs shrink-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-card px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-card px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 font-semibold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Purchase Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
