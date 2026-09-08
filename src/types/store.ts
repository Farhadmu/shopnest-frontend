export type Product = {
  _id?: string;
  name: string;
  price: number | string;
  image: string;
};

export type Store = {
  _id?: string;
  id?: string;

  name: string;
  category: string;
  filterCategory: string;

  rating: number | string;
  sales: string;
  salesNumber: number;

  response: string;

  logo: string;
  desc: string;

  products: Product[];
};