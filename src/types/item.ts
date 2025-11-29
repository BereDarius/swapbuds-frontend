/**
 * Item Types and Interfaces
 *
 * Type definitions for items, categories, conditions, and related DTOs.
 * Matches backend Prisma schema for consistency.
 */

/**
 * Item categories
 */
export enum ItemCategory {
  ELECTRONICS = "ELECTRONICS",
  CLOTHING = "CLOTHING",
  BOOKS = "BOOKS",
  SPORTS = "SPORTS",
  HOME = "HOME",
  TOYS = "TOYS",
  COLLECTIBLES = "COLLECTIBLES",
  OTHER = "OTHER",
}

/**
 * Item condition
 */
export enum ItemCondition {
  NEW = "NEW",
  LIKE_NEW = "LIKE_NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

/**
 * Item status
 */
export enum ItemStatus {
  AVAILABLE = "AVAILABLE",
  IN_TRADE = "IN_TRADE",
  TRADED = "TRADED",
  UNAVAILABLE = "UNAVAILABLE",
}

/**
 * Delivery methods
 */
export enum DeliveryMethod {
  PHYSICAL = "PHYSICAL", // In-person exchange
  MAIL = "MAIL", // Postal service
}

/**
 * Delivery scope
 */
export enum DeliveryScope {
  LOCAL = "LOCAL", // Within same city/region
  NATIONAL = "NATIONAL", // Within country
  INTERNATIONAL = "INTERNATIONAL", // Worldwide
}

/**
 * Item image
 */
export interface ItemImage {
  id: string;
  url: string;
  publicId: string; // Cloudinary public ID
  order: number;
  itemId: string;
  createdAt: string;
}

/**
 * Item owner summary (minimal user data for item display)
 */
export interface ItemOwner {
  id: string;
  username: string;
  avatarUrl: string | null;
  reputationScore: number;
  isVerified: boolean;
}

/**
 * Item entity
 */
export interface Item {
  id: string;
  title: string;
  description: string;
  condition: ItemCondition;
  category: ItemCategory;
  status: ItemStatus;
  deliveryMethods: DeliveryMethod[];
  deliveryScope: DeliveryScope;
  estimatedValue?: number;
  currency: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;

  // Relations (optional, loaded when needed)
  images: string[]; // Array of Cloudinary URLs
  owner: ItemOwner;
}

/**
 * Create item DTO
 */
export interface CreateItemDto {
  title: string;
  description: string;
  condition: ItemCondition;
  category: ItemCategory;
  deliveryMethods: DeliveryMethod[];
  deliveryScope: DeliveryScope;
  estimatedValue?: number;
  currency?: string;
  images?: string[]; // Cloudinary URLs after upload
}

/**
 * Update item DTO
 */
export interface UpdateItemDto {
  title?: string;
  description?: string;
  condition?: ItemCondition;
  category?: ItemCategory;
  status?: ItemStatus;
  deliveryMethods?: DeliveryMethod[];
  deliveryScope?: DeliveryScope;
  estimatedValue?: number;
  currency?: string;
  images?: string[]; // New images to add
  removeImageIds?: string[]; // Image IDs to remove
}

/**
 * Item filters for listing/search
 */
export interface ItemFilters {
  category?: ItemCategory;
  condition?: ItemCondition;
  status?: ItemStatus;
  userId?: string; // Filter by owner
  search?: string; // Search in title/description
  minValue?: number;
  maxValue?: number;
  deliveryScope?: DeliveryScope;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "viewCount" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated items response
 */
export interface PaginatedItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Category display info
 */
export const CATEGORY_INFO: Record<
  ItemCategory,
  { label: string; icon: string; description: string }
> = {
  [ItemCategory.ELECTRONICS]: {
    label: "Electronics",
    icon: "📱",
    description: "Phones, laptops, gadgets, accessories",
  },
  [ItemCategory.CLOTHING]: {
    label: "Clothing",
    icon: "👕",
    description: "Clothes, shoes, accessories",
  },
  [ItemCategory.BOOKS]: {
    label: "Books",
    icon: "📚",
    description: "Books, magazines, comics",
  },
  [ItemCategory.SPORTS]: {
    label: "Sports",
    icon: "⚽",
    description: "Sports equipment, fitness gear",
  },
  [ItemCategory.HOME]: {
    label: "Home",
    icon: "🏠",
    description: "Furniture, decor, appliances",
  },
  [ItemCategory.TOYS]: {
    label: "Toys",
    icon: "🧸",
    description: "Toys, games, puzzles",
  },
  [ItemCategory.COLLECTIBLES]: {
    label: "Collectibles",
    icon: "🎨",
    description: "Trading cards, figurines, memorabilia",
  },
  [ItemCategory.OTHER]: {
    label: "Other",
    icon: "📦",
    description: "Everything else",
  },
};

/**
 * Condition display info
 */
export const CONDITION_INFO: Record<
  ItemCondition,
  { label: string; description: string; color: string }
> = {
  [ItemCondition.NEW]: {
    label: "New",
    description: "Brand new, never used",
    color: "green",
  },
  [ItemCondition.LIKE_NEW]: {
    label: "Like New",
    description: "Barely used, excellent condition",
    color: "blue",
  },
  [ItemCondition.EXCELLENT]: {
    label: "Excellent",
    description: "Great condition with minimal wear",
    color: "cyan",
  },
  [ItemCondition.GOOD]: {
    label: "Good",
    description: "Used, good working condition",
    color: "yellow",
  },
  [ItemCondition.FAIR]: {
    label: "Fair",
    description: "Used with visible wear",
    color: "orange",
  },
  [ItemCondition.POOR]: {
    label: "Poor",
    description: "Heavy wear, may need repair",
    color: "red",
  },
};

/**
 * Delivery method display info
 */
export const DELIVERY_METHOD_INFO: Record<
  DeliveryMethod,
  { label: string; description: string; icon: string }
> = {
  [DeliveryMethod.PHYSICAL]: {
    label: "In Person",
    description: "Meet in person to exchange",
    icon: "🤝",
  },
  [DeliveryMethod.MAIL]: {
    label: "Mail",
    description: "Ship via postal service",
    icon: "📦",
  },
};

/**
 * Delivery scope display info
 */
export const DELIVERY_SCOPE_INFO: Record<
  DeliveryScope,
  { label: string; description: string }
> = {
  [DeliveryScope.LOCAL]: {
    label: "Local",
    description: "Within my city/region only",
  },
  [DeliveryScope.NATIONAL]: {
    label: "National",
    description: "Anywhere in my country",
  },
  [DeliveryScope.INTERNATIONAL]: {
    label: "International",
    description: "Worldwide",
  },
};
