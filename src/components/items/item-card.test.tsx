import {
  DeliveryMethod,
  DeliveryScope,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  type Item,
} from "@/types/item";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ItemCard } from "./item-card";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock OptimizedImage
vi.mock("@/components/optimized-image", () => ({
  OptimizedImage: ({ alt }: { alt: string; src: string }) => (
    <div role="img" aria-label={alt} />
  ),
}));

describe("ItemCard", () => {
  const mockItem: Item = {
    id: "item1",
    title: "Test Item",
    description: "Test description",
    condition: ItemCondition.NEW,
    category: ItemCategory.ELECTRONICS,
    estimatedValue: 100,
    currency: "EUR",
    images: ["/test-image.jpg"],
    status: ItemStatus.AVAILABLE,
    deliveryMethods: [DeliveryMethod.PHYSICAL],
    deliveryScope: DeliveryScope.LOCAL,
    viewCount: 10,
    likesCount: 5,
    commentsCount: 3,
    owner: {
      id: "user1",
      username: "testuser",
      avatarUrl: null,
      reputationScore: 100,
      isVerified: true,
    },
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  };

  it("should render item card with basic info", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    // Description is not rendered in ItemCard component
  });

  it("should render item image", () => {
    render(<ItemCard item={mockItem} />);

    const image = screen.getByRole("img", { name: "Test Item" });
    expect(image).toBeInTheDocument();
  });

  it("should render placeholder image when no images", () => {
    const itemWithoutImage = { ...mockItem, images: [] };
    render(<ItemCard item={itemWithoutImage} />);

    // Should show Package icon placeholder
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render condition badge", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render estimated value", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText(/€100/)).toBeInTheDocument();
  });

  it("should link to item detail page", () => {
    render(<ItemCard item={mockItem} />);

    const links = screen.getAllByRole("link");
    const itemLink = links.find(
      (link) => link.getAttribute("href") === "/items/item1",
    );
    expect(itemLink).toBeDefined();
  });

  it("should render category badge", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
  });

  it("should render status badge for non-available items", () => {
    const tradedItem: Item = { ...mockItem, status: ItemStatus.TRADED };
    render(<ItemCard item={tradedItem} />);

    expect(screen.getByText("Traded")).toBeInTheDocument();
  });

  it("should render owner information", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render engagement stats", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText("5")).toBeInTheDocument(); // likes
    expect(screen.getByText("3")).toBeInTheDocument(); // comments
  });

  it("should render list variant correctly", () => {
    render(<ItemCard item={mockItem} variant="list" />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });
});
