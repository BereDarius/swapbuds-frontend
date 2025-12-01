/**
 * Items API Client
 *
 * API functions for item management including:
 * - Fetching items with filters and pagination
 * - Creating, updating, and deleting items
 * - Item detail retrieval
 * - Image upload to Cloudinary
 */

import {
  CloudinaryUploadResponse,
  CreateItemDto,
  Item,
  ItemFilters,
  PaginatedItemsResponse,
  UpdateItemDto,
} from "@/types/item";
import { api } from "../api";

/**
 * Fetch paginated list of items with optional filters
 *
 * @param filters - Filter and pagination options
 * @returns Promise with paginated items response
 *
 * @example
 * ```typescript
 * const { items, total } = await getItems({
 *   category: ItemCategory.ELECTRONICS,
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export const getItems = async (
  filters: ItemFilters = {}
): Promise<PaginatedItemsResponse> => {
  // If userId is specified, use the dedicated user items endpoint
  if (filters.userId) {
    const { userId, ...otherFilters } = filters;
    const params = new URLSearchParams();
    if (otherFilters.status) params.append("status", otherFilters.status);
    if (otherFilters.page) params.append("page", otherFilters.page.toString());
    if (otherFilters.limit)
      params.append("limit", otherFilters.limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/items/user/${userId}?${queryString}`
      : `/items/user/${userId}`;
    const response = await api.get<Item[]>(url);

    // Backend returns array, convert to paginated response
    return {
      items: response.data,
      total: response.data.length,
      page: otherFilters.page || 1,
      limit: otherFilters.limit || 20,
      totalPages: 1,
    };
  }

  const params = new URLSearchParams();

  // Add filters to query params
  if (filters.category) params.append("category", filters.category);
  if (filters.condition) params.append("condition", filters.condition);
  if (filters.status) params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);
  if (filters.minValue !== undefined)
    params.append("minValue", filters.minValue.toString());
  if (filters.maxValue !== undefined)
    params.append("maxValue", filters.maxValue.toString());
  if (filters.deliveryScope)
    params.append("deliveryScope", filters.deliveryScope);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await api.get<PaginatedItemsResponse>(
    `/items?${params.toString()}`
  );
  return response.data;
};

/**
 * Fetch a single item by ID
 *
 * @param id - Item ID
 * @returns Promise with item details
 *
 * @example
 * ```typescript
 * const item = await getItemById("cm3abc123");
 * ```
 */
export const getItemById = async (id: string): Promise<Item> => {
  const response = await api.get<Item>(`/items/${id}`);
  return response.data;
};

/**
 * Create a new item
 *
 * @param data - Item creation data
 * @returns Promise with created item
 *
 * @example
 * ```typescript
 * const item = await createItem({
 *   title: "iPhone 14",
 *   description: "Barely used",
 *   condition: ItemCondition.LIKE_NEW,
 *   category: ItemCategory.ELECTRONICS,
 *   deliveryMethods: [DeliveryMethod.PHYSICAL, DeliveryMethod.MAIL],
 *   deliveryScope: DeliveryScope.NATIONAL
 * });
 * ```
 */
export const createItem = async (data: CreateItemDto): Promise<Item> => {
  const response = await api.post<Item>("/items", data);
  return response.data;
};

/**
 * Update an existing item
 *
 * @param id - Item ID
 * @param data - Item update data
 * @returns Promise with updated item
 *
 * @example
 * ```typescript
 * const item = await updateItem("cm3abc123", {
 *   title: "Updated Title",
 *   status: ItemStatus.UNAVAILABLE
 * });
 * ```
 */
export const updateItem = async (
  id: string,
  data: UpdateItemDto
): Promise<Item> => {
  const response = await api.patch<Item>(`/items/${id}`, data);
  return response.data;
};

/**
 * Delete an item
 *
 * @param id - Item ID
 * @returns Promise that resolves when item is deleted
 *
 * @example
 * ```typescript
 * await deleteItem("cm3abc123");
 * ```
 */
export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};

/**
 * Upload image to Cloudinary
 *
 * @param file - Image file to upload
 * @returns Promise with Cloudinary response
 *
 * @example
 * ```typescript
 * const { url, publicId } = await uploadImage(file);
 * ```
 */
export const uploadImage = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append("files", file); // Backend expects 'files' field name

  const response = await api.post<{ images: CloudinaryUploadResponse[] }>(
    "/upload/images", // Backend endpoint is plural
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // Return first image since we only upload one
  return response.data.images[0];
};

/**
 * Delete image from Cloudinary
 *
 * @param publicId - Cloudinary public ID
 * @returns Promise that resolves when image is deleted
 *
 * @example
 * ```typescript
 * await deleteImage("items/abc123");
 * ```
 *
 * @note Currently not implemented - images are deleted when items are deleted
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  // TODO: Implement delete endpoint in backend if needed
  // For now, images are cleaned up when items are deleted
  console.warn("Image delete endpoint not yet implemented:", publicId);
};

/**
 * Increment view count for an item
 *
 * @param id - Item ID
 * @returns Promise that resolves when view is recorded
 *
 * @example
 * ```typescript
 * await incrementItemView("cm3abc123");
 * ```
 *
 * @note Backend endpoint not yet implemented - fails silently
 */
export const incrementItemView = async (id: string): Promise<void> => {
  try {
    await api.post(`/items/${id}/view`);
  } catch {
    // Endpoint not implemented yet - fail silently
    console.debug("View tracking not available:", id);
  }
};

/**
 * Get items by a specific user
 *
 * @param userId - User ID
 * @param filters - Additional filters
 * @returns Promise with paginated items response
 *
 * @example
 * ```typescript
 * const { items } = await getUserItems("user123", { page: 1, limit: 20 });
 * ```
 */
export const getUserItems = async (
  userId: string,
  filters: Omit<ItemFilters, "userId"> = {}
): Promise<PaginatedItemsResponse> => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/items/user/${userId}?${queryString}`
    : `/items/user/${userId}`;
  const response = await api.get<Item[]>(url);

  // Backend returns array, convert to paginated response
  return {
    items: response.data,
    total: response.data.length,
    page: filters.page || 1,
    limit: filters.limit || 20,
    totalPages: 1,
  };
};

/**
 * Search items by query
 *
 * @param query - Search query
 * @param filters - Additional filters
 * @returns Promise with paginated items response
 *
 * @example
 * ```typescript
 * const { items } = await searchItems("iPhone", { category: ItemCategory.ELECTRONICS });
 * ```
 */
export const searchItems = async (
  query: string,
  filters: Omit<ItemFilters, "search"> = {}
): Promise<PaginatedItemsResponse> => {
  return getItems({ ...filters, search: query });
};
