"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiFolder, FiPlus } from "react-icons/fi";
import {
  getWishlistGroups,
  createWishlistGroup,
  deleteWishlistGroup,
  WishlistGroupItem,
} from "@/lib/api/customer-intelligence-features";

export function SmartWishlistGroups({
  selectedGroupId,
  onSelectGroup,
  onGroupsChange,
}: {
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onGroupsChange?: (groups: WishlistGroupItem[]) => void;
}) {
  const [groups, setGroups] = useState<WishlistGroupItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("🎮");
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(() => {
    getWishlistGroups()
      .then((res) => {
        const nextGroups = res || [];
        setGroups(nextGroups);
        onGroupsChange?.(nextGroups);
      })
      .catch(() => {
        setGroups([]);
        onGroupsChange?.([]);
      });
  }, [onGroupsChange]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;

    setCreateError(null);

    try {
      await createWishlistGroup({
        name: trimmedName,
        description: "Wishlist collection",
        icon: newGroupIcon,
        color: "#8b5cf6",
        productIds: [],
      });
      setNewGroupName("");
      setShowCreate(false);
      load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Collection could not be created.";
      setCreateError(message);
    }
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
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
          <FiFolder className="text-primary" /> Wishlist Collections ({groups.length})
        </span>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 text-xs font-black text-primary transition hover:text-primary-hover"
        >
          {showCreate ? "Cancel" : <><FiPlus size={13} /> New Collection</>}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-3 rounded-2xl bg-card border border-border flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
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
          </div>
          {createError && <p className="text-[11px] text-red-400">{createError}</p>}
        </form>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onSelectGroup(null)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
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
            className={`group px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
