/**
 * Types for the seller Add/Edit Product form.
 */

export interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
}

export interface VariantRow {
  id: string;
  name: string;
  swatch: string;
  stock: string;
  priceDelta: string;
}

export interface SpecRow {
  id: string;
  key: string;
  value: string;
}

export interface ProductFormState {
  title: string;
  category: string;
  brand: string;
  model: string;
  masterSku: string;
  price: string;
  discountPrice: string;
  stock: string;
  lowStockAlert: string;
  barcode: string;
  warranty: string;
  escrow: string;
  codEnabled: boolean;
  expressDispatch: boolean;
  description: string;
  tagsInput: string;
}