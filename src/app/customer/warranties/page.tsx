"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getWarranties } from "@/lib/api/customer-features";
import { getPurchaseVault } from "@/lib/api/customer-features";

export default function WarrantyVaultPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [warranties, setWarranties] = useState<Array<{ orderId: string; productId: string; productTitle: string; category: string; purchaseDate: string; warrantyDuration: string; warrantyExpiry: string; sellerId: string; status: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ id: string; orderId: string; type: string; title: string; documentNumber: string; issueDate: string; sellerName: string; totalAmount: number }>>([]);
  const [activeTab, setActiveTab] = useState<"warranties" | "vault">("warranties");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getWarranties().then(setWarranties).catch(() => {});
    getPurchaseVault().then(setDocuments).catch(() => {});
  }, [session, isPending]);

  const links = [
    { label: "Smart Wishlist", href: "/customer/wishlist", icon: "❤️", description: "Track prices & alerts" },
    { label: "Buy Again", href: "/customer/buy-again", icon: "🔁", description: "Quick reorder" },
    { label: "Warranties", href: "/customer/warranties", icon: "🛠️", description: "Warranty manager" },
    { label: "Returns", href: "/customer/returns", icon: "🔄", description: "Return center" },
  ];

  return (
    <DashboardShell title="Warranty & Purchase Vault" subtitle="Manage warranties and access purchase documents" role="Customer" links={links}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("warranties")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "warranties" ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
            Warranty Manager
          </button>
          <button onClick={() => setActiveTab("vault")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "vault" ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
            Purchase Vault
          </button>
        </div>

        {activeTab === "warranties" && (
          <Panel title="Warranty Manager">
            <div className="space-y-3">
              {warranties.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted">No warranties found. Warranties are added after delivery.</div>
              ) : (
                warranties.map((w, i) => {
                  const daysLeft = Math.ceil((new Date(w.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-text">{w.productTitle}</h4>
                          <p className="text-xs text-muted">{w.category} • Purchased: {new Date(w.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`rounded-lg px-2 py-1 text-xs font-bold ${daysLeft > 30 ? "bg-success/10 text-success" : daysLeft > 0 ? "bg-warning/10 text-warning" : "bg-error/10 text-error"}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                        <span>Warranty: {w.warrantyDuration}</span>
                        <span>Expires: {new Date(w.warrantyExpiry).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        )}

        {activeTab === "vault" && (
          <Panel title="Digital Purchase Vault">
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted">No documents available yet. Documents are generated after purchase.</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                        {doc.type === "invoice" ? "🧾" : doc.type === "warranty" ? "🛡️" : doc.type === "receipt" ? "📄" : "🏷️"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text">{doc.title}</h4>
                        <p className="text-xs text-muted">{doc.documentNumber} • {doc.sellerName}</p>
                        <p className="text-xs text-muted">{new Date(doc.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">৳{doc.totalAmount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
