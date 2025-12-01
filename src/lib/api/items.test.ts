import {
  DeliveryMethod,
  DeliveryScope,
  ItemCategory,
  ItemCondition,
  ItemStatus,
} from "@/types/item";
import { describe, expect, it, vi } from "vitest";
import { api } from "../api";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  getUserItems,
  incrementItemView,
  searchItems,
  updateItem,
  uploadImage,
} from "./items";

// Mock the api module
vi.mock("../api");

describe("Items API", () => {
  const mockItem = {
    id: "item1",
    title: "Test Item",
    description: "Test description",
    condition: "NEW",
    category: "ELECTRONICS",
    status: "AVAILABLE",
    deliveryMethods: ["PHYSICAL"],
    deliveryScope: "LOCAL",
    estimatedValue: 100,
    currency: "EUR",
    viewCount: 0,
    likesCount: 0,
    commentsCount: 0,
    images: [],
    owner: {
      id: "user1",
      username: "testuser",
      avatarUrl: null,
      reputationScore: 100,
      isVerified: true,
    },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  describe("getItems", () => {
    it("should fetch items list", async () => {
      const mockResponse = {
        data: {
          items: [mockItem],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getItems();

      expect(api.get).toHaveBeenCalledWith("/items?");
      expect(result).toEqual(mockResponse.data);
    });

    it("should fetch items with filters", async () => {
      const mockResponse = {
        data: {
          items: [mockItem],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const filters = {
        category: ItemCategory.ELECTRONICS,
        search: "laptop",
        page: 1,
        limit: 10,
      };

      await getItems(filters);

      expect(api.get).toHaveBeenCalled();
    });
  });

  describe("getItemById", () => {
    it("should fetch item by id", async () => {
      const mockResponse = { data: mockItem };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getItemById("item1");

      expect(api.get).toHaveBeenCalledWith("/items/item1");
      expect(result).toEqual(mockItem);
    });
  });

  describe("createItem", () => {
    it("should create a new item", async () => {
      const newItem = {
        title: "New Item",
        description: "New description",
        condition: ItemCondition.NEW,
        category: ItemCategory.ELECTRONICS,
        deliveryMethods: [DeliveryMethod.PHYSICAL],
        deliveryScope: DeliveryScope.LOCAL,
        estimatedValue: 150,
        currency: "EUR",
        images: [],
      };

      const mockResponse = { data: { ...mockItem, ...newItem } };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await createItem(newItem);

      expect(api.post).toHaveBeenCalledWith("/items", newItem);
      expect(result.title).toBe(newItem.title);
    });
  });

  describe("updateItem", () => {
    it("should update an existing item", async () => {
      const updates = {
        title: "Updated Title",
      };

      const mockResponse = { data: { ...mockItem, ...updates } };

      vi.mocked(api.patch).mockResolvedValue(mockResponse);

      const result = await updateItem("item1", updates);

      expect(api.patch).toHaveBeenCalledWith("/items/item1", updates);
      expect(result.title).toBe(updates.title);
    });
  });

  describe("deleteItem", () => {
    it("should delete an item", async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });

      await deleteItem("item1");

      expect(api.delete).toHaveBeenCalledWith("/items/item1");
    });
  });

  describe("getUserItems", () => {
    it("should fetch items by user ID", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getUserItems("user123");

      expect(api.get).toHaveBeenCalledWith("/items/user/user123");
      expect(result.items).toEqual([mockItem]);
      expect(result.total).toBe(1);
    });

    it("should fetch items by user ID with filters", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await getUserItems("user123", {
        status: ItemStatus.AVAILABLE,
        page: 1,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        "/items/user/user123?status=AVAILABLE&page=1&limit=10",
      );
    });

    it("should fetch items with status only", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await getUserItems("user123", {
        status: ItemStatus.AVAILABLE,
      });

      expect(api.get).toHaveBeenCalledWith(
        "/items/user/user123?status=AVAILABLE",
      );
    });

    it("should fetch items with page only", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await getUserItems("user123", {
        page: 2,
      });

      expect(api.get).toHaveBeenCalledWith("/items/user/user123?page=2");
    });

    it("should fetch items with limit only", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await getUserItems("user123", {
        limit: 5,
      });

      expect(api.get).toHaveBeenCalledWith("/items/user/user123?limit=5");
    });
  });

  describe("searchItems", () => {
    it("should search items by query", async () => {
      const mockResponse = {
        data: {
          items: [mockItem],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await searchItems("laptop");

      expect(api.get).toHaveBeenCalled();
      expect(result.items).toEqual([mockItem]);
    });
  });

  describe("uploadImage", () => {
    it("should upload an image file", async () => {
      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const mockResponse = {
        data: {
          images: [
            {
              url: "https://cloudinary.com/image.jpg",
              publicId: "image123",
              width: 800,
              height: 600,
            },
          ],
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await uploadImage(file);

      expect(api.post).toHaveBeenCalledWith(
        "/upload/images",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      expect(result.url).toBe("https://cloudinary.com/image.jpg");
      expect(result.publicId).toBe("image123");
    });
  });

  describe("incrementItemView", () => {
    it("should increment view count silently", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: undefined });

      await incrementItemView("item1");

      expect(api.post).toHaveBeenCalledWith("/items/item1/view");
    });

    it("should fail silently if endpoint not implemented", async () => {
      vi.mocked(api.post).mockRejectedValue(new Error("Not implemented"));

      // Should not throw
      await expect(incrementItemView("item1")).resolves.toBeUndefined();
    });
  });

  describe("getItems with userId filter", () => {
    it("should use user endpoint when userId is provided", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getItems({ userId: "user123" });

      expect(api.get).toHaveBeenCalledWith("/items/user/user123");
      expect(result.items).toEqual([mockItem]);
    });

    it("should include filters with userId", async () => {
      const mockResponse = {
        data: [mockItem],
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await getItems({
        userId: "user123",
        status: ItemStatus.AVAILABLE,
        page: 2,
      });

      expect(api.get).toHaveBeenCalledWith(
        "/items/user/user123?status=AVAILABLE&page=2",
      );
    });
  });
});
