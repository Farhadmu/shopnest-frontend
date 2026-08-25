import { clientFetch } from "@/lib/core/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

function normalize(raw: any): Category {
  return {
    id: raw._id || raw.id || raw.slug || raw.name,
    name: raw.name,
    slug: raw.slug || raw.name,
  };
}

export async function getCategories(): Promise<Category[]> {
  const res = await clientFetch<any>("/categories");
  const list = Array.isArray(res) ? res : res?.data ?? [];
  return list.map(normalize);
}
