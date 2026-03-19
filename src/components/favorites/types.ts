// =============================================
// FAVORITES TYPES
// =============================================

export type FavoriteItemType = 'drug' | 'herbal' | 'note';

export interface FavoriteDrug {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  drugClass: string | null;
  favoriteId: string;
  createdAt: string;
}

export interface FavoriteHerbal {
  id: string;
  name: string;
  latinName: string | null;
  category: string | null;
  benefit: string | null;
  favoriteId: string;
  createdAt: string;
}

export interface FavoriteNote {
  id: string;
  title: string;
  category: string | null;
  specialty: string | null;
  content: string;
  favoriteId: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  itemId: string;
  itemType: FavoriteItemType;
  createdAt: Date;
}

export interface FavoritesData {
  drugs: FavoriteDrug[];
  herbals: FavoriteHerbal[];
  notes: FavoriteNote[];
}