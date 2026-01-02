export interface InventoryItem {
  id: string;
  image: string;
  description: string;
  category: string;
  scale: string;
  manufacturer: string;
  modelFirstYear?: number | null;
  modelNumber?: string | null;
  acquiredFrom?: string | null;
  acquiredDate?: string | null;
  condition?: string | null;
  collectionName?: string | null;
  storageLocation?: string | null;
  variation?: string | null;
  originalBox: boolean;
  originalValue?: number | null;
  estimatedValue?: number | null;
  created_timestamp: string;
  updated_timestamp: string;
}

export interface InventoryInput {
  image: string;
  description: string;
  category: string;
  scale: string;
  manufacturer: string;
  modelFirstYear: string;
  modelNumber: string;
  acquiredFrom: string;
  acquiredDate: string;
  condition: string;
  collectionName: string;
  storageLocation: string;
  variation: string;
  originalBox: boolean;
  originalValue: string;
  estimatedValue: string;
}

export interface Background {
  id: string;
  image: string;
}
