import type { CategoryItem } from "../../types/category";

export function idOf(c: CategoryItem): string {
  return String(c._id || c.id || "");
}

/**
 * `id` plus every one of its descendants. A category can never be set as
 * its own parent, directly or through a chain — offering those as options
 * would let the user create a loop. Mirrors the same guard enforced
 * server-side in category.controller.ts's `wouldCreateCycle`.
 */
export function getSelfAndDescendantIds(items: CategoryItem[], id: string): Set<string> {
  const result = new Set<string>([id]);
  let added = true;
  while (added) {
    added = false;
    for (const c of items) {
      const cid = idOf(c);
      const cParent = c.parent ? String(c.parent) : null;
      if (cParent && result.has(cParent) && !result.has(cid)) {
        result.add(cid);
        added = true;
      }
    }
  }
  return result;
}

/** Categories that are safe to offer as a parent. Pass `excludeId` when
 * editing an existing category so it can't become its own descendant. */
export function parentOptionsFor(items: CategoryItem[], excludeId?: string): CategoryItem[] {
  const blocked = excludeId ? getSelfAndDescendantIds(items, excludeId) : new Set<string>();
  return items.filter((c) => !blocked.has(idOf(c)));
}

export function categoryNameMap(items: CategoryItem[]): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((c) => map.set(idOf(c), c.name));
  return map;
}