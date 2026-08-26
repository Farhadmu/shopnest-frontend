export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string;
  image?: string;       
  images?: string[];
  rating?: number;
}
