"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getShoppingProfile, updateShoppingProfile, resetShoppingProfile, deletePersonalizationData, ShoppingProfile } from "@/lib/api/customer-features";

export default function ProfilePreferencesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ShoppingProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<ShoppingProfile>>({});

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getShoppingProfile().then((data) => { setProfile(data); setForm(data); }).catch(() => {});
  }, [session, isPending]);

  async function handleSave() {
    await updateShoppingProfile(form);
    setProfile({ ...profile!, ...form });
    setEditMode(false);
  }

  async function handleReset() {
    await resetShoppingProfile();
    getShoppingProfile().then(setProfile).catch(() => {});
  }

  async function handleDeleteData() {
    if (confirm("This will delete all your personalization data. Continue?")) {
      await deletePersonalizationData();
      getShoppingProfile().then(setProfile).catch(() => {});
    }
  }

  const categories = ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports", "Books", "Gadgets", "Health"];
  const brands = ["Apple", "Samsung", "Xiaomi", "Sony", "Nike", "Adidas", "HP", "Dell"];

  const links = [
    { label: "Security Center", href: "/customer/security", icon: "🔐", description: "Account security" },
    { label: "Activity Timeline", href: "/customer/activity", icon: "🧑‍💻", description: "Account activity" },
    { label: "Notifications", href: "/customer/notifications", icon: "🔔", description: "Notification center" },
    { label: "Profile", href: "/customer/profile-preferences", icon: "🧠", description: "Shopping profile" },
  ];

  return (
    <DashboardShell title="Personal Shopping Profile" subtitle="Help us understand your preferences for better recommendations" role="Customer" links={links}>
      <div className="space-y-6">
        {profile && (
          <>
            <Panel title="Shopping Preferences">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-muted">Preferred Categories</label>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => { const cats = form.preferredCategories || []; setForm({ ...form, preferredCategories: cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat] }); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${form.preferredCategories?.includes(cat) ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredCategories.length > 0 ? profile.preferredCategories.map((cat) => (
                        <span key={cat} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">{cat}</span>
                      )) : <span className="text-sm text-muted">No preferences set</span>}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted">Typical Budget (৳)</label>
                    {editMode ? (
                      <div className="flex gap-2">
                        <input type="number" value={form.typicalBudgetMin || 0} onChange={(e) => setForm({ ...form, typicalBudgetMin: Number(e.target.value) })} placeholder="Min" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                        <input type="number" value={form.typicalBudgetMax || 50000} onChange={(e) => setForm({ ...form, typicalBudgetMax: Number(e.target.value) })} placeholder="Max" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-text">৳{profile.typicalBudgetMin.toLocaleString()} - ৳{profile.typicalBudgetMax.toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted">Preferred Delivery</label>
                    {editMode ? (
                      <select value={form.preferredDelivery || "any"} onChange={(e) => setForm({ ...form, preferredDelivery: e.target.value as "standard" | "express" | "any" })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                        <option value="any">Any</option>
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-text capitalize">{profile.preferredDelivery}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-muted">Favorite Brands</label>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button key={brand} onClick={() => { const b = form.favoriteBrands || []; setForm({ ...form, favoriteBrands: b.includes(brand) ? b.filter((x) => x !== brand) : [...b, brand] }); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${form.favoriteBrands?.includes(brand) ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
                          {brand}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteBrands.length > 0 ? profile.favoriteBrands.map((brand) => (
                        <span key={brand} className="rounded-lg bg-muted-bg px-3 py-1.5 text-xs font-medium text-text">{brand}</span>
                      )) : <span className="text-sm text-muted">No brands selected</span>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">Save</button>
                      <button onClick={() => { setEditMode(false); setForm(profile); }} className="rounded-lg bg-muted-bg px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg/80">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setEditMode(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">Edit Preferences</button>
                  )}
                </div>
              </div>
            </Panel>

            <Panel title="Privacy Controls">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <h4 className="text-sm font-bold text-text">Allow Personalization</h4>
                    <p className="text-xs text-muted">Use your data for better recommendations</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-0.5 transition ${profile.allowPersonalization ? "bg-primary" : "bg-muted-bg"}`}>
                    <div className={`h-5 w-5 rounded-full bg-white transition ${profile.allowPersonalization ? "translate-x-5" : ""}`} />
                  </div>
                </div>
                <button onClick={handleReset} className="rounded-lg bg-warning/10 px-4 py-2 text-sm font-bold text-warning hover:bg-warning/20">
                  Reset All Preferences
                </button>
                <button onClick={handleDeleteData} className="rounded-lg bg-error/10 px-4 py-2 text-sm font-bold text-error hover:bg-error/20">
                  Delete Personalization Data
                </button>
              </div>
            </Panel>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
