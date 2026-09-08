"use client";

import { useState } from "react";
import { updateUserProfile, UserProfile } from "@/lib/api/users";
import { X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export default function EditProfileModal({
  profile,
  onClose,
  onSuccess,
}: {
  profile: UserProfile | null;
  onClose: () => void;
  onSuccess: (updated: UserProfile) => void;
}) {
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatar, setAvatar] = useState(profile?.avatarUrl || profile?.image || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.success) {
        setAvatar(data.data.url);
        setMsg("Avatar uploaded successfully!");
        setIsSuccessMsg(true);
      } else {
        setMsg("Image upload failed.");
        setIsSuccessMsg(false);
      }
    } catch {
      setMsg("Network error during upload.");
      setIsSuccessMsg(false);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const updated = await updateUserProfile({ name, phone, avatarUrl: avatar });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to update profile.");
      setIsSuccessMsg(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface p-6 md:p-8 shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-muted hover:bg-muted-bg hover:text-text transition"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-black tracking-tight text-text">Edit Profile Credentials</h3>
        <p className="mt-1 text-xs text-muted mb-6">Modify your name, phone number, or upload a new avatar image.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted mb-1.5">Email Address (Locked)</label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full rounded-2xl border border-border/50 bg-muted-bg/50 px-4 py-3 text-sm opacity-60 cursor-not-allowed text-text"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXXXXXXXX"
              className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted mb-1.5">Profile Avatar</label>
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted-bg/30 p-4 text-center cursor-pointer hover:border-primary/50 transition">
              <UploadCloud className="text-primary mb-1" size={24} />
              <span className="text-xs font-bold text-text">Click to upload new avatar</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {uploading && <p className="text-xs text-primary font-medium mt-1 animate-pulse">Uploading image...</p>}
          </div>

          {msg && (
            <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${isSuccessMsg ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {isSuccessMsg ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{msg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-xs font-bold bg-muted-bg text-muted hover:bg-border/60 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="rounded-2xl px-6 py-3 text-xs font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}