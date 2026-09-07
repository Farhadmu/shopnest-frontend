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

/** A category node once the flat list has been assembled into a tree. */
export interface CategoryNode extends CategoryItem {
  children: CategoryNode[];
}

/**
 * Converts the flat `parent`-referencing array the API sends into a nested
 * tree with `children` arrays — the single recursive utility every nested
 * view (navbar mega menu, product filters, etc.) should build on.
 *
 * Orphans (a `parent` id that isn't in the list, e.g. deleted-but-cached
 * data) are treated as root nodes instead of being silently dropped.
 */
export function buildCategoryTree(items: CategoryItem[]): CategoryNode[] {
  const nodeById = new Map<string, CategoryNode>();
  items.forEach((c) => nodeById.set(idOf(c), { ...c, children: [] }));

  const roots: CategoryNode[] = [];
  nodeById.forEach((node) => {
    const parentId = node.parent ? String(node.parent) : null;
    const parentNode = parentId ? nodeById.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/** Depth-first flattening of a tree, each entry paired with its depth
 * (0 = root). Useful for rendering an indented `<select>` or filter list
 * keyed by name rather than id. */
export function flattenWithDepth(items: CategoryItem[]): { category: CategoryItem; depth: number }[] {
  const tree = buildCategoryTree(items);
  const out: { category: CategoryItem; depth: number }[] = [];
  const walk = (nodes: CategoryNode[], depth: number) => {
    nodes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((node) => {
        out.push({ category: node, depth });
        walk(node.children, depth + 1);
      });
  };
  walk(tree, 0);
  return out;
}

/** Flat option list for a `<select>`, each entry prefixed to show depth —
 * e.g. root category "Electronics" then its child as "— Phones". */
export function indentedOptionsFor(
  items: CategoryItem[],
  excludeId?: string
): { id: string; label: string }[] {
  const allowed = parentOptionsFor(items, excludeId);
  const allowedIds = new Set(allowed.map(idOf));
  const tree = buildCategoryTree(allowed);

  const out: { id: string; label: string }[] = [];
  const walk = (nodes: CategoryNode[], depth: number) => {
    nodes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((node) => {
        if (allowedIds.has(idOf(node))) {
          out.push({ id: idOf(node), label: `${"— ".repeat(depth)}${node.name}` });
        }
        walk(node.children, depth + 1);
      });
  };
  walk(tree, 0);
  return out;
}