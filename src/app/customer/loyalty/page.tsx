"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getLoyaltyStatus, getLoyaltyTransactions, redeemPoints, LoyaltyStatus } from "@/lib/api/customer-features";

export default function LoyaltyPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<LoyaltyStatus | null>(null);
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; points: number; description: string; balanceAfter: number; createdAt: string }>>([]);
  const [redeemAmount, setRedeemAmount] = useState(100);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getLoyaltyStatus().then(setLoyalty).catch(() => {});
    getLoyaltyTransactions().then(setTransactions).catch(() => {});
  }, [session, isPending]);

  async function handleRedeem() {
    await redeemPoints(redeemAmount, "coupon");
    getLoyaltyStatus().then(setLoyalty).catch(() => {});
    getLoyaltyTransactions().then(setTransactions).catch(() => {});
  }

  const levelColors = { bronze: "bg-amber-600", silver: "bg-gray-400", gold: "bg-yellow-500", platinum: "bg-purple-500" };

  const links = [
    { label: "Loyalty & Rewards", href: "/customer/loyalty", icon: "🏆", description: "Points & rewards" },
    { label: "Savings", href: "/customer/savings", icon: "💸", description: "Your savings overview" },
    { label: "Vouchers", href: "/customer/vouchers", icon: "🎟️", description: "Voucher wallet" },
    { label: "Profile", href: "/customer/profile-preferences", icon: "🧠", description: "Shopping profile" },
  ];

  return (
    <DashboardShell title="Loyalty & Rewards" subtitle="Earn points and unlock exclusive benefits" role="Customer" links={links}>
      <div className="space-y-6">
        {loyalty && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon="🏆" value={loyalty.level.toUpperCase()} label="Current Level" note={`${loyalty.progress}% to ${loyalty.nextLevel || "max"}`} />
              <StatCard icon="⭐" value={String(loyalty.availablePoints)} label="Available Points" note={`Lifetime: ${loyalty.lifetimePoints}`} />
              <StatCard icon="📈" value={String(loyalty.lifetimePoints)} label="Lifetime Points" note="Total earned" />
            </div>

            <Panel title="Level Progress">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {(["bronze", "silver", "gold", "platinum"] as const).map((level) => (
                    <div key={level} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${loyalty.level === level ? levelColors[level] + " text-white" : "bg-muted-bg text-muted"}`}>
                      <span className="text-sm font-bold capitalize">{level}</span>
                    </div>
                  ))}
                </div>
                <div className="h-3 rounded-full bg-muted-bg">
                  <div className={`h-3 rounded-full ${levelColors[loyalty.level]}`} style={{ width: `${loyalty.progress}%` }} />
                </div>
                {loyalty.nextLevel && (
                  <p className="text-sm text-muted">{loyalty.nextThreshold! - loyalty.lifetimePoints} points needed to reach {loyalty.nextLevel}</p>
                )}
              </div>
            </Panel>

            <Panel title="Level Benefits">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(loyalty.benefits).map(([level, benefits]) => (
                  <div key={level} className={`rounded-xl border p-4 ${loyalty.level === level ? "border-primary bg-primary/5" : "border-border"}`}>
                    <h4 className="mb-2 text-sm font-bold capitalize text-text">{level}</h4>
                    <ul className="space-y-1">
                      {benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted">
                          <span className="text-primary">✓</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Redeem Points">
              <div className="flex items-center gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Points to Redeem</label>
                  <input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(Number(e.target.value))} min={100} step={100} className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <button onClick={handleRedeem} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">
                  Redeem for Coupon
                </button>
              </div>
            </Panel>

            <Panel title="Transaction History">
              <div className="space-y-2">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg bg-muted-bg p-3">
                    <div>
                      <p className="text-sm font-bold text-text">{tx.description}</p>
                      <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.points > 0 ? "text-success" : "text-error"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
