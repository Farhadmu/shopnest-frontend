export interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  parent?: string | null;
}