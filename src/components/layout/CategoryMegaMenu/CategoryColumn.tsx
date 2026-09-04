import Link from "next/link";
import { idOf, type CategoryNode } from "@/lib/utils/category-tree";

export function CategoryColumn({ node }: { node: CategoryNode }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/products?category=${encodeURIComponent(node.name)}`}
        className="mb-2 block truncate text-sm font-black text-text transition-colors hover:text-primary"
      >
        {node.name}
      </Link>
      {node.children.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {node.children.map((child) => (
            <li key={idOf(child)} className="min-w-0">
              <Link
                href={`/products?category=${encodeURIComponent(child.name)}`}
                className="block truncate text-xs font-medium text-muted transition hover:text-primary"
              >
                {child.name}
              </Link>

              {child.children.length > 0 && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-border pl-2">
                  {child.children.map((grandchild) => (
                    <li key={idOf(grandchild)} className="min-w-0">
                      <Link
                        href={`/products?category=${encodeURIComponent(grandchild.name)}`}
                        className="block truncate text-[11px] font-medium text-muted/80 transition hover:text-primary"
                      >
                        {grandchild.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}