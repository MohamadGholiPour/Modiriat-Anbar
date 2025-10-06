export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes?: string;
  isFavorite: boolean;
  lowStockThreshold: number;
  imageUrl?: string;
  barcode?: string;
}

export enum SortOption {
  Name = 'name',
  Category = 'category',
  QuantityAsc = 'quantity-asc',
  QuantityDesc = 'quantity-desc',
  Favorites = 'favorites',
}
