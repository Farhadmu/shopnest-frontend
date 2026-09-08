"use client";

import React, { useState, useEffect } from "react";
import { FiFolder, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import {
  getWishlistGroups,
  createWishlistGroup,
  deleteWishlistGroup,
  WishlistGroupItem,
} from "@/lib/api/customer-intelligence-features";

export function SmartWishlistGroups({
  selectedGroupId,
  onSelectGroup,
}: {
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
}) {
  const [groups, setGroups] = useState<WishlistGroupItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("🎮");

  const load = () => {
    getWishlistGroups()
      .then((res) => setGroups(res || []))
      .catch(() => setGroups([]));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await createWishlistGroup({
        name: newGroupName.trim(),
        icon: newGroupIcon,
      });
      setNewGroupName("");
      setShowCreate(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteWishlistGroup(id);
      if (selectedGroupId === id) onSelectGroup(null);
      load();
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <FiFolder className="text-primary" /> Wishlist Collections ({groups.length})
        </span>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          {showCreate ? "Cancel" : "+ New Collection"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-2 text-xs">
          <select
            value={newGroupIcon}
            onChange={(e) => setNewGroupIcon(e.target.value)}
            className="px-2 py-1.5 rounded-xl border border-border bg-surface text-base"
          >
            <option value="🎮">🎮</option>
            <option value="💻">💻</option>
            <option value="👗">👗</option>
            <option value="🎁">🎁</option>
            <option value="🏠">🏠</option>
            <option value="⭐">⭐</option>
          </select>
          <input
            type="text"
            placeholder="Collection name (e.g. Gaming Setup)..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="px-3 py-1.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectGroup(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedGroupId === null
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-muted hover:text-foreground border border-border"
          }`}
        >
          All Saved Items
        </button>

        {groups.map((grp) => (
          <button
            key={grp.id}
            type="button"
            onClick={() => onSelectGroup(grp.id)}
            className={`group px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedGroupId === grp.id
                ? "bg-primary text-white shadow-sm"
                : "bg-card text-muted hover:text-foreground border border-border"
            }`}
          >
            <span>{grp.icon}</span>
            <span>{grp.name}</span>
            <span
              onClick={(e) => handleDelete(grp.id, e)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 ml-1 text-xs"
              title="Delete Collection"
            >
              ×
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
