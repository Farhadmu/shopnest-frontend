export interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  parent?: string | null;
  is_locked?: boolean;
  assigned_seller_id?: string | null;
  image?: string;
}