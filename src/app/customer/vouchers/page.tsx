"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getVoucherWallet, claimVoucher, VoucherWalletResult } from "@/lib/api/customer-features";

export default function VoucherWalletPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<VoucherWalletResult | null>(null);
  const [code, setCode] = useState("");
  const [claimMsg, setClaimMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getVoucherWallet().then(setWallet).catch(() => {});
  }, [session, isPending]);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    try {
      await claimVoucher(code);
      setClaimMsg("Coupon claimed successfully!");
      setCode("");
      getVoucherWallet().then(setWallet).catch(() => {});
    } catch {
      setClaimMsg("Invalid or expired coupon code");
    }
  }

  const links = [
    { label: "Savings", href: "/customer/savings", icon: "💸", description: "Your savings overview" },
    { label: "Analytics", href: "/customer/expense-analytics", icon: "📈", description: "Spending analytics" },
    { label: "Vouchers", href: "/customer/vouchers", icon: "🎟️", description: "Voucher wallet" },
    { label: "Payments", href: "/customer/payments", icon: "💳", description: "Payment center" },
  ];

  return (
    <DashboardShell title="Smart Voucher Wallet" subtitle="Manage your coupons and vouchers" role="Customer" links={links}>
      <div className="space-y-6">
        {wallet && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon="🎟️" value={String(wallet.totalAvailable)} label="Available" note="Ready to use" />
            <StatCard icon="⏰" value={String(wallet.expiringSoon.length)} label="Expiring Soon" note="Use them fast" />
            <StatCard icon="✅" value={String(wallet.totalUsed)} label="Used" note="Total redeemed" />
          </div>
        )}

        <Panel title="Claim Coupon">
          <form onSubmit={handleClaim} className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none" />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">Claim</button>
          </form>
          {claimMsg && <p className="mt-2 text-sm text-muted">{claimMsg}</p>}
        </Panel>

        {wallet && wallet.available.length > 0 && (
          <Panel title="Available Vouchers">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wallet.available.map((voucher) => (
                <div key={voucher.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{voucher.couponCode}</span>
                    <span className="text-xs text-muted">{voucher.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text">{voucher.title}</h4>
                  <p className="mt-1 text-xs text-muted">{voucher.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted">Min: ৳{voucher.minPurchase}</span>
                    <span className="font-medium text-primary">Expires: {new Date(voucher.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {wallet && wallet.expiringSoon.length > 0 && (
          <Panel title="Expiring Soon">
            <div className="space-y-2">
              {wallet.expiringSoon.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg bg-warning/10 p-3">
                  <div>
                    <span className="text-sm font-bold text-text">{v.title}</span>
                    <p className="text-xs text-muted">{v.couponCode}</p>
                  </div>
                  <span className="text-xs font-bold text-warning">Expires {new Date(v.expiresAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
